<template>
  <div class="card">
    <div class="title">{{ title }}</div>

    <div class="values">
      <div class="block">
        <div class="lbl">{{ leftLabel }}</div>
        <div class="val">{{ fmt(left) }}</div>
      </div>

      <div class="block">
        <div class="lbl">{{ rightLabel }}</div>
        <div class="val">{{ fmt(right) }}</div>
      </div>

      <div class="delta" :class="deltaClass">
        <div class="lbl">Diff</div>
        <div class="val">{{ delta > 0 ? '+' : '' }}{{ fmt(delta) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  left: number;
  right: number;
  leftLabel?: string;
  rightLabel?: string;
}>();

const leftLabel = computed(() => props.leftLabel?.split('·')[0].trim() ?? "A");
const rightLabel = computed(() => props.rightLabel?.split('·')[0].trim() ?? "B");

const delta = computed(() => (Number(props.left) || 0) - (Number(props.right) || 0));
const deltaClass = computed(() => {
  if (delta.value > 0) return "pos";
  if (delta.value < 0) return "neg";
  return "neu";
});

function fmt(n: any) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return new Intl.NumberFormat("es-MX").format(x);
}
</script>

<style scoped>
.card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.title { 
  font-weight: 700; 
  color: var(--muted); 
  font-size: 13px; 
  text-transform: uppercase; 
  letter-spacing: 0.5px; 
  margin-bottom: 12px; 
}

.values { display: flex; gap: 8px; justify-content: space-between; align-items: stretch; }

.block, .delta {
  flex: 1;
  padding: 8px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.block { background: var(--panel); border: 1px solid var(--border); }

.delta { border: 1px solid transparent; align-items: center; background: var(--panel); }
.delta.pos { background: rgba(34,197,94,0.1); color: #16a34a; border-color: rgba(34,197,94,0.2); }
.delta.neg { background: rgba(239,68,68,0.1); color: #dc2626; border-color: rgba(239,68,68,0.2); }
.delta.neu { background: var(--panel); border-color: var(--border); color: var(--muted); }

[data-theme="dark"] .delta.pos { background: rgba(34,197,94,0.15); color: #4ade80; }
[data-theme="dark"] .delta.neg { background: rgba(239,68,68,0.15); color: #f87171; }

.lbl { font-size: 10px; color: var(--muted); margin-bottom: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
.delta .lbl { color: inherit; opacity: 0.8; }

.val { font-size: 18px; font-weight: 800; color: var(--text); }
.delta .val { color: inherit; }
</style>