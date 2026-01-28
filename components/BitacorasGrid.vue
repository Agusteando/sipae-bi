<template>
  <div class="wrap">
    <div class="grid">
      <div
        v-for="d in days"
        :key="d.ymd"
        class="cell"
        :class="{
          ok: d.present,
          miss: !d.present,
          future: d.future
        }"
        :title="d.ymd"
      >
        {{ d.dd }}
      </div>
    </div>

    <div class="legend">
      <span class="dot ok"></span><span>cumple</span>
      <span class="dot miss"></span><span>no cumple</span>
      <span class="dot future"></span><span>futuro</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  year: number;
  month: number; // 1..12
  presentDays: string[]; // ["YYYY-MM-DD", ...]
}>();

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const present = computed(() => new Set(props.presentDays.map(String)));

const days = computed(() => {
  const out: { ymd: string; dd: string; present: boolean; future: boolean }[] = [];

  const start = new Date(props.year, props.month - 1, 1);
  const end = new Date(props.year, props.month, 0);

  const today = new Date();
  const todayYMD = ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

  for (let day = 1; day <= end.getDate(); day++) {
    const dt = new Date(props.year, props.month - 1, day);

    const dow = dt.getDay(); // 0 Sun .. 6 Sat
    if (dow === 0 || dow === 6) continue; // weekdays only, like legacy

    const key = ymd(dt);
    const isFuture = key > todayYMD;

    out.push({
      ymd: key,
      dd: String(day).padStart(2, "0"),
      present: present.value.has(key),
      future: isFuture
    });
  }

  return out;
});
</script>

<style scoped>
.wrap { display: flex; flex-direction: column; gap: 12px; }

.grid {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 8px;
}
@media (max-width: 900px) {
  .grid { grid-template-columns: repeat(7, minmax(0, 1fr)); }
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--border);
  font-weight: 900;
  color: #0b1220;
  user-select: none;
}
.cell.ok { background: rgba(34,197,94,0.85); }
.cell.miss { background: rgba(239,68,68,0.85); }
.cell.future { background: rgba(148,163,184,0.45); color: #e2e8f0; }

.legend {
  display: flex;
  gap: 10px;
  align-items: center;
  color: #cbd5e1;
  font-size: 12px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  display: inline-block;
  border: 1px solid var(--border);
}
.dot.ok { background: rgba(34,197,94,0.85); }
.dot.miss { background: rgba(239,68,68,0.85); }
.dot.future { background: rgba(148,163,184,0.45); }
</style>