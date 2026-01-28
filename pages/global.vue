<template>
  <div class="global-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Vista Global</h1>
        <p class="page-subtitle">Panorama general de todos los planteles con navegación drill-down</p>
      </div>

      <div class="header-filters">
        <div class="filter-group">
          <label>Mes</label>
          <input type="number" min="1" max="12" v-model.number="month" />
        </div>
        <div class="filter-group">
          <label>Año</label>
          <input type="number" min="2000" max="2100" v-model.number="year" />
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <div v-if="breadcrumb.length > 1" class="breadcrumb">
      <button 
        v-for="(crumb, idx) in breadcrumb" 
        :key="idx"
        class="breadcrumb-item"
        :class="{ active: idx === breadcrumb.length - 1 }"
        @click="navigateToCrumb(idx)"
      >
        {{ crumb.label }}
        <svg v-if="idx < breadcrumb.length - 1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="breadcrumb-arrow">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>

    <!-- Global Entregas Section -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Entregas por Plantel</h2>
        <span class="section-badge">{{ monthLabel }} {{ year }}</span>
      </div>

      <div v-if="entregasGlobalPending" class="loading-state">
        <div class="spinner"></div>
        <span>Cargando datos...</span>
      </div>

      <div v-else-if="entregasGlobalError" class="error-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>Error al cargar datos</span>
      </div>

      <template v-else>
        <!-- Summary KPIs -->
        <div class="kpi-row">
          <div class="mini-kpi">
            <span class="mini-kpi-label">Total Asignadas</span>
            <span class="mini-kpi-value">{{ totalAsignadas }}</span>
          </div>
          <div class="mini-kpi">
            <span class="mini-kpi-label">Total Entregadas</span>
            <span class="mini-kpi-value success">{{ totalEntregadas }}</span>
          </div>
          <div class="mini-kpi">
            <span class="mini-kpi-label">Destiempo</span>
            <span class="mini-kpi-value warning">{{ totalDestiempo }}</span>
          </div>
          <div class="mini-kpi">
            <span class="mini-kpi-label">No Entregó</span>
            <span class="mini-kpi-value danger">{{ totalNoEntregadas }}</span>
          </div>
          <div class="mini-kpi">
            <span class="mini-kpi-label">Cumplimiento</span>
            <span class="mini-kpi-value">{{ globalComplianceRate }}%</span>
          </div>
        </div>

        <!-- Main Chart -->
        <div class="chart-container">
          <GlobalToDetailChart
            :rows="entregasGlobalRows"
            :chartType="selectedChartType"
            @select="handlePlantelSelect"
          />
        </div>

        <!-- Chart Type Selector -->
        <div class="chart-type-bar">
          <span class="chart-type-label">Tipo de visualización:</span>
          <div class="chart-type-options">
            <button 
              v-for="type in availableChartTypes"
              :key="type"
              class="chart-type-btn"
              :class="{ active: selectedChartType === type }"
              @click="selectedChartType = type"
            >
              {{ formatChartType(type) }}
            </button>
          </div>
        </div>

        <!-- Data Table -->
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Plantel</th>
                <th class="num">Asignadas</th>
                <th class="num">Entregadas</th>
                <th class="num">Destiempo</th>
                <th class="num">No Entregó</th>
                <th class="num">%</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="row in entregasGlobalRows" 
                :key="row.plantelCode"
                :class="{ selected: selectedPlantel === row.plantelCode }"
                @click="handlePlantelSelect(row)"
              >
                <td>
                  <div class="plantel-cell">
                    <span class="plantel-code">{{ row.plantelCode }}</span>
                    <span class="plantel-label">{{ row.plantelLabel }}</span>
                  </div>
                </td>
                <td class="num">{{ row.asignadas }}</td>
                <td class="num success">{{ row.entregadas }}</td>
                <td class="num warning">{{ row.destiempo }}</td>
                <td class="num danger">{{ row.noentregadas }}</td>
                <td class="num">
                  <span class="compliance-badge" :class="getComplianceClass(row)">
                    {{ getComplianceRate(row) }}%
                  </span>
                </td>
                <td>
                  <button class="drill-btn" @click.stop="drillDownToPlantel(row)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </section>

    <!-- Selected Plantel Detail -->
    <Transition name="slide">
      <section v-if="selectedPlantel && selectedPlantelData" class="section detail-section">
        <div class="section-header">
          <div class="section-header-left">
            <button class="back-btn" @click="clearSelection">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <h2 class="section-title">{{ selectedPlantelData.plantelLabel }}</h2>
          </div>
          <span class="section-badge">{{ monthLabel }} {{ year }}</span>
        </div>

        <div class="detail-kpis">
          <div class="detail-kpi">
            <span class="detail-kpi-label">Asignadas</span>
            <span class="detail-kpi-value">{{ selectedPlantelData.asignadas }}</span>
          </div>
          <div class="detail-kpi">
            <span class="detail-kpi-label">Entregadas</span>
            <span class="detail-kpi-value success">{{ selectedPlantelData.entregadas }}</span>
          </div>
          <div class="detail-kpi">
            <span class="detail-kpi-label">Destiempo</span>
            <span class="detail-kpi-value warning">{{ selectedPlantelData.destiempo }}</span>
          </div>
          <div class="detail-kpi">
            <span class="detail-kpi-label">No Entregó</span>
            <span class="detail-kpi-value danger">{{ selectedPlantelData.noentregadas }}</span>
          </div>
        </div>

        <div class="action-row">
          <button class="action-btn" @click="drillDownToPlantel(selectedPlantelData)">
            Ver en Kardex
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </button>
        </div>
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import GlobalToDetailChart from "~/components/GlobalToDetailChart.vue";
import { monthLabelEs, clampMonth } from "~/utils/dates";
import { getPlantelByCode } from "~/shared/planteles";
import { useChartSettings } from "~/composables/useChartSettings";

const router = useRouter();
const { getChartType, setChartType, getAvailableChartTypes } = useChartSettings();

const now = new Date();
const month = ref(clampMonth(now.getMonth() + 1));
const year = ref(now.getFullYear());

const monthLabel = computed(() => monthLabelEs(year.value, month.value));

const selectedPlantel = ref<string | null>(null);
const selectedChartType = ref<string>(getChartType('entregas_global') || 'bar');

const availableChartTypes = ['bar', 'pie', 'treemap', 'table'];

interface BreadcrumbItem {
  label: string;
  level: string;
  value?: string;
}

const breadcrumb = ref<BreadcrumbItem[]>([
  { label: 'Todos los Planteles', level: 'global' }
]);

// Fetch global entregas data
const entregasGlobalQuery = computed(() => ({
  month: month.value,
  year: year.value
}));

const { data: entregasGlobalData, pending: entregasGlobalPending, error: entregasGlobalError } = useFetch<any>(
  '/api/metrics/entregas_global',
  { query: entregasGlobalQuery, watch: [entregasGlobalQuery] }
);

interface GlobalRow {
  plantelCode: string;
  plantelLabel: string;
  asignadas: number;
  entregadas: number;
  destiempo: number;
  noentregadas: number;
}

const entregasGlobalRows = computed<GlobalRow[]>(() => {
  return (entregasGlobalData.value?.rows || []) as GlobalRow[];
});

// Computed totals
const totalAsignadas = computed(() => 
  entregasGlobalRows.value.reduce((sum, r) => sum + (r.asignadas || 0), 0)
);

const totalEntregadas = computed(() => 
  entregasGlobalRows.value.reduce((sum, r) => sum + (r.entregadas || 0), 0)
);

const totalDestiempo = computed(() => 
  entregasGlobalRows.value.reduce((sum, r) => sum + (r.destiempo || 0), 0)
);

const totalNoEntregadas = computed(() => 
  entregasGlobalRows.value.reduce((sum, r) => sum + (r.noentregadas || 0), 0)
);

const globalComplianceRate = computed(() => {
  if (totalAsignadas.value === 0) return 0;
  return Math.round((totalEntregadas.value / totalAsignadas.value) * 100);
});

const selectedPlantelData = computed(() => {
  if (!selectedPlantel.value) return null;
  return entregasGlobalRows.value.find(r => r.plantelCode === selectedPlantel.value);
});

function getComplianceRate(row: GlobalRow): number {
  if (!row.asignadas) return 0;
  return Math.round((row.entregadas / row.asignadas) * 100);
}

function getComplianceClass(row: GlobalRow): string {
  const rate = getComplianceRate(row);
  if (rate >= 80) return 'high';
  if (rate >= 50) return 'medium';
  return 'low';
}

function formatChartType(type: string): string {
  const labels: Record<string, string> = {
    bar: 'Barras',
    pie: 'Pastel',
    treemap: 'Mapa',
    table: 'Tabla'
  };
  return labels[type] || type;
}

function handlePlantelSelect(row: GlobalRow) {
  selectedPlantel.value = row.plantelCode;
  
  // Update breadcrumb
  breadcrumb.value = [
    { label: 'Todos los Planteles', level: 'global' },
    { label: row.plantelLabel, level: 'plantel', value: row.plantelCode }
  ];
}

function clearSelection() {
  selectedPlantel.value = null;
  breadcrumb.value = [{ label: 'Todos los Planteles', level: 'global' }];
}

function navigateToCrumb(idx: number) {
  if (idx === 0) {
    clearSelection();
  }
}

function drillDownToPlantel(row: GlobalRow) {
  const plantel = getPlantelByCode(row.plantelCode);
  if (plantel) {
    router.push({
      path: '/kardex',
      query: {
        plantelA: row.plantelCode,
        monthA: month.value,
        yearA: year.value
      }
    });
  }
}

// Save chart type preference
watch(selectedChartType, (newType) => {
  setChartType('entregas_global', newType as any);
});
</script>

<style scoped>
.global-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 4px 0 0;
}

.header-filters {
  display: flex;
  gap: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.filter-group input {
  padding: 10px 14px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  width: 100px;
  transition: all 0.2s ease;
}

.filter-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.breadcrumb-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.breadcrumb-item.active {
  background: var(--accent-primary);
  color: white;
  cursor: default;
}

.breadcrumb-arrow {
  width: 14px;
  height: 14px;
  color: var(--text-muted);
}

/* Section */
.section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.section-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text-secondary);
  text-transform: capitalize;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

/* Loading & Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: var(--text-muted);
}

.error-state {
  color: var(--accent-danger);
}

.error-state svg {
  width: 40px;
  height: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-light);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* KPI Row */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.mini-kpi {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  text-align: center;
}

.mini-kpi-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.mini-kpi-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.mini-kpi-value.success { color: var(--accent-success); }
.mini-kpi-value.warning { color: var(--accent-warning); }
.mini-kpi-value.danger { color: var(--accent-danger); }

/* Chart Container */
.chart-container {
  margin-bottom: 16px;
}

/* Chart Type Bar */
.chart-type-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  margin-bottom: 24px;
}

.chart-type-label {
  font-size: 13px;
  color: var(--text-muted);
}

.chart-type-options {
  display: flex;
  gap: 6px;
}

.chart-type-btn {
  padding: 8px 14px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 13px;
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

/* Data Table */
.data-table-container {
  overflow-x: auto;
  border: 1px solid var(--border-light);
  border-radius: 12px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th,
.data-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
}

.data-table th {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: var(--bg-tertiary);
}

.data-table th.num,
.data-table td.num {
  text-align: right;
}

.data-table tbody tr {
  cursor: pointer;
  transition: background 0.2s ease;
}

.data-table tbody tr:hover {
  background: var(--bg-hover);
}

.data-table tbody tr.selected {
  background: rgba(59, 130, 246, 0.08);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.plantel-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.plantel-code {
  font-weight: 600;
  color: var(--text-primary);
}

.plantel-label {
  font-size: 12px;
  color: var(--text-muted);
}

.data-table td.success { color: var(--accent-success); }
.data-table td.warning { color: var(--accent-warning); }
.data-table td.danger { color: var(--accent-danger); }

.compliance-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.compliance-badge.high {
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-success);
}

.compliance-badge.medium {
  background: rgba(245, 158, 11, 0.15);
  color: var(--accent-warning);
}

.compliance-badge.low {
  background: rgba(239, 68, 68, 0.15);
  color: var(--accent-danger);
}

.drill-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.drill-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: rgba(59, 130, 246, 0.08);
}

.drill-btn svg {
  width: 18px;
  height: 18px;
}

/* Detail Section */
.detail-section {
  border-color: var(--accent-primary);
  border-width: 2px;
}

.detail-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.detail-kpi {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: 14px;
  text-align: center;
}

.detail-kpi-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.detail-kpi-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
}

.detail-kpi-value.success { color: var(--accent-success); }
.detail-kpi-value.warning { color: var(--accent-warning); }
.detail-kpi-value.danger { color: var(--accent-danger); }

.action-row {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--accent-primary);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  filter: brightness(1.1);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive */
@media (max-width: 1200px) {
  .kpi-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-filters {
    justify-content: flex-start;
  }

  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-kpis {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .kpi-row {
    grid-template-columns: 1fr;
  }

  .detail-kpis {
    grid-template-columns: 1fr;
  }

  .chart-type-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
