import type { MetricDefinition, DatasetSchema } from "../dashboard/types";

const schema: DatasetSchema = {
  dims: [{ key: "observatorName", label: "Observador" }],
  measures: [{ key: "quantity", label: "Cantidad", format: "int" }]
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

    // SQL equivalent of your PHP de-dupe + group-by:
    // DISTINCT across the same fields used in duplicate check, then COUNT per observatorName.
    const sql = `
      SELECT
        t.observatorName,
        COUNT(*) AS quantity
      FROM (
        SELECT DISTINCT
          year, month, day, final_observations, school_id, observatorName, professor_fullname
        FROM daily_ruta
        WHERE month = ?
          AND year = ?
      ) t
      GROUP BY t.observatorName
      ORDER BY quantity DESC, t.observatorName ASC
    `;

    const [rows] = await mysql.query<any[]>(sql, [month, year]);

    return {
      metricId: "ruta",
      label: "Ruta (conteo por observador)",
      params: { month, year },
      schema,
      rows,
      meta: { generatedAt: new Date().toISOString(), source: "mysql" }
    };
  }
};