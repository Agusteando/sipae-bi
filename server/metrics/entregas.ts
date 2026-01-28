import type { MetricDefinition, DatasetSchema } from "../dashboard/types";

const schema: DatasetSchema = {
  dims: [],
  measures: [
    { key: "asignadas", label: "Asignadas", format: "int" },
    { key: "destiempo", label: "Destiempo", format: "int" },
    { key: "entregadas", label: "Entregadas", format: "int" },
    { key: "noentregadas", label: "No entregó", format: "int" },
    { key: "pendientes", label: "Pendientes", format: "int" }
  ]
};

export default <MetricDefinition>{
  id: "entregas",
  label: "Entregas Mensuales",
  params: [
    { key: "id", type: "number", required: true },
    { key: "month", type: "number", required: true },
    { key: "year", type: "number", required: true }
  ],
  schema,
  async fetch({ params, mysql }) {
    const id = Number(params.id);
    const month = Number(params.month);
    const year = Number(params.year);

    const sql = `
      SELECT
        A.asignadas,
        A.destiempo,
        A.entregadas,
        A.noentregadas,
        (A.asignadas - A.entregadas - A.noentregadas) AS pendientes
      FROM (
        SELECT
          COUNT(id) AS asignadas,
          SUM(IF(destiempo=1,1,0)) AS destiempo,
          SUM(IF(status=1,1,0)) AS entregadas,
          SUM(CASE WHEN deadline < NOW() AND status = 0 THEN 1 ELSE 0 END) AS noentregadas
        FROM detalle
        WHERE dir_id = ?
          AND MONTH(deadline) = ?
          AND YEAR(deadline) = ?
      ) A
    `;

    const [rows] = await mysql.query<any[]>(sql, [id, month, year]);

    return {
      metricId: "entregas",
      label: "Entregas Mensuales",
      params: { id, month, year },
      schema,
      rows,
      meta: { generatedAt: new Date().toISOString(), source: "mysql" }
    };
  }
};