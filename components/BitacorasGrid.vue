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
      <div class="lg-item"><span class="dot ok"></span> Cumple</div>
      <div class="lg-item"><span class="dot miss"></span> No cumple</div>
      <div class="lg-item"><span class="dot future"></span> Futuro</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  year: number;
  month: number; 
  presentDays: string[]; 
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
    const dow = dt.getDay(); 
    if (dow === 0 || dow === 6) continue; 

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
.wrap { display: flex; flex-direction: column; gap: 16px; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  gap: 6px;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  color: white;
  user-select: none;
  border: 1px solid transparent;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.cell.ok { background: #22c55e; border-color: #16a34a; }
.cell.miss { background: #ef4444; border-color: #dc2626; }
.cell.future { background: var(--bg); color: var(--muted); border-color: var(--border); box-shadow: none; }

.legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding-top: 4px;
}
.lg-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); font-weight: 600; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.ok { background: #22c55e; }
.dot.miss { background: #ef4444; }
.dot.future { background: var(--border); }
</style>