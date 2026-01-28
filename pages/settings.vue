<template>
  <div class="settings-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Dashboard Settings</h1>
        <p class="page-subtitle">Configure chart types, display options, and relationships for each metric</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="exportSettingsToFile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export
        </button>
        <button class="btn btn-secondary" @click="showImportModal = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import
        </button>
        <button class="btn btn-danger" @click="confirmResetAll">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
          Reset All
        </button>
      </div>
    </div>

    <!-- Metrics Configuration -->
    <section class="settings-section">
      <h2 class="section-title">Metric Configurations</h2>
      <p class="section-description">Choose how each metric is displayed in the dashboard</p>

      <div class="metrics-grid">
        <div 
          v-for="(config, metricId) in settings.metrics" 
          :key="metricId" 
          class="metric-card"
        >
          <div class="metric-header">
            <div class="metric-info">
              <h3 class="metric-name">{{ config.label }}</h3>
              <span class="metric-id">{{ metricId }}</span>
            </div>
            <button 
              v-if="userOverrides[metricId]"
              class="btn-icon btn-reset"
              @click="resetMetric(metricId as string)"
              title="Reset to default"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>
          </div>

          <div class="metric-options">
            <label class="option-label">Chart Type</label>
            <div class="chart-type-grid">
              <button
                v-for="chartType in config.availableChartTypes"
                :key="chartType"
                class="chart-type-btn"
                :class="{ active: getChartType(metricId as string) === chartType }"
                @click="setChartType(metricId as string, chartType)"
              >
                <component :is="getChartIcon(chartType)" class="chart-icon" />
                <span>{{ formatChartType(chartType) }}</span>
              </button>
            </div>
          </div>

          <div v-if="config.drilldown?.enabled" class="drilldown-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span>Drilldown to: <strong>{{ config.drilldown.targetMetric }}</strong></span>
          </div>
        </div>
      </div>
    </section>

    <!-- Global Settings -->
    <section class="settings-section">
      <h2 class="section-title">Global Settings</h2>
      <p class="section-description">Configure global dashboard behavior</p>

      <div class="global-settings-grid">
        <div class="setting-item">
          <label class="setting-label">Color Scheme</label>
          <select v-model="selectedColorScheme" class="setting-select">
            <option v-for="(scheme, name) in settings.colorSchemes" :key="name" :value="name">
              {{ formatSchemeName(name) }}
            </option>
          </select>
          <div class="color-preview">
            <span
              v-for="(color, i) in currentSchemeColors"
              :key="i"
              class="color-dot"
              :style="{ backgroundColor: color }"
            />
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">Animations</label>
          <label class="toggle">
            <input type="checkbox" v-model="animationsEnabled" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <label class="setting-label">Comparison Mode</label>
          <select v-model="comparisonMode" class="setting-select">
            <option value="sideBySide">Side by Side</option>
            <option value="overlay">Overlay</option>
            <option value="difference">Difference</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Relationships Visualization -->
    <section class="settings-section">
      <h2 class="section-title">Metric Relationships</h2>
      <p class="section-description">Visual map of how metrics connect to each other</p>

      <div class="relationships-container">
        <div class="relationship-list">
          <div 
            v-for="link in settings.relationships.links" 
            :key="link.id"
            class="relationship-item"
          >
            <div class="relationship-from">
              <span class="metric-badge">{{ link.fromMetric }}</span>
              <span class="field-name">{{ link.fromKey }}</span>
            </div>
            <div class="relationship-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
            <div class="relationship-to">
              <span class="metric-badge">{{ link.toMetric }}</span>
              <span class="field-name">{{ link.toKey }}</span>
            </div>
            <span class="relationship-label">{{ link.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Import Modal -->
    <Teleport to="body">
      <div v-if="showImportModal" class="modal-overlay" @click.self="showImportModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>Import Settings</h3>
            <button class="btn-icon" @click="showImportModal = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <textarea
              v-model="importJson"
              class="import-textarea"
              placeholder="Paste your exported settings JSON here..."
            ></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showImportModal = false">Cancel</button>
            <button class="btn btn-primary" @click="doImport">Import</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useChartSettings, type ChartType } from "~/composables/useChartSettings";

const {
  settings,
  userOverrides,
  getChartType,
  setChartType,
  resetMetric,
  resetAll,
  exportSettings,
  importSettings,
  getColorScheme
} = useChartSettings();

const showImportModal = ref(false);
const importJson = ref("");

const selectedColorScheme = ref(settings.value.globalSettings.defaultColorScheme);
const animationsEnabled = ref(settings.value.globalSettings.animationsEnabled);
const comparisonMode = ref(settings.value.globalSettings.comparisonMode);

const currentSchemeColors = computed(() => {
  return getColorScheme(selectedColorScheme.value).primary;
});

function formatChartType(type: ChartType): string {
  const labels: Record<ChartType, string> = {
    kpi: "KPI Cards",
    bar: "Bar",
    horizontalBar: "H. Bar",
    stackedBar: "Stacked",
    line: "Line",
    pie: "Pie",
    table: "Table",
    list: "List",
    progress: "Progress",
    calendar: "Calendar",
    heatmap: "Heatmap",
    embedded: "Embedded"
  };
  return labels[type] || type;
}

function formatSchemeName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function getChartIcon(type: ChartType) {
  return defineComponent({
    render() {
      const icons: Record<ChartType, string> = {
        kpi: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
        bar: '<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>',
        horizontalBar: '<path d="M4 6h10"/><path d="M4 12h16"/><path d="M4 18h6"/>',
        stackedBar: '<rect x="6" y="4" width="4" height="8"/><rect x="6" y="12" width="4" height="8"/><rect x="14" y="8" width="4" height="6"/><rect x="14" y="14" width="4" height="6"/>',
        line: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
        pie: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
        table: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/><line x1="15" y1="9" x2="15" y2="21"/>',
        list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
        progress: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
        calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
        heatmap: '<rect x="3" y="3" width="5" height="5"/><rect x="9" y="3" width="5" height="5"/><rect x="15" y="3" width="5" height="5"/><rect x="3" y="9" width="5" height="5"/><rect x="9" y="9" width="5" height="5"/><rect x="15" y="9" width="5" height="5"/>',
        embedded: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>'
      };
      return h(
        "svg",
        {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2",
          innerHTML: icons[type] || icons.bar
        }
      );
    }
  });
}

function exportSettingsToFile() {
  const json = exportSettings();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bi-dashboard-settings-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function doImport() {
  if (importSettings(importJson.value)) {
    showImportModal.value = false;
    importJson.value = "";
  } else {
    alert("Invalid settings format");
  }
}

function confirmResetAll() {
  if (confirm("Are you sure you want to reset all settings to defaults?")) {
    resetAll();
  }
}
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}

.header-content {
  flex: 1;
  min-width: 280px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 15px;
  margin: 8px 0 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn svg {
  width: 18px;
  height: 18px;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.btn-secondary:hover {
  background: var(--bg-hover);
  border-color: var(--border-medium);
}

.btn-danger {
  background: var(--bg-secondary);
  color: var(--accent-danger);
  border: 1px solid var(--accent-danger);
}

.btn-danger:hover {
  background: var(--accent-danger);
  color: white;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn-icon svg {
  width: 18px;
  height: 18px;
}

.btn-reset:hover {
  color: var(--accent-danger);
}

/* Settings Sections */
.settings-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.section-description {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0 0 24px;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.metric-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.metric-card:hover {
  border-color: var(--border-medium);
  box-shadow: var(--shadow-md);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.metric-id {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.metric-options {
  margin-bottom: 12px;
}

.option-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: block;
}

.chart-type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chart-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 11px;
  min-width: 60px;
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
  width: 20px;
  height: 20px;
}

.drilldown-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.drilldown-info svg {
  width: 16px;
  height: 16px;
  color: var(--accent-primary);
}

.drilldown-info strong {
  color: var(--text-primary);
}

/* Global Settings */
.global-settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.setting-select {
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.setting-select:hover {
  border-color: var(--border-medium);
}

.setting-select:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.color-preview {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.color-dot {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}

/* Toggle Switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  transition: 0.3s;
  border-radius: 13px;
}

.toggle-slider::before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
}

.toggle input:checked + .toggle-slider {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(22px);
}

/* Relationships */
.relationships-container {
  max-height: 400px;
  overflow-y: auto;
}

.relationship-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.relationship-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  flex-wrap: wrap;
}

.relationship-from,
.relationship-to {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-badge {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.field-name {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-muted);
}

.relationship-arrow {
  color: var(--accent-primary);
}

.relationship-arrow svg {
  width: 24px;
  height: 24px;
}

.relationship-label {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  padding: 4px 10px;
  border-radius: 6px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-body {
  padding: 20px;
}

.import-textarea {
  width: 100%;
  height: 200px;
  padding: 12px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  resize: vertical;
}

.import-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-light);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
