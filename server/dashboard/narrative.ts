import type { Dataset } from "./types";

export function describeEntregas(ds: Dataset) {
  const r = ds.rows?.[0] as any;
  if (!r) return "Sin datos.";

  const asignadas = Number(r.asignadas ?? 0);
  const entregadas = Number(r.entregadas ?? 0);
  const noentregadas = Number(r.noentregadas ?? 0);
  const destiempo = Number(r.destiempo ?? 0);
  const pendientes = Number(r.pendientes ?? 0);

  const rate = asignadas > 0 ? (entregadas / asignadas) * 100 : 0;

  return [
    `Entregadas: ${entregadas}/${asignadas} (${rate.toFixed(1)}%).`,
    `Destiempo: ${destiempo}.`,
    `No entregó: ${noentregadas}.`,
    `Pendientes: ${pendientes}.`
  ].join(" ");
}