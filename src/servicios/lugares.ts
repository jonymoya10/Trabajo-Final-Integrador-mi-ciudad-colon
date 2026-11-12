// Servicio de lugares.
// Hoy responde con los datos de prueba (src/mocks) usando la misma forma
// que va a tener la API: { datos, meta } o { error }. Cuando esté la API,
// solo cambia este archivo (pedirApi en lugar del mock); las pantallas no.

import { lugaresMock } from "../mocks/lugares";
import { ErrorApi, Lugar, RespuestaApi } from "../tipos/modelos";

const RETARDO_SIMULADO = 400;

// Poner en true para probar la pantalla de error de red
export const SIMULAR_ERROR_RED = false;

export interface FiltroLugares {
  texto?: string;
  categoriaId?: string | null;
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Sin tildes ni mayúsculas, para buscar "museo" y encontrar "Museo"
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Simula la respuesta de GET /lugares
async function pedirLugaresMock(): Promise<RespuestaApi<Lugar[]> | ErrorApi> {
  await esperar(RETARDO_SIMULADO);

  if (SIMULAR_ERROR_RED) {
    return { error: { codigo: "SIN_CONEXION", mensaje: "No hay conexión a internet." } };
  }

  const activos = lugaresMock.filter((lugar) => lugar.activo);

  return {
    datos: activos,
    meta: { total: activos.length, pagina: 1, porPagina: activos.length },
  };
}

function esError<T>(respuesta: RespuestaApi<T> | ErrorApi): respuesta is ErrorApi {
  return "error" in respuesta;
}

export function filtrarLugares(lugares: Lugar[], filtro: FiltroLugares): Lugar[] {
  const termino = normalizarTexto(filtro.texto ?? "");

  return lugares.filter((lugar) => {
    const coincideCategoria = !filtro.categoriaId || lugar.categoriaId === filtro.categoriaId;

    const coincideTexto = termino.length === 0 || normalizarTexto(lugar.nombre).includes(termino);

    return lugar.activo && coincideCategoria && coincideTexto;
  });
}

export async function obtenerLugares(filtro: FiltroLugares = {}): Promise<Lugar[]> {
  const respuesta = await pedirLugaresMock();

  if (esError(respuesta)) {
    throw new Error(respuesta.error.mensaje);
  }

  return filtrarLugares(respuesta.datos, filtro);
}

export async function obtenerLugarPorId(id: string): Promise<Lugar> {
  const respuesta = await pedirLugaresMock();

  if (esError(respuesta)) {
    throw new Error(respuesta.error.mensaje);
  }

  const lugar = respuesta.datos.find((item) => item.id === id);

  if (!lugar) {
    throw new Error("No existe ese lugar.");
  }

  return lugar;
}
