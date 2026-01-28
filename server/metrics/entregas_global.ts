import type { MetricDefinition, DatasetSchema } from "../dashboard/types";
import { getPlantelById } from "../../shared/planteles";

const schema: DatasetSchema = {
  dims: [{ key: "plantelCode" }, { key: "plantelLabel" }],
  measures: [
    { key: "asignadas", format: "int" },
    { key: "destiempo", format: "int" },
    { key: "entregadas", format: "int" },
    { key: "noentregadas", format: "int" }
  ]
};

export default <MetricDefinition>{
  id: "entregas_global",
  label: "Entregas Global",
  params: [
    { key: "month", type: "number", required: true },
    { key: "year", type: "number", required: true }
  ],
  schema,
  async fetch({ params, mysql }) {
    const month = Number(params.month);
    const year = Number(params.year);

    const sql = `
      SELECT
        dir_id,
        COUNT(id) AS asignadas,
        SUM(IF(destiempo=1,1,0)) AS destiempo,
        SUM(IF(status=1,1,0)) AS entregadas,
        SUM(CASE WHEN deadline < NOW() AND status = 0 THEN 1 ELSE 0 END) AS noentregadas
      FROM detalle
      WHERE month(deadline) = ? AND year(deadline) = ?
      GROUP BY dir_id
      ORDER BY entregadas DESC
    `;

    const [rows] = await mysql.query<any[]>(sql, [month, year]);

    const normalized = rows.map(r => {
      const p = getPlantelById(Number(r.dir_id));
      return {
        plantelCode: p?.code ?? `ID:${r.dir_id}`,
        plantelLabel: p?.label ?? `dir_id ${r.dir_id}`,
        asignadas: Number(r.asignadas ?? 0),
        destiempo: Number(r.destiempo ?? 0),
        entregadas: Number(r.entregadas ?? 0),
        noentregadas: Number(r.noentregadas ?? 0)
      };
    });

    return {
      metricId: "entregas_global",
      label: "Entregas Global",
      params: { month, year },
      schema,
      rows: normalized,
      meta: { generatedAt: new Date().toISOString(), source: "mysql" }
    };
  }
};