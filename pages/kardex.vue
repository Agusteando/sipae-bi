<template>
  <div class="page">
    <div class="head">
      <div class="head-info">
        <h1 class="h1">Dashboard Kardex</h1>
        <div class="sub">Inteligencia de Negocios y Métricas Operativas</div>
      </div>
      
      <!-- View Toggle -->
      <div class="view-toggles">
        <button 
          class="view-btn" 
          :class="{ active: viewMode === 'compare' }" 
          @click="viewMode = 'compare'"
        >
          Comparativo (A/B)
        </button>
        <button 
          class="view-btn" 
          :class="{ active: viewMode === 'global' }" 
          @click="viewMode = 'global'"
        >
          Vista Global
        </button>
      </div>
    </div>

    <!-- GLOBAL VIEW -->
    <div v-if="viewMode === 'global'" class="animate-fade">
      <section class="section">
        <div class="sectionTitle">Panorama Global de Entregas</div>
        <div class="control-bar">
           <div class="field-inline">
            <label>Mes</label>
            <select v-model.number="monthA" class="mini-select">
              <option v-for="m in 12" :key="m" :value="m">{{ monthLabel(m) }}</option>
            </select>
            <input type="number" class="mini-input" v-model.number="yearA" />
          </div>
        </div>
        <GlobalToDetailChart 
          title="Entregas por Plantel (Drill-down)" 
          :rows="globalRows" 
        />
      </section>
    </div>

    <!-- COMPARISON VIEW (Original Logic Preserved) -->
    <div v-else class="animate-fade">
      <div class="filtersRow">
        <!-- SIDE A -->
        <div class="filterCard">
          <div class="cardHeader">
            <div class="indicator a"></div>
            <div class="filterTitle">Lado A</div>
          </div>
          <div class="grid">
            <div class="field">
              <label>Plantel</label>
              <select v-model="plantelA">
                <option v-for="p in planteles" :key="p.code" :value="p.code">
                  {{ p.label }}
                </option>
              </select>
            </div>
            <div class="field">
              <label>Mes</label>
              <select v-model.number="monthA">
                <option v-for="m in 12" :key="m" :value="m">{{ monthLabel(m) }}</option>
              </select>
            </div>
            <div class="field">
              <label>Año</label>
              <input type="number" min="2000" max="2100" v-model.number="yearA" />
            </div>
          </div>
          <div class="pill">{{ aPill }}</div>
        </div>

        <!-- SIDE B -->
        <div class="filterCard">
          <div class="cardHeader">
            <div class="indicator b"></div>
            <div class="filterTitle">Lado B</div>
          </div>
          <div class="grid">
            <div class="field">
              <label>Plantel</label>
              <select v-model="plantelB">
                <option v-for="p in planteles" :key="p.code" :value="p.code">
                  {{ p.label }}
                </option>
              </select>
            </div>
            <div class="field">
              <label>Mes</label>
              <select v-model.number="monthB">
                <option v-for="m in 12" :key="m" :value="m">{{ monthLabel(m) }}</option>
              </select>
            </div>
            <div class="field">
              <label>Año</label>
              <input type="number" min="2000" max="2100" v-model.number="yearB" />
            </div>
          </div>
          <div class="pill">{{ bPill }}</div>
        </div>
      </div>

      <!-- ENTREGAS -->
      <section class="section">
        <div class="sectionTitle">Entregas Mensuales</div>

        <div class="grid4">
          <KpiCard title="Entregadas" :left="aEntregas.entregadas" :right="bEntregas.entregadas" :leftLabel="aPill" :rightLabel="bPill" />
          <KpiCard title="Destiempo" :left="aEntregas.destiempo" :right="bEntregas.destiempo" :leftLabel="aPill" :rightLabel="bPill" />
          <KpiCard title="No entregó" :left="aEntregas.noentregadas" :right="bEntregas.noentregadas" :leftLabel="aPill" :rightLabel="bPill" />
          <KpiCard title="Asignadas" :left="aEntregas.asignadas" :right="bEntregas.asignadas" :leftLabel="aPill" :rightLabel="bPill" />
        </div>

        <div class="grid2">
          <div class="panel">
            <div class="panelTitle">Lista de Entregas — {{ aPill }}</div>
            <EntregasDetalleTable :rows="aDetalleRows" />
          </div>
          <div class="panel">
            <div class="panelTitle">Lista de Entregas — {{ bPill }}</div>
            <EntregasDetalleTable :rows="bDetalleRows" />
          </div>
        </div>
      </section>

      <!-- PLANEACIONES -->
      <section class="section">
        <div class="sectionTitle">Planeaciones Revisadas</div>

        <div class="grid2">
          <div class="panel">
            <div class="panelTitle">{{ aPill }}</div>
            <div v-if="aPlDs.pending.value" class="state-msg">Cargando…</div>
            <div v-else-if="aPlError" class="state-msg err">Error: {{ aPlError }}</div>
            <div v-else-if="aPlaneacionesRows.length === 0" class="state-msg">Sin datos / No aplica.</div>
            
            <div v-for="item in aPlaneacionesRows" :key="item.revisa" class="progressRow">
              <div class="progressHead">
                <div class="who">{{ item.revisa }}</div>
                <div class="nums">({{ n(item.conteo) }} / {{ planeaTotal(item) }})</div>
                <div class="pct">{{ pct(n(item.conteo), planeaTotal(item)).toFixed(1) }}%</div>
              </div>
              <div class="bar-track"><div class="bar-fill" :style="{ width: pct(n(item.conteo), planeaTotal(item)) + '%' }"></div></div>
            </div>
          </div>

          <div class="panel">
            <div class="panelTitle">{{ bPill }}</div>
            <div v-if="bPlDs.pending.value" class="state-msg">Cargando…</div>
            <div v-else-if="bPlError" class="state-msg err">Error: {{ bPlError }}</div>
            <div v-else-if="bPlaneacionesRows.length === 0" class="state-msg">Sin datos / No aplica.</div>
            
            <div v-for="item in bPlaneacionesRows" :key="item.revisa" class="progressRow">
              <div class="progressHead">
                <div class="who">{{ item.revisa }}</div>
                <div class="nums">({{ n(item.conteo) }} / {{ planeaTotal(item) }})</div>
                <div class="pct">{{ pct(n(item.conteo), planeaTotal(item)).toFixed(1) }}%</div>
              </div>
              <div class="bar-track"><div class="bar-fill" :style="{ width: pct(n(item.conteo), planeaTotal(item)) + '%' }"></div></div>
            </div>
          </div>
        </div>
      </section>

      <!-- BITÁCORAS -->
      <section class="section">
        <div class="sectionTitle">Bitácoras (días hábiles)</div>
        <div class="grid2">
          <div class="panel">
            <div class="panelTitle">{{ aPill }}</div>
            <BitacorasGrid :year="yearA" :month="monthA" :presentDays="aBitacorasDays" />
          </div>
          <div class="panel">
            <div class="panelTitle">{{ bPill }}</div>
            <BitacorasGrid :year="yearB" :month="monthB" :presentDays="bBitacorasDays" />
          </div>
        </div>
      </section>

      <!-- OBSERVACIONES GRUTA -->
      <section class="section">
        <div class="sectionTitle">Observaciones GRUTA</div>
        <div class="grid2">
          <div class="panel">
            <div class="panelTitle">{{ aPill }}</div>
            <div class="htmlWrap" v-html="aObsChartHtml"></div>
            <div class="obsText">{{ aObsText }}</div>
          </div>
          <div class="panel">
            <div class="panelTitle">{{ bPill }}</div>
            <div class="htmlWrap" v-html="bObsChartHtml"></div>
            <div class="obsText">{{ bObsText }}</div>
          </div>
        </div>
      </section>

      <!-- SAPF -->
      <section class="section">
        <div class="sectionTitle">Atención a Padres (SAPF)</div>
        <div class="grid1">
          <CompareBarChart
            title="SAPF (qty por depto)"
            :leftName="aPill"
            :rightName="bPill"
            :categories="sapfCategories"
            :leftSeries="sapfLeft"
            :rightSeries="sapfRight"
          />
        </div>
      </section>

      <!-- ATTENDANCE -->
      <section class="section">
        <div class="sectionTitle">Seguimiento a Ausencias</div>
        <div class="grid1">
          <CompareBarChart
            title="Ausencias (to_check + addressed)"
            :leftName="aPill"
            :rightName="bPill"
            :categories="attendanceCategories"
            :leftSeries="attendanceLeft"
            :rightSeries="attendanceRight"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import KpiCard from "~/components/KpiCard.vue";
import EntregasDetalleTable from "~/components/EntregasDetalleTable.vue";
import CompareBarChart from "~/components/CompareBarChart.vue";
import BitacorasGrid from "~/components/BitacorasGrid.vue";
import GlobalToDetailChart from "~/components/GlobalToDetailChart.vue"; // New Component

import { PLANTELES, getPlantelByCode, mapAttendancePlantel } from "~/shared/planteles";
import { monthLabelEs, clampMonth } from "~/utils/dates";

const planteles = PLANTELES;
const now = new Date();

// View State
const viewMode = ref<"compare" | "global">("compare");

// Side A
const plantelA = ref("PM");
const monthA = ref(clampMonth(now.getMonth() + 1));
const yearA = ref(now.getFullYear());

// Side B
const plantelB = ref("PT");
const monthB = ref(clampMonth(now.getMonth() + 1));
const yearB = ref(now.getFullYear());

const a = computed(() => getPlantelByCode(plantelA.value));
const b = computed(() => getPlantelByCode(plantelB.value));

const aLabel = computed(() => a.value?.label ?? "A");
const bLabel = computed(() => b.value?.label ?? "B");

const monthLabel = (m: number) => monthLabelEs(2000, m); // year doesn't matter for name

const aMonthName = computed(() => monthLabelEs(yearA.value, monthA.value));
const bMonthName = computed(() => monthLabelEs(yearB.value, monthB.value));

const aPill = computed(() => `${aLabel.value} · ${aMonthName.value} ${yearA.value}`);
const bPill = computed(() => `${bLabel.value} · ${bMonthName.value} ${yearB.value}`);

function n(v: any) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}
function pct(conteo: number, total: number) {
  if (!total) return 0;
  const p = (conteo / total) * 100;
  return Math.max(0, Math.min(100, p));
}
function planeaTotal(item: any) {
  const total = n(item?.total);
  const conteo = n(item?.conteo);
  return Math.max(total, conteo);
}

// -------------------- GLOBAL (New) --------------------
// Uses 'entregas_global' which was present in server code but unused in UI
const globalQuery = computed(() => ({ month: monthA.value, year: yearA.value }));
const globalDs = useFetch<any>("/api/metrics/entregas_global", { query: globalQuery, watch: [globalQuery] });
const globalRows = computed(() => globalDs.data.value?.rows ?? []);

// -------------------- ENTREGAS (A/B) --------------------
const aEntQuery = computed(() => ({ id: a.value?.id ?? 0, month: monthA.value, year: yearA.value }));
const bEntQuery = computed(() => ({ id: b.value?.id ?? 0, month: monthB.value, year: yearB.value }));

const aEntDs = useFetch<any>("/api/metrics/entregas", { query: aEntQuery, watch: [aEntQuery] });
const bEntDs = useFetch<any>("/api/metrics/entregas", { query: bEntQuery, watch: [bEntQuery] });

const aEntregas = computed(() => (aEntDs.data.value?.rows?.[0] ?? { asignadas: 0, destiempo: 0, entregadas: 0, noentregadas: 0, pendientes: 0 }));
const bEntregas = computed(() => (bEntDs.data.value?.rows?.[0] ?? { asignadas: 0, destiempo: 0, entregadas: 0, noentregadas: 0, pendientes: 0 }));

// -------------------- LISTA DETALLE (A/B) --------------------
const aDetQuery = computed(() => ({ plantel: a.value?.id ?? 0, mes: monthA.value, year: yearA.value }));
const bDetQuery = computed(() => ({ plantel: b.value?.id ?? 0, mes: monthB.value, year: yearB.value }));

const aDetDs = useFetch<any>("/api/metrics/entregas_detalle", { query: aDetQuery, watch: [aDetQuery] });
const bDetDs = useFetch<any>("/api/metrics/entregas_detalle", { query: bDetQuery, watch: [bDetQuery] });

const aDetalleRows = computed(() => aDetDs.data.value?.rows ?? []);
const bDetalleRows = computed(() => bDetDs.data.value?.rows ?? []);

// -------------------- PLANEACIONES (A/B) --------------------
const aPlQuery = computed(() => ({ plantel: aLabel.value, mes: monthA.value, year: yearA.value }));
const bPlQuery = computed(() => ({ plantel: bLabel.value, mes: monthB.value, year: yearB.value }));

const aPlDs = useFetch<any>("/api/metrics/planeaciones", { query: aPlQuery, watch: [aPlQuery] });
const bPlDs = useFetch<any>("/api/metrics/planeaciones", { query: bPlQuery, watch: [bPlQuery] });

const aPlaneacionesRows = computed(() => aPlDs.data.value?.rows ?? []);
const bPlaneacionesRows = computed(() => bPlDs.data.value?.rows ?? []);

const aPlError = computed(() => {
  const e: any = aPlDs.error.value;
  return e?.data?.message || e?.message || "";
});
const bPlError = computed(() => {
  const e: any = bPlDs.error.value;
  return e?.data?.message || e?.message || "";
});

// -------------------- BITÁCORAS (A/B) --------------------
const aBitQuery = computed(() => ({ plantel: plantelA.value, month: monthA.value, year: yearA.value }));
const bBitQuery = computed(() => ({ plantel: plantelB.value, month: monthB.value, year: yearB.value }));

const aBitDs = useFetch<any>("/api/metrics/bitacoras", { query: aBitQuery, watch: [aBitQuery] });
const bBitDs = useFetch<any>("/api/metrics/bitacoras", { query: bBitQuery, watch: [bBitQuery] });

const aBitacorasDays = computed(() => (aBitDs.data.value?.rows ?? []).map((r: any) => String(r.day)));
const bBitacorasDays = computed(() => (bBitDs.data.value?.rows ?? []).map((r: any) => String(r.day)));

// -------------------- OBSERVACIONES (A/B) --------------------
const aObsQuery = computed(() => ({
  campus: a.value?.campus ?? "Unknown",
  nivel: a.value?.nivel ?? "Unknown",
  month: monthA.value,
  year: yearA.value
}));
const bObsQuery = computed(() => ({
  campus: b.value?.campus ?? "Unknown",
  nivel: b.value?.nivel ?? "Unknown",
  month: monthB.value,
  year: yearB.value
}));

const aObsDs = useFetch<any>("/api/metrics/observaciones", { query: aObsQuery, watch: [aObsQuery] });
const bObsDs = useFetch<any>("/api/metrics/observaciones", { query: bObsQuery, watch: [bObsQuery] });

const aObsChartHtml = computed(() => String(aObsDs.data.value?.rows?.[0]?.chartHtml ?? ""));
const bObsChartHtml = computed(() => String(bObsDs.data.value?.rows?.[0]?.chartHtml ?? ""));
const aObsText = computed(() => String(aObsDs.data.value?.rows?.[0]?.text ?? ""));
const bObsText = computed(() => String(bObsDs.data.value?.rows?.[0]?.text ?? ""));

// -------------------- SAPF (A/B) --------------------
const aSapfQuery = computed(() => ({ plantel: plantelA.value, month: monthA.value, year: yearA.value }));
const bSapfQuery = computed(() => ({ plantel: plantelB.value, month: monthB.value, year: yearB.value }));

const aSapfDs = useFetch<any>("/api/metrics/sapf", { query: aSapfQuery, watch: [aSapfQuery] });
const bSapfDs = useFetch<any>("/api/metrics/sapf", { query: bSapfQuery, watch: [bSapfQuery] });

const sapfCategories = computed(() => {
  const ar = (aSapfDs.data.value?.rows ?? []) as any[];
  const br = (bSapfDs.data.value?.rows ?? []) as any[];
  const set = new Set<string>();
  for (const r of ar) set.add(String(r.depto));
  for (const r of br) set.add(String(r.depto));
  return Array.from(set).sort();
});

const sapfLeft = computed(() => {
  const ar = (aSapfDs.data.value?.rows ?? []) as any[];
  const map = new Map<string, number>();
  for (const r of ar) map.set(String(r.depto), n(r.qty));
  return sapfCategories.value.map(k => map.get(k) ?? 0);
});

const sapfRight = computed(() => {
  const br = (bSapfDs.data.value?.rows ?? []) as any[];
  const map = new Map<string, number>();
  for (const r of br) map.set(String(r.depto), n(r.qty));
  return sapfCategories.value.map(k => map.get(k) ?? 0);
});

// -------------------- ATTENDANCE (A/B) --------------------
const aAttendancePlantel = computed(() => mapAttendancePlantel(a.value?.asistencia ?? plantelA.value));
const bAttendancePlantel = computed(() => mapAttendancePlantel(b.value?.asistencia ?? plantelB.value));

const aAttQuery = computed(() => ({ plantel: aAttendancePlantel.value, mes: monthA.value, year: yearA.value }));
const bAttQuery = computed(() => ({ plantel: bAttendancePlantel.value, mes: monthB.value, year: yearB.value }));

const aAttDs = useFetch<any>("/api/metrics/attendance", { query: aAttQuery, watch: [aAttQuery] });
const bAttDs = useFetch<any>("/api/metrics/attendance", { query: bAttQuery, watch: [bAttQuery] });

const attendanceCategories = computed(() => {
  const ar = (aAttDs.data.value?.rows ?? []) as any[];
  const br = (bAttDs.data.value?.rows ?? []) as any[];
  const set = new Set<string>();
  for (const r of ar) set.add(`${r.grado} ${r.grupo}`);
  for (const r of br) set.add(`${r.grado} ${r.grupo}`);
  return Array.from(set);
});

const attendanceLeft = computed(() => {
  const ar = (aAttDs.data.value?.rows ?? []) as any[];
  const map = new Map<string, number>();
  for (const r of ar) map.set(`${r.grado} ${r.grupo}`, n(r.to_check) + n(r.addressed));
  return attendanceCategories.value.map(k => map.get(k) ?? 0);
});

const attendanceRight = computed(() => {
  const br = (bAttDs.data.value?.rows ?? []) as any[];
  const map = new Map<string, number>();
  for (const r of br) map.set(`${r.grado} ${r.grupo}`, n(r.to_check) + n(r.addressed));
  return attendanceCategories.value.map(k => map.get(k) ?? 0);
});
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 10px; }
.h1 { font-size: 28px; font-weight: 800; margin: 0; color: var(--text); line-height: 1.1; }
.sub { color: var(--muted); font-size: 14px; margin-top: 4px; }

.view-toggles {
  background: var(--panel);
  border: 1px solid var(--border);
  padding: 4px;
  border-radius: 12px;
  display: flex;
  box-shadow: var(--shadow);
}
.view-btn {
  background: transparent;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--muted);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}
.view-btn.active {
  background: var(--accent);
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* FILTERS */
.filtersRow {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
@media (max-width: 1024px) { .filtersRow { grid-template-columns: 1fr; } }

.filterCard {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--shadow);
  transition: border-color 0.2s;
}
.cardHeader { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.indicator { width: 10px; height: 10px; border-radius: 50%; }
.indicator.a { background: var(--accent); box-shadow: 0 0 8px var(--accent); }
.indicator.b { background: #34d399; box-shadow: 0 0 8px #34d399; }

.filterTitle { font-weight: 800; color: var(--text); font-size: 16px; }

.grid { display: grid; grid-template-columns: 1fr 120px 100px; gap: 12px; }
@media (max-width: 500px) { .grid { grid-template-columns: 1fr; } }

.field { display: flex; flex-direction: column; gap: 6px; }
.control-bar { display: flex; gap: 10px; margin-bottom: 16px; align-items: center; }
.field-inline { display: flex; align-items: center; gap: 8px; }

label { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }

input, select {
  background: var(--input-bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
input:focus, select:focus { 
  border-color: var(--accent); 
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15); 
}

.mini-select, .mini-input { padding: 6px 10px; font-size: 14px; }
.mini-input { width: 80px; }

.pill {
  margin-top: 14px;
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--bg);
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
}

/* SECTIONS */
.section {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px;
  box-shadow: var(--shadow);
  margin-bottom: 24px;
}
.section:last-child { margin-bottom: 0; }
.sectionTitle { 
  font-weight: 800; 
  font-size: 18px; 
  margin-bottom: 16px; 
  color: var(--text); 
  border-left: 4px solid var(--accent);
  padding-left: 10px;
}

.panel {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
}
.panelTitle { 
  font-weight: 700; 
  margin-bottom: 12px; 
  font-size: 14px; 
  color: var(--text);
  opacity: 0.9;
}

/* LAYOUTS */
.grid4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
.grid1 { display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 16px; }

@media (max-width: 1100px) { .grid4 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 900px) { .grid2 { grid-template-columns: 1fr; } }

/* STATES */
.state-msg { color: var(--muted); font-size: 14px; padding: 20px 0; text-align: center; font-style: italic; }
.state-msg.err { color: #ef4444; }

/* PROGRESS */
.progressRow { padding: 12px 0; border-bottom: 1px solid var(--border); }
.progressRow:last-child { border-bottom: none; }

.progressHead { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
.who { font-weight: 700; font-size: 14px; color: var(--text); }
.nums { font-size: 12px; color: var(--muted); margin-left: auto; margin-right: 8px; }
.pct { font-weight: 800; font-size: 13px; color: var(--accent); }

.bar-track {
  width: 100%; height: 8px; border-radius: 4px;
  background: var(--border);
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #34d399);
  border-radius: 4px;
  transition: width 0.6s ease-out;
}

/* HTML CONTENT */
.htmlWrap { margin-bottom: 12px; border-radius: 8px; overflow: hidden; }
.htmlWrap :deep(img), .htmlWrap :deep(svg) { max-width: 100%; height: auto; display: block; }
.obsText { font-size: 14px; color: var(--text); white-space: pre-wrap; line-height: 1.5; opacity: 0.9; }
</style>