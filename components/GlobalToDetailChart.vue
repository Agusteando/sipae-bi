<template>
  <div class="g-chart-container">
    <div class="header">
      <div class="hint" v-if="!selected">
        👆 Haz clic en una barra para ver el detalle de entregas.
      </div>
      <button class="btn-back" @click="toggleBack" :disabled="!selected">
        {{ selected ? "← Volver al Global" : "Vista Global" }}
      </button>
    </div>

    <client-only>
      <VChart class="chart" :option="option" autoresize @click="onClick" />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from "~/composables/useTheme";
import VChart from "vue-echarts";

type GlobalRow = { plantelCode: string; plantelLabel: string; entregadas: number; noentregadas: number; destiempo: number; asignadas: number };

const props = defineProps<{
  title: string;
  rows: GlobalRow[];
}>();

const selected = ref<string | null>(null);
const { chartTextColor, chartLineColor, chartGridColor } = useTheme();

const option = computed(() => {
  const common = {
    tooltip: { 
      trigger: "axis",
      backgroundColor: chartTextColor.value === '#e5e7eb' ? '#1f2937' : '#ffffff',
      textStyle: { color: chartTextColor.value === '#e5e7eb' ? '#fff' : '#000' }
    },
    grid: { left: 10, right: 10, top: 20, bottom: 40, containLabel: true },
    yAxis: {
      type: "value",
      axisLabel: { color: chartTextColor.value },
      splitLine: { lineStyle: { color: chartGridColor.value } },
      axisLine: { lineStyle: { color: chartLineColor.value } }
    },
  };

  if (!selected.value) {
    return {
      ...common,
      xAxis: {
        type: "category",
        data: props.rows.map(r => r.plantelLabel),
        axisLabel: { color: chartTextColor.value, interval: 0, rotate: 25, fontSize: 11 },
        axisLine: { lineStyle: { color: chartLineColor.value } }
      },
      series: [
        {
          type: "bar",
          universalTransition: true,
          data: props.rows.map(r => ({
            name: r.plantelLabel,
            value: r.entregadas,
            _code: r.plantelCode,
            itemStyle: { color: '#3b82f6' }
          })),
          label: { show: true, position: 'top', color: chartTextColor.value, formatter: '{c}' }
        }
      ]
    };
  }

  const r = props.rows.find(x => x.plantelCode === selected.value);
  const detail = r
    ? [
        { name: "Entregadas", value: r.entregadas, itemStyle: { color: '#22c55e' } },
        { name: "Destiempo", value: r.destiempo, itemStyle: { color: '#eab308' } },
        { name: "No entregó", value: r.noentregadas, itemStyle: { color: '#ef4444' } },
        { name: "Asignadas", value: r.asignadas, itemStyle: { color: '#6366f1' } }
      ]
    : [];

  return {
    ...common,
    xAxis: {
      type: "category",
      data: detail.map(d => d.name),
      axisLabel: { color: chartTextColor.value, fontSize: 12, fontWeight: 'bold' },
      axisLine: { lineStyle: { color: chartLineColor.value } }
    },
    series: [
      {
        type: "bar",
        universalTransition: true,
        data: detail,
        label: { show: true, position: 'top', color: chartTextColor.value }
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
.g-chart-container {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; height: 32px; }
.hint { color: var(--accent); font-size: 13px; font-weight: 600; animation: bounce 2s infinite; }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

.btn-back {
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text);
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
}
.btn-back:disabled { opacity: 0; pointer-events: none; }
.btn-back:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }

.chart { width: 100%; height: 400px; }
</style>