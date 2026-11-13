// Servicio de lugares: la única puerta a los datos de los lugares.
// Con EXPO_PUBLIC_API_URL configurada pide a la API (GET /lugares y GET /lugares/:id).
// Sin API, responde con los datos de prueba (src/mocks) con la misma forma: { datos, meta } o { error }.
// Las pantallas no saben de dónde vienen los datos.

import { lugaresMock } from "../mocks/lugares";
import { ErrorApi, Lugar, RespuestaApi } from "../tipos/modelos";
import { ErrorDeApi, HAY_API, pedirLista, pedirUno } from "./api";

const RETARDO_SIMULADO = 400;

// Poner en true para probar la pantalla de error.
// Con la API, manda la cabecera X-Simular: error-500 y la API responde un error 500.
export const SIMULAR_ERROR_RED = false;

const CABECERAS_PRUEBA = SIMULAR_ERROR_RED ? { "X-Simular": "error-500" } : undefined;

// La API devuelve hasta 100 por página; el catálogo de Colón entra en una sola.
const POR_PAGINA = 100;

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
    return { error: { codigo: "SIN_CONEXION", mensaje: "No hay conexión con el servidor." } };
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

// Todos los lugares activos. Se piden una vez y se filtran en memoria (filtrarLugares).
export async function obtenerLugares(filtro: FiltroLugares = {}): Promise<Lugar[]> {
  if (HAY_API) {
    const respuesta = await pedirLista<Lugar>("/lugares", {
      params: { porPagina: POR_PAGINA },
      headers: CABECERAS_PRUEBA,
    });

    return filtrarLugares(respuesta.datos, filtro);
  }

  const respuesta = await pedirLugaresMock();

  if (esError(respuesta)) {
    throw new ErrorDeApi(respuesta.error.codigo, respuesta.error.mensaje);
  }

  return filtrarLugares(respuesta.datos, filtro);
}

// Detalle de un lugar. Un lugar dado de baja se trata como inexistente.
export async function obtenerLugarPorId(id: string): Promise<Lugar> {
  let lugar: Lugar | undefined;

  if (HAY_API) {
    lugar = await pedirUno<Lugar>(`/lugares/${encodeURIComponent(id)}`, {
      headers: CABECERAS_PRUEBA,
    });
  } else {
    const respuesta = await pedirLugaresMock();

    if (esError(respuesta)) {
      throw new ErrorDeApi(respuesta.error.codigo, respuesta.error.mensaje);
    }

    lugar = respuesta.datos.find((item) => item.id === id);
  }

  if (!lugar || !lugar.activo) {
    throw new ErrorDeApi("LUGAR_NO_ENCONTRADO", "No existe ese lugar.", 404);
  }

  return lugar;
}
