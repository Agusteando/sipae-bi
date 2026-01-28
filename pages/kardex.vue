<template>
  <div class="page">
    <div class="head">
      <div>
        <div class="h1">Kardex BI</div>
        <div class="sub">Comparación lado a lado + global → detalle + tabla compatible</div>
      </div>

      <div class="filters">
        <div class="field">
          <label>Mes</label>
          <input type="number" min="1" max="12" v-model.number="month" />
        </div>

        <div class="field">
          <label>Año</label>
          <input type="number" min="2000" max="2100" v-model.number="year" />
        </div>

        <div class="field">
          <label>Plantel A</label>
          <select v-model="plantelA">
            <option v-for="p in planteles" :key="p.code" :value="p.code">
              {{ p.label }} ({{ p.code }})
            </option>
          </select>
        </div>

        <div class="field">
          <label>Plantel B</label>
          <select v-model="plantelB">
            <option v-for="p in planteles" :key="p.code" :value="p.code">
              {{ p.label }} ({{ p.code }})
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- GLOBAL INSIGHTS -->
    <section class="section">
      <div class="sectionTitle">Global</div>

      <div class="grid2">
        <div class="panel">
          <GlobalToDetailChart title="Entregas (Global → Detalle)" :rows="globalRows" />
        </div>

        <div class="panel insights">
          <div class="insTitle">Insights (mecánicos)</div>
          <div class="insItem" v-for="(line, i) in globalInsights" :key="i">{{ line }}</div>
        </div>
      </div>
    </section>

    <!-- ENTREGAS KPI -->
    <section class="section">
      <div class="sectionTitle">Entregas Mensuales — {{ monthName }} {{ year }}</div>

      <div class="grid4">
        <KpiCard title="Entregadas" :left="aEntregasKpi.entregadas" :right="bEntregasKpi.entregadas" :leftLabel="aLabel" :rightLabel="bLabel" />
        <KpiCard title="Destiempo" :left="aEntregasKpi.destiempo" :right="bEntregasKpi.destiempo" :leftLabel="aLabel" :rightLabel="bLabel" />
        <KpiCard title="No entregó" :left="aEntregasKpi.noentregadas" :right="bEntregasKpi.noentregadas" :leftLabel="aLabel" :rightLabel="bLabel" />
        <KpiCard title="Asignadas" :left="aEntregasKpi.asignadas" :right="bEntregasKpi.asignadas" :leftLabel="aLabel" :rightLabel="bLabel" />
      </div>

      <div class="panel narrative">
        <div class="insTitle">Auto-análisis (activos)</div>
        <div class="insItem">A: {{ aNarrative || "—" }}</div>
        <div class="insItem">B: {{ bNarrative || "—" }}</div>
      </div>

      <div class="grid2">
        <div class="panel">
          <div class="panelTitle">Lista de Entregas — {{ aLabel }}</div>
          <EntregasDetalleTable :rows="aDetalleRows" />
        </div>

        <div class="panel">
          <div class="panelTitle">Lista de Entregas — {{ bLabel }}</div>
          <EntregasDetalleTable :rows="bDetalleRows" />
        </div>
      </div>

      <div class="panel comment">
        <div class="panelTitle">Estrategias (Entregas)</div>
        <textarea v-model="comments.entregas" @input="debouncedSave('entregas')" rows="3"></textarea>
      </div>
    </section>

    <!-- ATTENDANCE -->
    <section class="section" v-if="!aIsGral || !bIsGral">
      <div class="sectionTitle">Seguimiento a Ausencias — Comparación</div>

      <div class="grid1">
        <CompareBarChart
          title="Ausencias (Total por grupo)"
          :leftName="aLabel"
          :rightName="bLabel"
          :categories="attendanceCategories"
          :leftSeries="attendanceLeft"
          :rightSeries="attendanceRight"
        />
      </div>

      <div class="panel comment">
        <div class="panelTitle">Estrategias (Ausencias)</div>
        <textarea v-model="comments.attendance" @input="debouncedSave('attendance')" rows="3"></textarea>
      </div>
    </section>

    <!-- RUTA -->
    <section class="section">
      <div class="sectionTitle">Ruta — Conteo por observador</div>

      <div class="grid2">
        <div class="panel">
          <div class="panelTitle">{{ aLabel }}</div>
          <pre class="pre">{{ aRutaPreview }}</pre>
        </div>
        <div class="panel">
          <div class="panelTitle">{{ bLabel }}</div>
          <pre class="pre">{{ bRutaPreview }}</pre>
        </div>
      </div>

      <div class="panel comment">
        <div class="panelTitle">Estrategias (Ruta)</div>
        <textarea v-model="comments.ruta" @input="debouncedSave('ruta')" rows="3"></textarea>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { PLANTELES, getPlantelByCode, mapAttendancePlantel } from "~/shared/planteles";
import { monthLabelEs, clampMonth } from "~/utils/dates";
import KpiCard from "~/components/KpiCard.vue";
import EntregasDetalleTable from "~/components/EntregasDetalleTable.vue";
import CompareBarChart from "~/components/CompareBarChart.vue";
import GlobalToDetailChart from "~/components/GlobalToDetailChart.vue";
import { useComments } from "~/composables/useComments";

type EntregasRow = {
  asignadas: number;
  destiempo: number;
  entregadas: number;
  noentregadas: number;
  pendientes: number;
};

const planteles = PLANTELES;

const now = new Date();
const month = ref(clampMonth(now.getMonth() + 1));
const year = ref(now.getFullYear());

// defaults
const plantelA = ref("PM");
const plantelB = ref("PT");

const a = computed(() => getPlantelByCode(plantelA.value));
const b = computed(() => getPlantelByCode(plantelB.value));

const aLabel = computed(() => a.value?.label ?? "A");
const bLabel = computed(() => b.value?.label ?? "B");

const aIsGral = computed(() => !!a.value?.gral);
const bIsGral = computed(() => !!b.value?.gral);

const monthName = computed(() => monthLabelEs(year.value, month.value));

// -------------------- Entregas (A/B) --------------------
const aEntregasQuery = computed(() => ({
  id: a.value?.id ?? 0,
  month: month.value,
  year: year.value
}));

const bEntregasQuery = computed(() => ({
  id: b.value?.id ?? 0,
  month: month.value,
  year: year.value
}));

const aEntregasDs = useFetch<any>("/api/metrics/entregas", {
  query: aEntregasQuery,
  watch: [aEntregasQuery]
});

const bEntregasDs = useFetch<any>("/api/metrics/entregas", {
  query: bEntregasQuery,
  watch: [bEntregasQuery]
});

const aEntregasRow = computed<EntregasRow>(() => (aEntregasDs.data.value as any)?.rows?.[0] ?? {
  asignadas: 0, destiempo: 0, entregadas: 0, noentregadas: 0, pendientes: 0
});

const bEntregasRow = computed<EntregasRow>(() => (bEntregasDs.data.value as any)?.rows?.[0] ?? {
  asignadas: 0, destiempo: 0, entregadas: 0, noentregadas: 0, pendientes: 0
});

const aEntregasKpi = computed(() => ({
  asignadas: Number(aEntregasRow.value.asignadas ?? 0),
  destiempo: Number(aEntregasRow.value.destiempo ?? 0),
  entregadas: Number(aEntregasRow.value.entregadas ?? 0),
  noentregadas: Number(aEntregasRow.value.noentregadas ?? 0),
  pendientes: Number(aEntregasRow.value.pendientes ?? 0)
}));

const bEntregasKpi = computed(() => ({
  asignadas: Number(bEntregasRow.value.asignadas ?? 0),
  destiempo: Number(bEntregasRow.value.destiempo ?? 0),
  entregadas: Number(bEntregasRow.value.entregadas ?? 0),
  noentregadas: Number(bEntregasRow.value.noentregadas ?? 0),
  pendientes: Number(bEntregasRow.value.pendientes ?? 0)
}));

// -------------------- Lista detalle (A/B) --------------------
const aDetalleQuery = computed(() => ({
  plantel: a.value?.id ?? 0,
  month: month.value,
  year: year.value
}));

const bDetalleQuery = computed(() => ({
  plantel: b.value?.id ?? 0,
  month: month.value,
  year: year.value
}));

const aDetalleDs = useFetch<any>("/api/metrics/entregas_detalle", {
  query: aDetalleQuery,
  watch: [aDetalleQuery]
});

const bDetalleDs = useFetch<any>("/api/metrics/entregas_detalle", {
  query: bDetalleQuery,
  watch: [bDetalleQuery]
});

const aDetalleRows = computed(() => (aDetalleDs.data.value as any)?.rows ?? []);
const bDetalleRows = computed(() => (bDetalleDs.data.value as any)?.rows ?? []);

// -------------------- Attendance (A/B) --------------------
const aAttendancePlantel = computed(() => mapAttendancePlantel(a.value?.asistencia ?? a.value?.code ?? ""));
const bAttendancePlantel = computed(() => mapAttendancePlantel(b.value?.asistencia ?? b.value?.code ?? ""));

const aAttendanceQuery = computed(() => ({
  plantel: aAttendancePlantel.value,
  month: month.value,
  year: year.value
}));

const bAttendanceQuery = computed(() => ({
  plantel: bAttendancePlantel.value,
  month: month.value,
  year: year.value
}));

const aAttendanceDs = useFetch<any>("/api/metrics/attendance", {
  query: aAttendanceQuery,
  watch: [aAttendanceQuery]
});

const bAttendanceDs = useFetch<any>("/api/metrics/attendance", {
  query: bAttendanceQuery,
  watch: [bAttendanceQuery]
});

const attendanceCategories = computed(() => {
  const ar = ((aAttendanceDs.data.value as any)?.rows ?? []) as any[];
  const br = ((bAttendanceDs.data.value as any)?.rows ?? []) as any[];
  const set = new Set<string>();
  for (const r of ar) set.add(`${r.grado} ${r.grupo}`);
  for (const r of br) set.add(`${r.grado} ${r.grupo}`);
  return Array.from(set);
});

// For chart simplicity: compare total absences = to_check + addressed
const attendanceLeft = computed(() => {
  const ar = ((aAttendanceDs.data.value as any)?.rows ?? []) as any[];
  const map = new Map<string, number>();
  for (const r of ar) map.set(`${r.grado} ${r.grupo}`, Number(r.to_check ?? 0) + Number(r.addressed ?? 0));
  return attendanceCategories.value.map(c => map.get(c) ?? 0);
});

const attendanceRight = computed(() => {
  const br = ((bAttendanceDs.data.value as any)?.rows ?? []) as any[];
  const map = new Map<string, number>();
  for (const r of br) map.set(`${r.grado} ${r.grupo}`, Number(r.to_check ?? 0) + Number(r.addressed ?? 0));
  return attendanceCategories.value.map(c => map.get(c) ?? 0);
});

// -------------------- Global entregas --------------------
const globalQuery = computed(() => ({ month: month.value, year: year.value }));
const globalDs = useFetch<any>("/api/metrics/entregas_global", {
  query: globalQuery,
  watch: [globalQuery]
});

const globalRows = computed(() => ((globalDs.data.value as any)?.rows ?? []) as any[]);

const globalInsights = computed(() => {
  const rows = globalRows.value as any[];
  if (!rows.length) return ["Sin datos globales."];

  const topNo = [...rows].sort((a, b) => Number(b.noentregadas || 0) - Number(a.noentregadas || 0))[0];
  const topLate = [...rows].sort((a, b) => Number(b.destiempo || 0) - Number(a.destiempo || 0))[0];
  const topDone = [...rows].sort((a, b) => Number(b.entregadas || 0) - Number(a.entregadas || 0))[0];

  return [
    `Mayor "No entregó": ${topNo.plantelLabel} (${topNo.noentregadas}).`,
    `Mayor "Destiempo": ${topLate.plantelLabel} (${topLate.destiempo}).`,
    `Mayor "Entregadas": ${topDone.plantelLabel} (${topDone.entregadas}).`
  ];
});

// -------------------- Narrative --------------------
const aNarrQuery = computed(() => ({
  metricId: "entregas",
  id: a.value?.id ?? 0,
  month: month.value,
  year: year.value
}));

const bNarrQuery = computed(() => ({
  metricId: "entregas",
  id: b.value?.id ?? 0,
  month: month.value,
  year: year.value
}));

const aNarrDs = useFetch<{ text: string }>("/api/narrative", {
  query: aNarrQuery,
  watch: [aNarrQuery]
});

const bNarrDs = useFetch<{ text: string }>("/api/narrative", {
  query: bNarrQuery,
  watch: [bNarrQuery]
});

const aNarrative = computed(() => aNarrDs.data.value?.text ?? "");
const bNarrative = computed(() => bNarrDs.data.value?.text ?? "");

// -------------------- Ruta (same data both sides; shown twice for parity) --------------------
const rutaQuery = computed(() => ({ month: month.value, year: year.value }));

const aRutaDs = useFetch<any>("/api/metrics/ruta", {
  query: rutaQuery,
  watch: [rutaQuery]
});

const bRutaDs = useFetch<any>("/api/metrics/ruta", {
  query: rutaQuery,
  watch: [rutaQuery]
});

const aRutaPreview = computed(() => JSON.stringify((aRutaDs.data.value as any)?.rows?.slice(0, 8) ?? [], null, 2));
const bRutaPreview = computed(() => JSON.stringify((bRutaDs.data.value as any)?.rows?.slice(0, 8) ?? [], null, 2));

// -------------------- Comments (optional) --------------------
const { loadComments, saveComment } = useComments();

const comments = reactive<Record<string, string>>({
  entregas: "",
  attendance: "",
  ruta: ""
});

let saveTimer: any = null;

async function refreshComments() {
  try {
    const map = await loadComments({ plantel: plantelA.value, year: year.value, month: month.value });
    comments.entregas = map.entregas ?? comments.entregas;
    comments.attendance = map.attendance ?? comments.attendance;
    comments.ruta = map.ruta ?? comments.ruta;
  } catch {
    // ignore
  }
}

function debouncedSave(section: string) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await saveComment({
        plantel: plantelA.value,
        year: year.value,
        month: month.value,
        section_identifier: section,
        comment: comments[section] ?? ""
      });
    } catch {
      // ignore
    }
  }, 800);
}

watch([plantelA, month, year], () => {
  refreshComments();
}, { immediate: true });
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 18px; }
.head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.h1 { font-size: 22px; font-weight: 900; }
.sub { color: var(--muted); font-size: 13px; margin-top: 4px; }

.filters { display: flex; gap: 10px; flex-wrap: wrap; }
.field { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 12px; color: var(--muted); }
input, select {
  background: rgba(255,255,255,0.03);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 10px;
  min-width: 160px;
  outline: none;
}
input:focus, select:focus { border-color: rgba(96,165,250,0.55); }

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
.grid1 { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (max-width: 1100px) { .grid4 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 900px) { .grid2 { grid-template-columns: 1fr; } }

.insights { display: flex; flex-direction: column; gap: 8px; }
.insTitle { font-weight: 900; margin-bottom: 4px; }
.insItem { color: var(--text); font-size: 13px; line-height: 1.35; }
.narrative { margin-top: 12px; }

textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  color: var(--text);
  outline: none;
  resize: vertical;
}
textarea:focus { border-color: rgba(96,165,250,0.55); }
.pre {
  margin: 0;
  font-size: 12px;
  color: #cbd5e1;
  white-space: pre-wrap;
}
</style>
