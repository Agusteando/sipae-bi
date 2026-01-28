import type { MetricDefinition, DatasetSchema } from "../dashboard/types";

const schema: DatasetSchema = {
  dims: [{ key: "title", label: "Título" }],
  measures: []
};

export default <MetricDefinition>{
  id: "entregas_detalle",
  label: "Lista de Entregas",
  params: [
    { key: "plantel", type: "number", required: true }, // dir_id
    { key: "mes", type: "number", required: true },
    { key: "year", type: "number", required: true }
  ],
  schema,
  async fetch({ params, mysql }) {
    const plantel = Number(params.plantel);
    const mes = Number(params.mes);
    const year = Number(params.year);

    const sql = `
      SELECT title, status, deadline, returned, destiempo
      FROM detalle
      WHERE MONTH(deadline) = ?
        AND YEAR(deadline) = ?
        AND dir_id = ?
      ORDER BY deadline ASC, title ASC
    `;

    const [rows] = await mysql.query<any[]>(sql, [mes, year, plantel]);

    return {
      metricId: "entregas_detalle",
      label: "Lista de Entregas",
      params: { plantel, mes, year },
      schema,
      rows,
      meta: { generatedAt: new Date().toISOString(), source: "mysql" }
    };
  }
};