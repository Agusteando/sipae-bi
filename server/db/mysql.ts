import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function getMysqlPool() {
  if (pool) return pool;

  const config = useRuntimeConfig();
  if (!config.dbHost || !config.dbUser || !config.dbName) {
    throw new Error("Missing DB_* env vars. Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME.");
  }

  pool = mysql.createPool({
    host: String(config.dbHost),
    user: String(config.dbUser),
    password: String(config.dbPassword ?? ""),
    database: String(config.dbName),
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false,
  });

  return pool;
}