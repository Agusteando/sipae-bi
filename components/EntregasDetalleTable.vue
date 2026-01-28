<template>
  <div class="wrap">
    <div class="col">
      <div v-for="(item, i) in left" :key="'l'+i" class="row">
        <span class="dot" :style="{ backgroundColor: color(item) }"></span>
        <span class="text">{{ i + 1 }}.- {{ item.title }}</span>
      </div>
    </div>

    <div class="col">
      <div v-for="(item, i) in right" :key="'r'+i" class="row">
        <span class="dot" :style="{ backgroundColor: color(item) }"></span>
        <span class="text">{{ i + 1 + left.length }}.- {{ item.title }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getStatusColor } from "~/utils/statusColor";

const props = defineProps<{ rows: any[] }>();

const mid = computed(() => Math.ceil((props.rows?.length ?? 0) / 2));
const left = computed(() => (props.rows ?? []).slice(0, mid.value));
const right = computed(() => (props.rows ?? []).slice(mid.value));

function color(item: any) {
  return getStatusColor(item);
}
</script>

<style scoped>
.wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.col {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px;
  background: rgba(255,255,255,0.02);
}
.row {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 8px 6px;
  border-bottom: 1px dashed rgba(255,255,255,0.06);
}
.row:last-child { border-bottom: none; }
.dot { width: 10px; height: 10px; border-radius: 3px; margin-top: 4px; flex: 0 0 10px; }
.text { font-size: 13px; color: var(--text); line-height: 1.25; }
</style>