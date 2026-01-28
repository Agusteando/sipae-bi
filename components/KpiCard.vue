<template>
  <div class="card">
    <div class="title">{{ title }}</div>

    <div class="values">
      <div class="value">
        <div class="label">{{ leftLabel }}</div>
        <div class="num">{{ fmt(left) }}</div>
      </div>

      <div class="value">
        <div class="label">{{ rightLabel }}</div>
        <div class="num">{{ fmt(right) }}</div>
      </div>

      <div class="delta" :class="deltaClass">
        <div class="label">Δ</div>
        <div class="num">{{ fmt(delta) }}</div>
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

const leftLabel = computed(() => props.leftLabel ?? "A");
const rightLabel = computed(() => props.rightLabel ?? "B");

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
  border: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  border-radius: 16px;
  padding: 14px;
}
.title { font-weight: 800; color: var(--text); margin-bottom: 10px; }
.values { display: grid; grid-template-columns: 1fr 1fr 0.9fr; gap: 10px; }
.value, .delta {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 10px;
  background: rgba(0,0,0,0.15);
}
.label { font-size: 12px; color: var(--muted); }
.num { font-size: 22px; font-weight: 900; margin-top: 4px; }
.delta.pos { border-color: rgba(34,197,94,0.45); }
.delta.neg { border-color: rgba(239,68,68,0.45); }
.delta.neu { border-color: var(--border); }
</style>
