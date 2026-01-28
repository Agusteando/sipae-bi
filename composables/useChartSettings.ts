import defaultConfig from "~/dashboard/metrics-config.json";

export type ChartType = 
  | "kpi" 
  | "bar" 
  | "horizontalBar" 
  | "stackedBar"
  | "line" 
  | "pie" 
  | "table" 
  | "list" 
  | "progress" 
  | "calendar" 
  | "heatmap" 
  | "embedded"
  | "gauge"
  | "radar"
  | "treemap"
  | "html"
  | "text";

export interface MetricConfig {
  id: string;
  label: string;
  defaultChartType: ChartType;
  selectedChartType?: ChartType;
  allowedChartTypes: ChartType[];
  colorScheme: string;
  showComparison: boolean;
  drilldown: {
    enabled: boolean;
    targetMetric?: string;
    paramMapping?: Record<string, string>;
  };
}

export interface MetricsConfigState {
  version: string;
  metrics: Record<string, MetricConfig>;
  colorSchemes: Record<string, {
    light: string[];
    dark: string[];
  }>;
  chartTypes: Record<string, {
    label: string;
    icon: string;
    description: string;
  }>;
  relationships: Record<string, {
    description: string;
    levels: Array<{
      entity: string;
      label: string;
      groupBy?: string;
    }>;
  }>;
}

const STORAGE_KEY = "bi-metrics-config";

export function useChartSettings() {
  // Use the global state if available, otherwise create local state
  const globalConfig = useState<MetricsConfigState>("metricsConfig");
  
  const settings = computed<MetricsConfigState>(() => {
    if (globalConfig.value) {
      return globalConfig.value as MetricsConfigState;
    }
    return defaultConfig as MetricsConfigState;
  });

  // Get effective config for a metric
  function getMetricConfig(metricId: string): MetricConfig | null {
    const config = settings.value?.metrics?.[metricId];
    if (!config) return null;
    return config as MetricConfig;
  }

  // Get current chart type for a metric (user selected or default)
  function getChartType(metricId: string): ChartType {
    const config = getMetricConfig(metricId);
    return (config?.selectedChartType || config?.defaultChartType || "bar") as ChartType;
  }

  // Set chart type for a metric
  function setChartType(metricId: string, chartType: ChartType) {
    if (globalConfig.value?.metrics?.[metricId]) {
      globalConfig.value.metrics[metricId].selectedChartType = chartType;
      saveToStorage();
    }
  }

  // Get available chart types for a metric
  function getAvailableChartTypes(metricId: string): ChartType[] {
    const config = getMetricConfig(metricId);
    return (config?.allowedChartTypes || ["bar"]) as ChartType[];
  }

  // Get relationships for a metric
  function getRelationships(metricId: string) {
    const config = getMetricConfig(metricId);
    if (!config?.drilldown?.enabled) return [];
    
    return [{
      fromMetric: metricId,
      toMetric: config.drilldown.targetMetric,
      paramMapping: config.drilldown.paramMapping
    }];
  }

  // Get drilldown config for a metric
  function getDrilldownConfig(metricId: string) {
    const config = getMetricConfig(metricId);
    return config?.drilldown;
  }

  // Get color scheme by name
  function getColorScheme(schemeName?: string, theme: 'light' | 'dark' = 'light'): string[] {
    const name = schemeName || 'primary';
    const scheme = settings.value?.colorSchemes?.[name];
    return scheme?.[theme] || ['#3b82f6', '#60a5fa', '#93c5fd'];
  }

  // Get chart type info
  function getChartTypeInfo(chartType: string) {
    return settings.value?.chartTypes?.[chartType] || { 
      label: chartType, 
      icon: 'bar', 
      description: '' 
    };
  }

  // Get all metric configs
  function getAllMetrics(): MetricConfig[] {
    return Object.values(settings.value?.metrics || {}) as MetricConfig[];
  }

  // Reset metric to defaults
  function resetMetric(metricId: string) {
    const defaultMetric = (defaultConfig as MetricsConfigState).metrics[metricId];
    if (globalConfig.value?.metrics?.[metricId] && defaultMetric) {
      globalConfig.value.metrics[metricId] = { ...defaultMetric };
      saveToStorage();
    }
  }

  // Reset all settings
  function resetAll() {
    if (globalConfig.value) {
      globalConfig.value = JSON.parse(JSON.stringify(defaultConfig));
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Export current settings
  function exportSettings(): string {
    return JSON.stringify(settings.value, null, 2);
  }

  // Import settings
  function importSettings(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (data.metrics && globalConfig.value) {
        globalConfig.value = data;
        saveToStorage();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  function saveToStorage() {
    try {
      if (globalConfig.value) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(globalConfig.value));
      }
    } catch (e) {
      console.warn("Failed to save metrics config to localStorage", e);
    }
  }

  return {
    settings: readonly(settings),
    getMetricConfig,
    getChartType,
    setChartType,
    getAvailableChartTypes,
    getRelationships,
    getDrilldownConfig,
    getColorScheme,
    getChartTypeInfo,
    getAllMetrics,
    resetMetric,
    resetAll,
    exportSettings,
    importSettings
  };
}
