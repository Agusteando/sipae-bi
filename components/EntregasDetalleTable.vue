<template>
  <div class="wrap">
    <div class="col">
      <div v-for="(item, i) in left" :key="'l'+i" class="row">
        <span class="dot" :style="{ backgroundColor: color(item) }"></span>
        <span class="text">{{ i + 1 }}.- <span class="title">{{ item.title }}</span></span>
      </div>
    </div>

    <div class="col">
      <div v-for="(item, i) in right" :key="'r'+i" class="row">
        <span class="dot" :style="{ backgroundColor: color(item) }"></span>
        <span class="text">{{ i + 1 + left.length }}.- <span class="title">{{ item.title }}</span></span>
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
.wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.col {
  display: flex; flex-direction: column; gap: 0;
}
.row {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 8px 6px;
  border-bottom: 1px solid var(--border);
  transition: background 0.2s;
}
.row:hover { background: rgba(0,0,0,0.02); }
[data-theme="dark"] .row:hover { background: rgba(255,255,255,0.03); }
.row:last-child { border-bottom: none; }

.dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex: 0 0 8px; }
.text { font-size: 13px; color: var(--muted); line-height: 1.4; }
.title { color: var(--text); font-weight: 500; }
</style>