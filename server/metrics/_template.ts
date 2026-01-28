import type { MetricDefinition } from "../dashboard/types";

export default <MetricDefinition>{
  id: "your_metric_id",
  label: "Your Metric",
  params: [
    { key: "month", type: "number", required: true },
    { key: "year", type: "number", required: true }
  ],
  schema: {
    dims: [{ key: "dim1" }],
    measures: [{ key: "value", format: "int" }]
  },
  async fetch({ params, mysql, http }) {
    void mysql;
    void http;

    return {
      metricId: "your_metric_id",
      label: "Your Metric",
      params,
      schema: this.schema,
      rows: [],
      meta: { generatedAt: new Date().toISOString(), source: "mixed" }
    };
  }
};