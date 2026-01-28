export function useMetric<T = any>(
  metricId: string,
  params: Record<string, any>
) {
  const query = computed(() => ({ ...params }));
  return useFetch<T>(`/api/metrics/${metricId}`, {
    query,
    watch: [query],
  });
}