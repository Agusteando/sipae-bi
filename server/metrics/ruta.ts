import type { MetricDefinition, DatasetSchema } from "../dashboard/types";

const schema: DatasetSchema = {
  dims: [{ key: "observatorName" }],
  measures: [{ key: "quantity", format: "int" }]
};

type DailyRutaRow = {
  year: number;
  month: number;
  day: number;
  final_observations: string | null;
  school_id: string | number | null;
  observatorName: string;
  professor_fullname: string | null;
};

export default <MetricDefinition>{
  id: "ruta",
  label: "Ruta (conteo por observador)",
  params: [
    { key: "month", type: "number", required: true },
    { key: "year", type: "number", required: true }
  ],
  schema,
  async fetch({ params, mysql }) {
    const month = Number(params.month);
    const year = Number(params.year);

    // Pull rows (same table as your PHP)
    const sql = `SELECT * FROM daily_ruta WHERE month = ? AND year = ?`;
    const [rows] = await mysql.query<any[]>(sql, [month, year]);

    // Deduplicate exactly like PHP: by year, month, day, final_observations, school_id, observatorName, professor_fullname
    const seen = new Set<string>();
    const unique: DailyRutaRow[] = [];

    for (const r of rows as any[]) {
      const key = [
        r.year, r.month, r.day,
        r.final_observations ?? "",
        r.school_id ?? "",
        r.observatorName ?? "",
        r.professor_fullname ?? ""
      ].join("|");

      if (seen.has(key)) continue;
      seen.add(key);

      unique.push({
        year: Number(r.year),
        month: Number(r.month),
        day: Number(r.day),
        final_observations: r.final_observations ?? null,
        school_id: r.school_id ?? null,
        observatorName: String(r.observatorName ?? ""),
        professor_fullname: r.professor_fullname ?? null
      });
    }

    // Group quantity by observatorName
    const counts = new Map<string, number>();
    for (const r of unique) {
      const name = r.observatorName || "—";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    const out = Array.from(counts.entries())
      .map(([observatorName, quantity]) => ({ observatorName, quantity }))
      .sort((a, b) => b.quantity - a.quantity);

    return {
      metricId: "ruta",
      label: "Ruta (conteo por observador)",
      params: { month, year },
      schema,
      rows: out,
      meta: { generatedAt: new Date().toISOString(), source: "mysql" }
    };
  }
};
