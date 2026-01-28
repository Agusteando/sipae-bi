import type { MetricDefinition, DatasetSchema } from "../dashboard/types";

const schema: DatasetSchema = {
  dims: [],
  measures: []
};

async function postJson(url: string, body: any): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Observaciones fetch failed: ${url} -> ${res.status}`);
  return await res.text();
}

export default <MetricDefinition>{
  id: "observaciones",
  label: "Observaciones GRUTA",
  params: [
    { key: "campus", type: "string", required: true },
    { key: "nivel", type: "string", required: true },
    { key: "month", type: "number", required: true },
    { key: "year", type: "number", required: true }
  ],
  schema,
  async fetch({ params }) {
    const campus = String(params.campus);
    const nivel = String(params.nivel);
    const month = Number(params.month);
    const year = Number(params.year);

    const payload = { campus, nivel, month, year };

    const chartHtml = await postJson("https://bot.casitaapps.com/observaciones-chart", payload);
    const text = await postJson("https://bot.casitaapps.com/observaciones-text", payload);

    return {
      metricId: "observaciones",
      label: "Observaciones GRUTA",
      params: { campus, nivel, month, year },
      schema,
      rows: [{ chartHtml, text }],
      meta: { generatedAt: new Date().toISOString(), source: "bot.casitaapps.com" }
    };
  }
};