import type { MetricDefinition, DatasetSchema } from "../dashboard/types";

const schema: DatasetSchema = {
  dims: [{ key: "grado" }, { key: "grupo" }],
  measures: [
    { key: "to_check", label: "Por Revisar", format: "int" },
    { key: "addressed", label: "Atendidas", format: "int" }
  ]
};

export default <MetricDefinition>{
  id: "attendance",
  label: "Seguimiento a Ausencias",
  params: [
    { key: "plantel", type: "string", required: true },
    { key: "month", type: "number", required: true },
    { key: "year", type: "number", required: true }
  ],
  schema,
  async fetch({ params, mysql }) {
    const plantel = String(params.plantel);
    const month = Number(params.month);
    const year = Number(params.year);

    const sql = `
      SELECT grado, grupo,
        SUM(CASE WHEN attendance = '0' AND motivo IS NULL THEN 1 ELSE 0 END) AS to_check,
        SUM(CASE WHEN attendance = '0' AND motivo IS NOT NULL THEN 1 ELSE 0 END) AS addressed
      FROM asistencia
      WHERE MONTH(fecha) = ? AND YEAR(fecha) = ? AND plantel = ?
      GROUP BY grado, grupo
      ORDER BY FIELD(grado, 'primero','segundo','tercero','cuarto','quinto','sexto'), grupo
    `;

    const [rows] = await mysql.query<any[]>(sql, [month, year, plantel]);

    return {
      metricId: "attendance",
      label: "Seguimiento a Ausencias",
      params: { plantel, month, year },
      schema,
      rows,
      meta: { generatedAt: new Date().toISOString(), source: "mysql" }
    };
  }
};
