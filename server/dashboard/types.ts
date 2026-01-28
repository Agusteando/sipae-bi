// server/dashboard/types.ts
export type MetricParamType = "string" | "number" | "date" | "month" | "year" | "enum";

export type MetricParamDef = {
  key: string;
  type: MetricParamType;
  required?: boolean;
  default?: unknown;
  enum?: string[];
};

export type DatasetSchema = {
  // dimensions you group/join on (plantel, month, teacher, etc.)
  dims: { key: string; label?: string }[];
  // numeric measures (counts, rates, etc.)
  measures: { key: string; label?: string; format?: "int" | "pct" | "float" }[];
};

export type DatasetRow = Record<string, string | number | boolean | null>;

export type Dataset = {
  metricId: string;
  label: string;
  params: Record<string, any>;
  schema: DatasetSchema;
  rows: DatasetRow[];
  meta?: {
    generatedAt: string;
    source?: "mysql" | "http" | "csv" | "mixed";
  };
};

export type MetricDefinition = {
  id: string;
  label: string;
  params: MetricParamDef[];
  schema: DatasetSchema;
  // fetch must return standardized dataset rows
  fetch: (ctx: {
    params: Record<string, any>;
    mysql: import("mysql2/promise").Pool;
    http: <T>(url: string, init?: RequestInit) => Promise<T>;
  }) => Promise<Dataset>;
};
