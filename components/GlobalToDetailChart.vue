<template>
  <div class="card">
    <div class="header">
      <div class="title">{{ title }}</div>
      <button class="btn" @click="toggleBack" :disabled="!selected">
        {{ selected ? "Volver a Global" : "Global → Detalle (click)" }}
      </button>
    </div>

    <div class="hint" v-if="!selected">
      Click en un plantel para morph a detalle.
    </div>

    <client-only>
      <VChart class="chart" :option="option" autoresize @click="onClick" />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import VChart from "vue-echarts";

type GlobalRow = { plantelCode: string; plantelLabel: string; entregadas: number; noentregadas: number; destiempo: number; asignadas: number };

const props = defineProps<{
  title: string;
  rows: GlobalRow[];
}>();

const selected = ref<string | null>(null);

const option = computed(() => {
  if (!selected.value) {
    return {
      tooltip: { trigger: "axis" },
      grid: { left: 28, right: 18, top: 20, bottom: 52, containLabel: true },
      xAxis: {
        type: "category",
        data: props.rows.map(r => r.plantelLabel),
        axisLabel: { color: "#9ca3af", interval: 0, rotate: 25 },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.14)" } }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#9ca3af" },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.14)" } }
      },
      series: [
        {
          type: "bar",
          universalTransition: true,
          data: props.rows.map(r => ({
            name: r.plantelLabel,
            value: r.entregadas,
            _code: r.plantelCode
          }))
        }
      ]
    };
  }

  const r = props.rows.find(x => x.plantelCode === selected.value);
  const detail = r
    ? [
        { name: "Entregadas", value: r.entregadas },
        { name: "Destiempo", value: r.destiempo },
        { name: "No entregó", value: r.noentregadas },
        { name: "Asignadas", value: r.asignadas }
      ]
    : [];

  return {
    tooltip: { trigger: "axis" },
    grid: { left: 28, right: 18, top: 20, bottom: 40, containLabel: true },
    xAxis: {
      type: "category",
      data: detail.map(d => d.name),
      axisLabel: { color: "#9ca3af" },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.14)" } }
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#9ca3af" },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.14)" } }
    },
    series: [
      {
        type: "bar",
        universalTransition: true,
        data: detail
      }
    ]
  };
});

function onClick(e: any) {
  if (selected.value) return;
  const idx = e?.dataIndex;
  if (typeof idx !== "number") return;
  const code = props.rows[idx]?.plantelCode;
  if (code) selected.value = code;
}

function toggleBack() {
  selected.value = null;
}
</script>

<style scoped>
.card {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px;
  background: rgba(255,255,255,0.02);
}
.header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.title { font-weight: 900; }
.hint { margin: 6px 0 10px; color: var(--muted); font-size: 12px; }
.chart { width: 100%; height: 380px; }
.btn {
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.03);
  color: var(--text);
  padding: 8px 10px;
  border-radius: 12px;
  cursor: pointer;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn:hover:not(:disabled) { border-color: rgba(96,165,250,0.55); }
</style>
