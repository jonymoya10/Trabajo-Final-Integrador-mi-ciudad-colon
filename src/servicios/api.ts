// Cliente de la API.
// Todas las pantallas leen los datos a través de los servicios de src/servicios,
// y los servicios usan esta función para hablar con la API.
// Para conectar la API de la cátedra: poner EXPO_PUBLIC_API_URL en el archivo .env
// (por ejemplo EXPO_PUBLIC_API_URL=https://api.colon.tur.ar) y pasar los servicios
// de src/servicios del mock a pedirApi. Las pantallas no cambian.

import { obtenerTokenSesion } from "./sesion";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

export async function pedirApi<T>(
  ruta: string,
  opciones: RequestInit = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("Todavía no hay una API configurada.");
  }

  const token = await obtenerTokenSesion();

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  });

  const cuerpo = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(
      cuerpo?.error?.mensaje ?? `La API respondió con error ${respuesta.status}.`,
    );
  }

  return cuerpo as T;
}
