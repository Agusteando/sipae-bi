import type { MetricDefinition, DatasetSchema } from "../dashboard/types";

const schema: DatasetSchema = {
  dims: [{ key: "revisa", label: "Revisa" }],
  measures: [
    { key: "conteo", label: "Revisadas", format: "int" },
    { key: "total", label: "Subidas", format: "int" },
    { key: "porcen", label: "%", format: "pct" }
  ]
};

function computeSchoolTerm(mes: number, year: number) {
  // Aug-Dec -> year-year+1 ; Jan-Jul -> (year-1)-year
  const startYear = mes >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

function splitPlantelLabel(label: string) {
  const words = String(label || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const nivel = words[0] ?? "Unknown";
  const campus = words[1] ?? "Unknown";
  return { nivel, campus };
}

async function detectWeekStartColumn(mysql: any): Promise<string> {
  // Robust: supports schemas that use weekStart / week_start / weekstart
  const candidates = ["weekStart", "week_start", "weekstart"];
  const [rows] = await mysql.query<any[]>(
    `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'planeaciones'
      AND COLUMN_NAME IN (${candidates.map(() => "?").join(",")})
    LIMIT 10
  `,
    candidates
  );

  const present = new Set((rows ?? []).map((r: any) => String(r.COLUMN_NAME)));
  for (const c of candidates) {
    if (present.has(c)) return c;
  }
  throw new Error(
    `planeaciones metric: could not find weekStart column in table planeaciones. Tried: ${candidates.join(", ")}`
  );
}

export default <MetricDefinition>{
  id: "planeaciones",
  label: "Planeaciones Revisadas",
  params: [
    { key: "plantel", type: "string", required: true }, // e.g. "Primaria Metepec"
    { key: "mes", type: "number", required: true },
    { key: "year", type: "number", required: true }
  ],
  schema,
  async fetch({ params, mysql }) {
    const plantel = String(params.plantel);
    const mes = Number(params.mes);
    const year = Number(params.year);

    const { nivel, campus } = splitPlantelLabel(plantel);
    const schoolTerm = computeSchoolTerm(mes, year);

    // legacy behavior: exclude future days of month
    const weekCol = await detectWeekStartColumn(mysql); // e.g. "weekStart"
    const A_WEEK = `A.\`${weekCol}\``;
    const R_WEEK = `R.\`${weekCol}\``;
    const WEEK = `\`${weekCol}\``;

    const curdateFilterA = `AND DATE(${A_WEEK}) < CURDATE()`;
    const curdateFilterR = `AND DATE(${R_WEEK}) < CURDATE()`;
    const curdateFilterNoAlias = `AND DATE(${WEEK}) < CURDATE()`;

    const sql = `
SELECT *
FROM (
    SELECT
        IF(O.username = 'coord.ingles.pm@casitaiedis.edu.mx', 'Ana Laura', O.username) AS revisa,
        Q.total3 AS test,
        O.plantel,
        O.plantelid,
        O.plantelid2,
        M.conteo AS conteo,
        IFNULL(Q.total3, IFNULL(P.total2, N.total)) AS total,
        P.total2,
        (SUM(M.conteo) * 100 / IFNULL(Q.total3, IFNULL(P.total2, N.total))) AS porcen
    FROM (
        SELECT
            username,
            CONCAT(nivel, ' ', campus, ' ', area) AS plantel,
            CONCAT(nivel, ' ', campus) AS plantelid,
            CONCAT(nivel, ' ', campus2) AS plantelid2,
            CONCAT(IFNULL(area, ''), IFNULL(area2, ''), IFNULL(area3, ''), IFNULL(area4, '')) AS multiarea,
            campus,
            LOWER(area) AS area,
            LOWER(nivel) AS nivel
        FROM usuarios
        WHERE coordinador = '1' AND NOT gral = '1'
    ) O
    LEFT JOIN (
        SELECT
            H.username AS revisa,
            X.plantel,
            X.area,
            X.nivel,
            X.campus,
            (IFNULL(X.conten, 0) + IFNULL(Z.conten, 0) + IFNULL(Y.conten, 0)) AS conteo
        FROM (
            SELECT username, area FROM usuarios WHERE coordinador = '1'
        ) H
        LEFT JOIN (
            SELECT
                A.revisa,
                COUNT(DISTINCT A.parentid) AS conten,
                CONCAT(A.nivel, ' ', A.campus, ' ', A.area) AS plantel,
                A.nivel,
                A.campus,
                A.area
            FROM planeaciones A
            LEFT JOIN usuarios B ON A.revisa = B.username
            WHERE MONTH(${A_WEEK}) = ? ${curdateFilterA}
              AND A.ciclo = ?
              AND A.revisa IS NOT NULL
            GROUP BY A.revisa, A.nivel, A.campus
        ) X ON H.username = X.revisa
        LEFT JOIN (
            SELECT
                A.revisa2 AS revisa,
                COUNT(DISTINCT A.parentid) AS conten
            FROM planeaciones A
            LEFT JOIN usuarios B ON A.revisa2 = B.username
            WHERE B.username IS NOT NULL
              AND MONTH(${A_WEEK}) = ? ${curdateFilterA}
              AND A.ciclo = ?
            GROUP BY A.revisa2
        ) Y ON H.username = Y.revisa
        LEFT JOIN (
            SELECT
                A.revisa3 AS revisa,
                A.nivel,
                A.area,
                COUNT(DISTINCT A.parentid) AS conten
            FROM planeaciones A
            LEFT JOIN usuarios B ON A.revisa3 = B.username
            WHERE B.username IS NOT NULL
              AND MONTH(${A_WEEK}) = ? ${curdateFilterA}
              AND A.ciclo = ?
            GROUP BY A.revisa3
        ) Z ON H.username = Z.revisa
        WHERE plantel IS NOT NULL
        GROUP BY plantel, revisa, nivel, area
    ) M
      ON O.username = M.revisa
     AND LOWER(TRIM(M.nivel))  = LOWER(TRIM(?))
     AND LOWER(TRIM(M.campus)) = LOWER(TRIM(?))
    LEFT JOIN (
        SELECT
            T.boss AS boss,
            R.nivel,
            R.campus,
            COUNT(DISTINCT R.parentid) AS total
        FROM planeaciones R
        LEFT JOIN usuarios T ON R.docente = T.username
        WHERE MONTH(${R_WEEK}) = ? ${curdateFilterR}
          AND R.ciclo = ?
        GROUP BY T.boss, R.campus, R.nivel
    ) N
      ON O.username = N.boss
     AND LOWER(TRIM(?)) = LOWER(TRIM(N.nivel))
     AND LOWER(TRIM(?)) = LOWER(TRIM(N.campus))
    LEFT JOIN (
        SELECT
            area,
            COUNT(DISTINCT parentid) AS total2
        FROM planeaciones
        WHERE area IN ('deportes', 'artes', 'habilidades socioemocionales')
          AND MONTH(${WEEK}) = ? ${curdateFilterNoAlias}
          AND ciclo = ?
        GROUP BY area, campus, nivel
    ) P
      ON O.multiarea LIKE CONCAT('%', P.area, '%')
     AND LOWER(TRIM(?)) = LOWER(TRIM(N.nivel))
     AND LOWER(TRIM(?)) = LOWER(TRIM(N.campus))
    LEFT JOIN (
        SELECT
            nivel,
            campus,
            area,
            COUNT(DISTINCT parentid) AS total3
        FROM planeaciones
        WHERE LOWER(nivel) = 'preescolar'
          AND area LIKE '%ing%'
          AND MONTH(${WEEK}) = ? ${curdateFilterNoAlias}
          AND ciclo = ?
          AND campus = ?
        GROUP BY nivel, campus, area
    ) Q
      ON O.nivel = Q.nivel
     AND Q.area LIKE CONCAT('%', O.area, '%')
     AND O.campus = Q.campus
    WHERE M.conteo > 0
    GROUP BY O.username
) A
WHERE LOWER(TRIM(A.plantelid))  = LOWER(TRIM(?))
   OR LOWER(TRIM(A.plantelid2)) = LOWER(TRIM(?))
GROUP BY A.revisa
`;

    const bind = [
      mes, schoolTerm, // X
      mes, schoolTerm, // Y
      mes, schoolTerm, // Z
      nivel, campus,   // M join
      mes, schoolTerm, // N
      nivel, campus,   // N join
      mes, schoolTerm, // P
      nivel, campus,   // P join
      mes, schoolTerm, campus, // Q
      plantel, plantel // outer
    ];

    const [rows] = await mysql.query<any[]>(sql, bind);

    return {
      metricId: "planeaciones",
      label: "Planeaciones Revisadas",
      params: { plantel, mes, year, schoolTerm, weekCol },
      schema,
      rows,
      meta: { generatedAt: new Date().toISOString(), source: "mysql" }
    };
  }
};