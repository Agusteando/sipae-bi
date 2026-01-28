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
      select A.asignadas, A.destiempo, A.entregadas, A.noentregadas,
             (A.asignadas-A.entregadas-A.noentregadas) pendientes
      from (
        select count(id) asignadas,
               SUM(IF(destiempo=1,1,0)) destiempo,
               sum(if(status=1,1,0)) entregadas,
               sum(case when deadline < now() and status = 0 then 1 else 0 END) noentregadas
        from detalle
        where dir_id = ? and month(deadline) = ? and year(deadline) = ?
      ) A
    `;

    const [rows] = await mysql.query<any[]>(sql, [id, month, year]);
    const r = rows?.[0] ?? { asignadas: 0, destiempo: 0, entregadas: 0, noentregadas: 0, pendientes: 0 };

    return {
      metricId: "entregas",
      label: "Entregas Mensuales",
      params: { id, month, year },
      schema,
      rows: [r],
      meta: { generatedAt: new Date().toISOString(), source: "mysql" }
    };
  }
};
