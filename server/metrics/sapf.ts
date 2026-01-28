import type { MetricDefinition, DatasetSchema } from "../dashboard/types";

const schema: DatasetSchema = {
  dims: [{ key: "depto", label: "Departamento" }],
  measures: [{ key: "qty", label: "Cantidad", format: "int" }]
};

async function fetchCampus(mysql: any, mapCampus: string, dataCampus: string, start: string, end: string) {
  const sql = `
    SELECT
      t.department_name AS depto,
      CAST(SUM(COALESCE(t.fichas_qty, 0) + COALESCE(t.seguimiento_qty, 0)) AS UNSIGNED) AS qty
    FROM (
      SELECT
        COALESCE(dm.department_name, src.email) AS department_name,
        f.fichas_qty,
        s.seguimiento_qty
      FROM (
        SELECT d.email
        FROM deptos_map d
        WHERE d.campus = ?

        UNION

        SELECT DISTINCT fa.department_email AS email
        FROM fichas_atencion fa
        WHERE fa.school_code = ?
          AND fa.fecha >= ? AND fa.fecha < ?
          AND fa.department_email IS NOT NULL AND fa.department_email <> ''

        UNION

        SELECT DISTINCT se.department_email AS email
        FROM seguimiento se
        WHERE se.school_code = ?
          AND se.fecha >= ? AND se.fecha < ?
          AND se.department_email IS NOT NULL AND se.department_email <> ''
      ) src
      LEFT JOIN deptos_map dm
        ON dm.email = src.email AND dm.campus = ?
      LEFT JOIN (
        SELECT
          fa.department_email AS email,
          COUNT(*) AS fichas_qty
        FROM fichas_atencion fa
        WHERE fa.school_code = ?
          AND fa.fecha >= ? AND fa.fecha < ?
          AND fa.department_email IS NOT NULL AND fa.department_email <> ''
        GROUP BY fa.department_email
      ) f ON f.email = src.email
      LEFT JOIN (
        SELECT
          se.department_email AS email,
          COUNT(*) AS seguimiento_qty
        FROM seguimiento se
        WHERE se.school_code = ?
          AND se.fecha >= ? AND se.fecha < ?
          AND se.department_email IS NOT NULL AND se.department_email <> ''
        GROUP BY se.department_email
      ) s ON s.email = src.email
    ) t
    GROUP BY t.department_name
    ORDER BY qty DESC, t.department_name ASC
  `;

  const bind = [
    mapCampus,
    dataCampus, start, end,
    dataCampus, start, end,
    mapCampus,
    dataCampus, start, end,
    dataCampus, start, end
  ];

  const [rows] = await mysql.query<any[]>(sql, bind);
  return rows.map(r => ({ depto: String(r.depto), qty: Number(r.qty ?? 0) }));
}

export default <MetricDefinition>{
  id: "sapf",
  label: "Atención a Padres (SAPF)",
  params: [
    { key: "plantel", type: "string", required: true }, // campus code
    { key: "month", type: "number", required: true },
    { key: "year", type: "number", required: true }
  ],
  schema,
  async fetch({ params, mysql }) {
    const plantel = String(params.plantel);
    const month = Number(params.month);
    const year = Number(params.year);

    const start = `${year}-${String(month).padStart(2, "0")}-01 00:00:00`;
    const endDate = new Date(year, month, 1); // first day of next month
    const end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-01 00:00:00`;

    const isPMGroup = ["PM", "PMA", "PMB"].includes(plantel);

    let rows: { depto: string; qty: number }[] = [];

    if (isPMGroup) {
      const a = await fetchCampus(mysql, "PM", "PMA", start, end);
      const b = await fetchCampus(mysql, "PM", "PMB", start, end);
      const merged = new Map<string, number>();
      for (const r of [...a, ...b]) merged.set(r.depto, (merged.get(r.depto) ?? 0) + r.qty);
      rows = Array.from(merged.entries()).map(([depto, qty]) => ({ depto, qty }));
      rows.sort((x, y) => (y.qty - x.qty) || x.depto.localeCompare(y.depto));
    } else {
      rows = await fetchCampus(mysql, plantel, plantel, start, end);
    }

    return {
      metricId: "sapf",
      label: "Atención a Padres (SAPF)",
      params: { plantel, month, year },
      schema,
      rows,
      meta: { generatedAt: new Date().toISOString(), source: "mysql" }
    };
  }
};