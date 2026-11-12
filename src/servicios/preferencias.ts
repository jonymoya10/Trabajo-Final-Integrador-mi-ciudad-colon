// Preferencias guardadas en el teléfono (clave → valor).

import Storage from "expo-sqlite/kv-store";

export async function guardarPreferencia<T>(clave: string, valor: T): Promise<void> {
  await Storage.setItem(clave, JSON.stringify(valor));
}

export async function obtenerPreferencia<T>(clave: string, porDefecto: T): Promise<T> {
  const valor = await Storage.getItem(clave);

  if (valor === null) {
    return porDefecto;
  }

  return JSON.parse(valor) as T;
}

export async function borrarPreferencia(clave: string): Promise<void> {
  await Storage.removeItem(clave);
}
