export type Plantel = {
  code: string;
  id: number; // used by detalle.dir_id for entregas & lista detalle
  label: string;
  campus?: string;
  nivel?: string;
  asistencia?: string; // used by attendance
  coords?: string[];
  gral?: boolean;
};

export const PLANTELES: Plantel[] = [
  { code: "PM", id: 8, label: "Primaria Metepec", campus: "Metepec", nivel: "Primaria", asistencia: "PM", coords: ["CLAUDIA MARINA","ANA LAURA","GUILLERMO","JORGE MICHAEL","TANIA IRAIS"] },
  { code: "PT", id: 9, label: "Primaria Toluca", campus: "Toluca", nivel: "Primaria", asistencia: "PT", coords: ["CARLOS IVAN","Verónica Elsa","IEDIS TOLUCA"] },
  { code: "SM", id: 10, label: "Secundaria Metepec", campus: "Metepec", nivel: "Secundaria", asistencia: "SM", coords: ["Iván Sebastián","JAZMIN DEL CARMEN","CRISTHIAN ALFONSO","Alejandra"] },
  { code: "ST", id: 11, label: "Secundaria Toluca", campus: "Toluca", nivel: "Secundaria", asistencia: "ST", coords: ["LEONARDO JUAN","CASANDRA ODETTE","MARCO IVAN"] },
  { code: "CT", id: 5, label: "Guardería IMSS Toluca", campus: "Toluca", asistencia: "CT" },
  { code: "CM", id: 1, label: "Guardería IMSS Metepec", campus: "Metepec", asistencia: "CM" },
  { code: "DM", id: 12, label: "Guardería IEDIS Metepec", campus: "Metepec", asistencia: "DM" },
  { code: "PREES TOL", id: 7, label: "Preescolar Toluca", campus: "Toluca", nivel: "Preescolar", asistencia: "PREES TOL", coords: ["LAURA ISABEL","ERIKA","BRENDA ADRIANA","Gabriela Monserrath"] },
  { code: "ISSSTE TOL", id: 6, label: "Guardería ISSSTE Toluca", campus: "Toluca", nivel: "Preescolar", asistencia: "ISSSTE TOLUCA", coords: ["MARIBEL"] },
  { code: "PREES MET", id: 3, label: "Preescolar Metepec", campus: "Metepec", nivel: "Preescolar", asistencia: "PREES MET", coords: ["MARCELA MADAI","JUDITH VIRIDIANA","ADRIANA JOSEFINA"] },
  { code: "ISSSTE MET", id: 2, label: "Preescolar ISSSTE Metepec", campus: "Metepec", nivel: "Preescolar", asistencia: "ISSSTE METEPEC" },

  { code: "dh", id: 13, label: "Desarrollo Humano", campus: "Metepec", gral: true },
  { code: "artes", id: 23, label: "Artes", campus: "Metepec", gral: true },
  { code: "deportes", id: 15, label: "Deportes", campus: "Metepec", gral: true },
  { code: "mkt", id: 14, label: "Mercadotecnia", campus: "Metepec", gral: true }
];

export function getPlantelByCode(code: string) {
  return PLANTELES.find(p => p.code === code) || null;
}

export function getPlantelById(id: number) {
  return PLANTELES.find(p => p.id === id) || null;
}

/**
 * Matches your legacy remap:
 * if asistencia is PREES MET => plantel for attendance is CM
 * if asistencia is PREES TOL => plantel for attendance is CT
 */
export function mapAttendancePlantel(codeOrAsistencia: string): string {
  if (codeOrAsistencia === "PREES MET") return "CM";
  if (codeOrAsistencia === "PREES TOL") return "CT";
  return codeOrAsistencia;
}
