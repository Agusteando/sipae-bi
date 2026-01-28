import { getMetric } from "../dashboard/engine";
import { getMysqlPool } from "../db/mysql";
import { describeEntregas } from "../dashboard/narrative";

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as Record<string, any>;
  const metricId = String(q.metricId || "");

  const metric = await getMetric(metricId);
  if (!metric) throw createError({ statusCode: 404, statusMessage: "Unknown metricId" });

  const mysql = getMysqlPool();
  const http = async <T>(url: string, init?: RequestInit) => $fetch<T>(url, init);

  const ds = await metric.fetch({ params: q, mysql, http });

  if (metricId === "entregas") return { text: describeEntregas(ds) };

  return { text: "Narrative not implemented for this metric." };
});