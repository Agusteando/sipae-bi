import type { MetricDefinition, DatasetSchema } from "../dashboard/types";

const schema: DatasetSchema = {
  dims: [{ key: "title" }],
  measures: [
    { key: "status", format: "int" },
    { key: "returned", format: "int" },
    { key: "destiempo", format: "int" }
  ]
};

export default <MetricDefinition>{
  id: "entregas_detalle",
  label: "Lista de Entregas",
  params: [
    { key: "plantel", type: "number", required: true },
    { key: "month", type: "number", required: true },
    { key: "year", type: "number", required: true }
  ],
  schema,
  async fetch({ params, mysql }) {
    const plantel = Number(params.plantel);
    const month = Number(params.month);
    const year = Number(params.year);

    const sql = `
      SELECT title, status, deadline, returned, destiempo
      FROM detalle
      WHERE month(deadline) = ? AND year(deadline) = ? AND dir_id = ?
      ORDER BY deadline ASC
    `;

    const [rows] = await mysql.query<any[]>(sql, [month, year, plantel]);

    return {
      metricId: "entregas_detalle",
      label: "Lista de Entregas",
      params: { plantel, month, year },
      schema,
      rows,
      meta: { generatedAt: new Date().toISOString(), source: "mysql" }
    };
  }
};
