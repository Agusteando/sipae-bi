export function monthLabelEs(year: number, month1to12: number) {
  const dt = new Date(year, month1to12 - 1, 1);
  return new Intl.DateTimeFormat("es-MX", { month: "long" }).format(dt);
}

export function clampMonth(m: number) {
  if (!Number.isFinite(m)) return 1;
  return Math.min(12, Math.max(1, Math.trunc(m)));
}