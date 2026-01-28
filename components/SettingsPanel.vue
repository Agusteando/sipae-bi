<template>
  <div class="settings-panel">
    <!-- Tabs -->
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" class="tab-icon" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Metrics Configuration Tab -->
    <div v-if="activeTab === 'metrics'" class="tab-content">
      <p class="tab-description">
        Configura el tipo de gráfico para cada métrica. Los cambios se guardan automáticamente.
      </p>

      <div class="metrics-list">
        <div 
          v-for="(metric, metricId) in localConfig.metrics" 
          :key="metricId"
          class="metric-item"
        >
          <div class="metric-header">
            <div class="metric-info">
              <span class="metric-label">{{ metric.label }}</span>
              <span class="metric-id">{{ metricId }}</span>
            </div>
            <div class="color-indicator" :style="{ background: getColorSchemePreview(metric.colorScheme) }"></div>
          </div>

          <div class="metric-controls">
            <div class="control-group">
              <label class="control-label">Tipo de Gráfico</label>
              <div class="chart-type-selector">
                <button
                  v-for="chartType in metric.allowedChartTypes"
                  :key="chartType"
                  class="chart-type-btn"
                  :class="{ active: getSelectedChartType(metricId) === chartType }"
                  @click="setChartType(metricId, chartType)"
                  :title="getChartTypeInfo(chartType)?.description"
                >
                  <ChartIcon :type="chartType" />
                  <span>{{ getChartTypeInfo(chartType)?.label }}</span>
                </button>
              </div>
            </div>

            <div class="control-row">
              <div class="control-group compact">
                <label class="control-label">Esquema de Color</label>
                <select 
                  class="control-select" 
                  :value="metric.colorScheme"
                  @change="setColorScheme(metricId, ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="(colors, scheme) in localConfig.colorSchemes" :key="scheme" :value="scheme">
                    {{ capitalizeFirst(scheme) }}
                  </option>
                </select>
              </div>

              <div class="control-group compact">
                <label class="control-label">Comparación</label>
                <label class="toggle">
                  <input 
                    type="checkbox" 
                    :checked="metric.showComparison"
                    @change="setShowComparison(metricId, ($event.target as HTMLInputElement).checked)"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div v-if="metric.drilldown?.enabled" class="drilldown-info">
            <span class="drilldown-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="drilldown-icon">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              Drill-down a: {{ metric.drilldown.targetMetric }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Relationships Tab -->
    <div v-if="activeTab === 'relationships'" class="tab-content">
      <p class="tab-description">
        Define las relaciones jerárquicas para navegación entre niveles de datos.
      </p>

      <div class="relationships-list">
        <div 
          v-for="(rel, relId) in localConfig.relationships" 
          :key="relId"
          class="relationship-item"
        >
          <div class="relationship-header">
            <span class="relationship-name">{{ formatRelationshipName(relId) }}</span>
            <span class="relationship-desc">{{ rel.description }}</span>
          </div>
          
          <div class="hierarchy-levels">
            <div 
              v-for="(level, idx) in rel.levels" 
              :key="idx"
              class="level-item"
            >
              <span class="level-number">{{ idx + 1 }}</span>
              <span class="level-label">{{ level.label }}</span>
              <span v-if="level.groupBy" class="level-groupby">agrupado por: {{ level.groupBy }}</span>
              <span v-if="idx < rel.levels.length - 1" class="level-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export/Import Tab -->
    <div v-if="activeTab === 'export'" class="tab-content">
      <p class="tab-description">
        Exporta o importa tu configuración de dashboard.
      </p>

      <div class="export-section">
        <h3 class="section-title">Exportar Configuración</h3>
        <p class="section-desc">Descarga tu configuración actual como archivo JSON.</p>
        <button class="action-button primary" @click="exportConfig">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exportar JSON
        </button>
      </div>

      <div class="export-section">
        <h3 class="section-title">Importar Configuración</h3>
        <p class="section-desc">Carga una configuración previamente exportada.</p>
        <label class="action-button secondary file-input-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Importar JSON
          <input type="file" accept=".json" @change="importConfig" class="file-input" />
        </label>
      </div>

      <div class="export-section danger-zone">
        <h3 class="section-title danger">Restablecer Configuración</h3>
        <p class="section-desc">Restablece toda la configuración a los valores predeterminados.</p>
        <button class="action-button danger" @click="confirmReset">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          Restablecer Todo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, h } from 'vue';

// Icons as functional components
const ChartIcon = (props: { type: string }) => {
  const icons: Record<string, string> = {
    kpi: 'M4 4h4v4H4zM4 12h4v4H4zM12 4h4v4h-4zM12 12h4v4h-4z',
    bar: 'M18 20V10M12 20V4M6 20v-6',
    stackedBar: 'M18 20V10M12 20V4M6 20v-6M18 10v-4M12 4v4',
    line: 'M22 12h-4l-3 9L9 3l-3 9H2',
    pie: 'M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z',
    gauge: 'M12 2a10 10 0 0 1 10 10M12 2v10l6.93 4',
    progress: 'M4 12h16M4 6h12M4 18h8',
    table: 'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    calendar: 'M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18',
    heatmap: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    treemap: 'M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z',
    radar: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    html: 'M4 4l8 16 8-16M2 12h4M18 12h4',
    text: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8'
  };
  
  return h('svg', {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    class: 'chart-icon'
  }, [
    h('path', { d: icons[props.type] || icons.bar })
  ]);
};

const props = defineProps<{
  metricsConfig: any;
}>();

const emit = defineEmits<{
  (e: 'update:metricsConfig', config: any): void;
  (e: 'reset'): void;
}>();

const activeTab = ref('metrics');
const localConfig = ref(JSON.parse(JSON.stringify(props.metricsConfig)));

const tabs = [
  { id: 'metrics', label: 'Métricas', icon: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M18 20V10M12 20V4M6 20v-6' })]) },
  { id: 'relationships', label: 'Relaciones', icon: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5' })]) },
  { id: 'export', label: 'Exportar', icon: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3' })]) }
];

watch(() => props.metricsConfig, (newVal) => {
  localConfig.value = JSON.parse(JSON.stringify(newVal));
}, { deep: true });

function getSelectedChartType(metricId: string): string {
  // First check for user override, then use default
  return localConfig.value.metrics[metricId]?.selectedChartType || 
         localConfig.value.metrics[metricId]?.defaultChartType || 'bar';
}

function setChartType(metricId: string, chartType: string) {
  localConfig.value.metrics[metricId].selectedChartType = chartType;
  emitUpdate();
}

function setColorScheme(metricId: string, scheme: string) {
  localConfig.value.metrics[metricId].colorScheme = scheme;
  emitUpdate();
}

function setShowComparison(metricId: string, show: boolean) {
  localConfig.value.metrics[metricId].showComparison = show;
  emitUpdate();
}

function getChartTypeInfo(chartType: string) {
  return localConfig.value.chartTypes?.[chartType] || { label: chartType, description: '' };
}

function getColorSchemePreview(scheme: string): string {
  const colors = localConfig.value.colorSchemes?.[scheme]?.light || ['#3b82f6'];
  return `linear-gradient(135deg, ${colors.join(', ')})`;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatRelationshipName(relId: string): string {
  return relId.split('_').map(capitalizeFirst).join(' ');
}

function emitUpdate() {
  emit('update:metricsConfig', JSON.parse(JSON.stringify(localConfig.value)));
}

function exportConfig() {
  const blob = new Blob([JSON.stringify(localConfig.value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bi-dashboard-config-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importConfig(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target?.result as string);
      localConfig.value = imported;
      emitUpdate();
      alert('Configuración importada exitosamente');
    } catch (err) {
      alert('Error al importar configuración: formato JSON inválido');
    }
  };
  reader.readAsText(file);
}

function confirmReset() {
  if (confirm('¿Estás seguro de que deseas restablecer toda la configuración? Esta acción no se puede deshacer.')) {
    emit('reset');
  }
}
</script>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 16px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.tab-icon {
  width: 18px;
  height: 18px;
}

/* Tab Content */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tab-description {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

/* Metrics List */
.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-item {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.metric-item:hover {
  border-color: var(--border-medium);
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-label {
  font-weight: 600;
  color: var(--text-primary);
}

.metric-id {
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
}

.color-indicator {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

/* Controls */
.metric-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group.compact {
  flex: 1;
}

.control-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.control-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Chart Type Selector */
.chart-type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chart-type-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chart-type-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.chart-type-btn.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

.chart-icon {
  width: 16px;
  height: 16px;
}

/* Select */
.control-select {
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-select:hover {
  border-color: var(--border-medium);
}

.control-select:focus {
  outline: none;
  border-color: var(--accent-primary);
}

/* Toggle */
.toggle {
  position: relative;
  display: inline-flex;
  cursor: pointer;
}

.toggle input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  width: 44px;
  height: 24px;
  background: var(--bg-hover);
  border-radius: 12px;
  transition: all 0.2s ease;
  position: relative;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.toggle input:checked + .toggle-slider {
  background: var(--accent-primary);
}

.toggle input:checked + .toggle-slider::after {
  transform: translateX(20px);
}

/* Drilldown Info */
.drilldown-info {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-light);
}

.drilldown-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--bg-secondary);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.drilldown-icon {
  width: 14px;
  height: 14px;
}

/* Relationships */
.relationships-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.relationship-item {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 16px;
}

.relationship-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.relationship-name {
  font-weight: 600;
  color: var(--text-primary);
}

.relationship-desc {
  font-size: 13px;
  color: var(--text-muted);
}

.hierarchy-levels {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
}

.level-number {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-primary);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 50%;
}

.level-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.level-groupby {
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
}

.level-arrow {
  color: var(--text-muted);
  font-size: 16px;
}

/* Export Section */
.export-section {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 20px;
}

.export-section.danger-zone {
  border-color: var(--accent-danger);
  background: color-mix(in srgb, var(--accent-danger) 5%, var(--bg-tertiary));
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.section-title.danger {
  color: var(--accent-danger);
}

.section-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 16px 0;
}

/* Action Buttons */
.action-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.action-button.primary {
  background: var(--accent-primary);
  color: white;
}

.action-button.primary:hover {
  filter: brightness(1.1);
}

.action-button.secondary {
  background: var(--bg-secondary);
  border-color: var(--border-light);
  color: var(--text-primary);
}

.action-button.secondary:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.action-button.danger {
  background: var(--accent-danger);
  color: white;
}

.action-button.danger:hover {
  filter: brightness(1.1);
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.file-input-label {
  cursor: pointer;
}

.file-input {
  display: none;
}

@media (max-width: 600px) {
  .tabs {
    flex-wrap: wrap;
  }

  .tab-btn span {
    display: none;
  }

  .chart-type-selector {
    flex-direction: column;
  }

  .chart-type-btn {
    justify-content: center;
  }

  .control-row {
    flex-direction: column;
  }

  .hierarchy-levels {
    flex-direction: column;
    align-items: flex-start;
  }

  .level-arrow {
    display: none;
  }
}
</style>
