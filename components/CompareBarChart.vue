<template>
  <div class="card">
    <div class="header">
      <div class="title">{{ title }}</div>
      <div class="meta">{{ leftName }} vs {{ rightName }}</div>
    </div>

    <client-only>
      <VChart class="chart" :option="option" autoresize />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import VChart from "vue-echarts";

const props = defineProps<{
  title: string;
  leftName: string;
  rightName: string;
  categories: string[];
  leftSeries: number[];
  rightSeries: number[];
}>();

const option = computed(() => {
  return {
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: "#e5e7eb" } },
    grid: { left: 28, right: 18, top: 30, bottom: 38, containLabel: true },
    xAxis: {
      type: "category",
      data: props.categories,
      axisLabel: { color: "#9ca3af", interval: 0, rotate: 20 },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.14)" } }
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#9ca3af" },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.14)" } }
    },
    series: [
      { name: props.leftName, type: "bar", data: props.leftSeries },
      { name: props.rightName, type: "bar", data: props.rightSeries }
    ]
  };
});
</script>

<style scoped>
.card {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px;
  background: rgba(255,255,255,0.02);
}
.header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px; }
.title { font-weight: 900; }
.meta { color: var(--muted); font-size: 12px; }
.chart { width: 100%; height: 360px; }
</style>
