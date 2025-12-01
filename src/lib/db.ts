import initSqlJs, { type Database, type Statement } from "sql.js";

let SQL: any = null;

// Initializes the sql.js WASM module
export async function initDb(): Promise<void> {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });
  }
}

// Loads the database from a buffer
export function loadDb(buffer: ArrayBuffer | Uint8Array): Database {
  if (!SQL) {
    throw new Error("SQL.js has not been initialized. Call initDb() first.");
  }
  return new SQL.Database(buffer);
}

// Executes a query and returns the results as an array of objects
// Modified to accept optional parameters
export function queryData(db: Database, query: string, params: any[] = []): any[] {
  const results = [];
  let stmt: Statement | null = null;

  try {
    stmt = db.prepare(query);
    if (params.length > 0) {
      stmt.bind(params);
    }
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
  } finally {
    if (stmt) {
      stmt.free();
    }
  }
  return results;
}