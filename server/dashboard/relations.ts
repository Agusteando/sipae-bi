// server/dashboard/relations.ts
import relations from "../../dashboard/relations.json";

export function relatedMetrics(metricId: string) {
  const links = (relations as any).links as any[];
  const rel = links.filter(l => l.fromMetric === metricId || l.toMetric === metricId);
  return rel;
}
