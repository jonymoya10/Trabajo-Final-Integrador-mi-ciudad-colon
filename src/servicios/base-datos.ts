import * as SQLite from "expo-sqlite";

let baseDatos: SQLite.SQLiteDatabase | null = null;

export async function obtenerBaseDatos(): Promise<SQLite.SQLiteDatabase> {
  if (baseDatos) {
    return baseDatos;
  }

  baseDatos = await SQLite.openDatabaseAsync("app.db");

  return baseDatos;
}

// Crea las tablas locales. Agregar acá las que necesite la app nueva.
export async function inicializarBaseDatos(): Promise<void> {
  const db = await obtenerBaseDatos();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS preferencias (
      clave TEXT PRIMARY KEY NOT NULL,
      valor TEXT NOT NULL
    );
  `);
}
