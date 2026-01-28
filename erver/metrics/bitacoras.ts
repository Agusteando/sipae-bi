import type { MetricDefinition, DatasetSchema } from "../dashboard/types";

const FEED =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQP4wuU0vxaN7ez_ka4U1Ep2OYkkGo2Mn_795N1p_nFjeM2J6tdt0h7kN59e0mPRMv5wz6nLNgN65Zp/pub?gid=0&single=true&output=csv";

const schema: DatasetSchema = {
  dims: [{ key: "day", label: "Día" }],
  measures: [{ key: "cumple", label: "Cumple", format: "bool" }]
};

function parseCSV(text: string): string[][] {
  // Minimal CSV parser (handles quotes and commas)
  const rows: string[][] = [];
  let cur = "";
  let inQuotes = false;
  const row: string[] = [];

  const pushCell = () => {
    row.push(cur);
    cur = "";
  };
  const pushRow = () => {
    rows.push([...row]);
    row.length = 0;
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      const next = text[i + 1];
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === ",") {
      pushCell();
      continue;
    }

    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      pushCell();
      pushRow();
      continue;
    }

    cur += ch;
  }

  // flush last
  if (cur.length || row.length) {
    pushCell();
    pushRow();
  }

  return rows.filter(r => r.some(c => String(c ?? "").trim() !== ""));
}

function pick(obj: Record<string, string>, key: string) {
  const k = Object.keys(obj).find(x => x.toLowerCase() === key.toLowerCase());
  return k ? obj[k] : "";
}

function toYMD(dateStr: string) {
  // Expecting something that Date can parse
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default <MetricDefinition>{
  id: "bitacoras",
  label: "Bitácoras",
  params: [
    { key: "plantel", type: "string", required: true },
    { key: "month", type: "number", required: true },
    { key: "year", type: "number", required: true }
  ],
  schema,
  async fetch({ params }) {
    const plantel = String(params.plantel);
    const month = Number(params.month);
    const year = Number(params.year);

    const res = await fetch(FEED);
    if (!res.ok) {
      throw new Error(`Bitácoras feed error: ${res.status} ${res.statusText}`);
    }

    const csv = await res.text();
    const table = parseCSV(csv);
    if (table.length < 2) {
      return { metricId: "bitacoras", label: "Bitácoras", params: { plantel, month, year }, schema, rows: [] };
    }

    const headers = table[0].map(h => String(h ?? "").trim());
    const body = table.slice(1);

    const rowsObj = body.map(r => {
      const obj: Record<string, string> = {};
      for (let i = 0; i < headers.length; i++) obj[headers[i]] = String(r[i] ?? "");
      return obj;
    });

    const presentDays = new Set<string>();

    for (const r of rowsObj) {
      const rPlantel = pick(r, "plantel");
      const rFecha = pick(r, "fecha");
      if (!rPlantel || !rFecha) continue;
      if (String(rPlantel).trim() !== plantel) continue;

      const ymd = toYMD(rFecha);
      if (!ymd) continue;

      const d = new Date(ymd + "T00:00:00");
      if (d.getFullYear() !== year) continue;
      if (d.getMonth() + 1 !== month) continue;

      presentDays.add(ymd);
    }

    const out = Array.from(presentDays)
      .sort()
      .map(day => ({ day, cumple: true }));

    return {
      metricId: "bitacoras",
      label: "Bitácoras",
      params: { plantel, month, year },
      schema,
      rows: out,
      meta: { generatedAt: new Date().toISOString(), source: "csv" }
    };
  }
};