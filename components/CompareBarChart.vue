<template>
  <div class="chart-wrapper">
    <client-only>
      <VChart class="chart" :option="option" autoresize />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from "~/composables/useTheme";
import VChart from "vue-echarts";

const props = defineProps<{
  title: string;
  leftName: string;
  rightName: string;
  categories: string[];
  leftSeries: number[];
  rightSeries: number[];
}>();

const { chartTextColor, chartLineColor, chartGridColor } = useTheme();

const option = computed(() => {
  return {
    tooltip: { 
      trigger: "axis",
      backgroundColor: chartTextColor.value === '#e5e7eb' ? '#1f2937' : '#ffffff',
      textStyle: { color: chartTextColor.value === '#e5e7eb' ? '#fff' : '#000' }
    },
    legend: { textStyle: { color: chartTextColor.value } },
    grid: { left: 10, right: 10, top: 40, bottom: 10, containLabel: true },
    xAxis: {
      type: "category",
      data: props.categories,
      axisLabel: { color: chartTextColor.value, interval: 0, rotate: 20, fontSize: 11 },
      axisLine: { lineStyle: { color: chartLineColor.value } }
    },
    yAxis: {
      type: "value",
      axisLabel: { color: chartTextColor.value },
      splitLine: { lineStyle: { color: chartGridColor.value } },
      axisLine: { lineStyle: { color: chartLineColor.value } }
    },
    series: [
      { name: props.leftName, type: "bar", data: props.leftSeries, itemStyle: { color: '#3b82f6' } },
      { name: props.rightName, type: "bar", data: props.rightSeries, itemStyle: { color: '#34d399' } }
    ]
  };
});
</script>

<style scoped>
.chart-wrapper { width: 100%; height: 350px; }
.chart { width: 100%; height: 100%; }
</style>