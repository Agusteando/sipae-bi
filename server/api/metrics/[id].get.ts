import { getMetric } from "../../dashboard/engine";
import { getMysqlPool } from "../../db/mysql";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const metric = await getMetric(id);

  if (!metric) {
    throw createError({ statusCode: 404, statusMessage: `Unknown metric: ${id}` });
  }

  const params = getQuery(event) as Record<string, any>;
  const mysql = getMysqlPool();

  const http = async <T>(url: string, init?: RequestInit) => {
    return await $fetch<T>(url, init);
  };

  const dataset = await metric.fetch({ params, mysql, http });
  return dataset;
});