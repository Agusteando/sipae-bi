<template>
  <div class="page">
    <div class="head">
      <div>
        <div class="h1">Kardex BI</div>
        <div class="sub">Comparación flexible por lado: Plantel + Mes + Año</div>
      </div>

      <div class="filtersRow">
        <!-- SIDE A -->
        <div class="filterCard">
          <div class="filterTitle">Lado A</div>
          <div class="grid">
            <div class="field">
              <label>Plantel</label>
              <select v-model="plantelA">
                <option v-for="p in planteles" :key="p.code" :value="p.code">
                  {{ p.label }} ({{ p.code }})
                </option>
              </select>
            </div>
            <div class="field">
              <label>Mes</label>
              <input type="number" min="1" max="12" v-model.number="monthA" />
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
          <div class="filterTitle">Lado B</div>
          <div class="grid">
            <div class="field">
              <label>Plantel</label>
              <select v-model="plantelB">
                <option v-for="p in planteles" :key="p.code" :value="p.code">
                  {{ p.label }} ({{ p.code }})
                </option>
              </select>
            </div>
            <div class="field">
              <label>Mes</label>
              <input type="number" min="1" max="12" v-model.number="monthB" />
            </div>
            <div class="field">
              <label>Año</label>
              <input type="number" min="2000" max="2100" v-model.number="yearB" />
            </div>
          </div>
          <div class="pill">{{ bPill }}</div>
        </div>
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

          <div v-if="aPlDs.pending.value" class="empty">Cargando…</div>
          <div v-else-if="aPlError" class="empty err">Error: {{ aPlError }}</div>
          <div v-else-if="aPlaneacionesRows.length === 0" class="empty">
            Sin datos / No aplica.
          </div>

          <div v-for="item in aPlaneacionesRows" :key="item.revisa" class="progressRow">
            <div class="progressHead">
              <div class="who">{{ item.revisa }}</div>
              <div class="nums">({{ n(item.conteo) }} / {{ planeaTotal(item) }})</div>
              <div class="pct">{{ pct(n(item.conteo), planeaTotal(item)).toFixed(2) }}%</div>
            </div>
            <div class="bar"><div class="fill" :style="{ width: pct(n(item.conteo), planeaTotal(item)) + '%' }"></div></div>
          </div>
        </div>

        <div class="panel">
          <div class="panelTitle">{{ bPill }}</div>

          <div v-if="bPlDs.pending.value" class="empty">Cargando…</div>
          <div v-else-if="bPlError" class="empty err">Error: {{ bPlError }}</div>
          <div v-else-if="bPlaneacionesRows.length === 0" class="empty">
            Sin datos / No aplica.
          </div>

          <div v-for="item in bPlaneacionesRows" :key="item.revisa" class="progressRow">
            <div class="progressHead">
              <div class="who">{{ item.revisa }}</div>
              <div class="nums">({{ n(item.conteo) }} / {{ planeaTotal(item) }})</div>
              <div class="pct">{{ pct(n(item.conteo), planeaTotal(item)).toFixed(2) }}%</div>
            </div>
            <div class="bar"><div class="fill" :style="{ width: pct(n(item.conteo), planeaTotal(item)) + '%' }"></div></div>
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
          title="Ausencias (to_check + addressed por grupo)"
          :leftName="aPill"
          :rightName="bPill"
          :categories="attendanceCategories"
          :leftSeries="attendanceLeft"
          :rightSeries="attendanceRight"
        />
      </div>
    </section>

    <!-- RUTA removed completely (NOT GRUTA) -->
  </div>
</template>

<script setup lang="ts">
import KpiCard from "~/components/KpiCard.vue";
import EntregasDetalleTable from "~/components/EntregasDetalleTable.vue";
import CompareBarChart from "~/components/CompareBarChart.vue";
import BitacorasGrid from "~/components/BitacorasGrid.vue";

import { PLANTELES, getPlantelByCode, mapAttendancePlantel } from "~/shared/planteles";
import { monthLabelEs, clampMonth } from "~/utils/dates";

const planteles = PLANTELES;

const now = new Date();

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
  return Array.from(set);
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
.page { display: flex; flex-direction: column; gap: 18px; }
.head { display: flex; flex-direction: column; gap: 14px; }
.h1 { font-size: 22px; font-weight: 900; }
.sub { color: var(--muted); font-size: 13px; margin-top: 4px; }

.filtersRow {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
@media (max-width: 1100px) { .filtersRow { grid-template-columns: 1fr; } }

.filterCard {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px;
  background: rgba(255,255,255,0.02);
}
.filterTitle { font-weight: 900; margin-bottom: 10px; }
.grid { display: grid; grid-template-columns: 1fr 120px 140px; gap: 10px; }
@media (max-width: 520px) { .grid { grid-template-columns: 1fr; } }

.field { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 12px; color: var(--muted); }
input, select {
  background: rgba(255,255,255,0.03);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 10px;
  outline: none;
}
input:focus, select:focus { border-color: rgba(96,165,250,0.55); }

.pill {
  margin-top: 10px;
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(0,0,0,0.14);
  font-size: 12px;
  color: #cbd5e1;
}

.section {
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 14px;
  background: rgba(255,255,255,0.02);
}
.sectionTitle { font-weight: 900; margin-bottom: 12px; }

.panel {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px;
  background: rgba(0,0,0,0.12);
}
.panelTitle { font-weight: 900; margin-bottom: 10px; }

.grid4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
.grid1 { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 12px; }

@media (max-width: 1100px) { .grid4 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 900px) { .grid2 { grid-template-columns: 1fr; } }

.empty { color: var(--muted); font-size: 13px; padding: 10px 0; }
.empty.err { color: rgba(248, 113, 113, 0.95); }

.progressRow { padding: 10px 0; border-bottom: 1px dashed rgba(255,255,255,0.07); }
.progressRow:last-child { border-bottom: none; }

.progressHead {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: baseline;
  margin-bottom: 8px;
}
.who { font-weight: 800; }
.nums { color: var(--muted); font-size: 12px; }
.pct { font-weight: 900; font-size: 12px; }

.bar {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.03);
  overflow: hidden;
}
.fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(96,165,250,0.85), rgba(34,197,94,0.75));
  border-radius: 999px;
}

.htmlWrap :deep(svg),
.htmlWrap :deep(img),
.htmlWrap :deep(canvas) {
  max-width: 100%;
  height: auto;
}
.obsText {
  margin-top: 10px;
  font-size: 13px;
  color: #cbd5e1;
  white-space: pre-wrap;
}
</style>