// Cliente de la API de Mi Ciudad, con Axios.
// Todas las pantallas leen los datos a través de los servicios de src/servicios,
// y los servicios usan este cliente para hablar con la API.
//
// La dirección sale de EXPO_PUBLIC_API_URL (archivo .env.local, ver .env.example).
// Si está vacía, los servicios responden con los datos de prueba de src/mocks.

import { AxiosError, AxiosRequestConfig, create } from "axios";

import { RespuestaApi } from "../tipos/modelos";
import { cerrarSesion, obtenerTokenSesion } from "./sesion";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export const HAY_API = API_URL.length > 0;

// Error con el código y el mensaje que manda la API ({ error: { codigo, mensaje } }).
// El mensaje se puede mostrar tal cual en la pantalla.
export class ErrorDeApi extends Error {
  constructor(
    public readonly codigo: string,
    mensaje: string,
    public readonly estado: number | null = null,
  ) {
    super(mensaje);
    this.name = "ErrorDeApi";
  }
}

// Cliente único: la dirección base y el tiempo máximo de espera se ponen una sola vez.
// El plan gratis de Render tarda cerca de un minuto en despertar, por eso el tiempo es largo.
export const clienteApi = create({
  baseURL: API_URL,
  timeout: 60_000,
  headers: { "Content-Type": "application/json" },
});

// Forma del cuerpo de un error de la API
export type CuerpoError = { error?: { codigo?: string; mensaje?: string } };

// Interceptor de pedido: adjunta el token de la sesión (guardado en expo-secure-store).
// Si no se puede leer (por ejemplo en la web, donde no hay secure-store), el pedido sale sin token:
// mirar lugares y la agenda no necesita cuenta.
clienteApi.interceptors.request.use(async (config) => {
  const token = await obtenerTokenSesion().catch(() => null);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de respuesta: convierte cualquier falla en un ErrorDeApi con un mensaje claro.
// Un 401 NO_AUTENTICADO significa que el token venció: se cierra la sesión acá, en un solo lugar.
clienteApi.interceptors.response.use(
  (respuesta) => respuesta,
  async (error: AxiosError) => {
    throw await convertirError(error);
  },
);

export async function convertirError(error: AxiosError): Promise<ErrorDeApi> {
  // 1) El servidor contestó, pero con error (404, 422, 500…)
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data as CuerpoError | undefined;
    const codigo = data?.error?.codigo ?? "ERROR_HTTP";
    const mensaje = data?.error?.mensaje ?? `La API respondió con error ${status}.`;

    if (status === 401 && codigo === "NO_AUTENTICADO") {
      await cerrarSesion();
    }

    return new ErrorDeApi(codigo, mensaje, status);
  }

  // 2) Se mandó el pedido y no hubo respuesta: sin señal, servidor apagado o tardó demasiado
  if (error.request) {
    if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
      return new ErrorDeApi("SIN_RESPUESTA", "El servidor tardó demasiado en responder.");
    }

    return new ErrorDeApi("SIN_CONEXION", "No hay conexión con el servidor.");
  }

  // 3) Ni siquiera se mandó: error de configuración
  return new ErrorDeApi("ERROR_CONFIGURACION", error.message);
}

// GET que devuelve el "sobre" completo de la API: { datos, meta }
export async function pedirLista<T>(
  ruta: string,
  config?: AxiosRequestConfig,
): Promise<RespuestaApi<T[]>> {
  const respuesta = await clienteApi.get<RespuestaApi<T[]>>(ruta, config);

  return respuesta.data;
}

// Pedido que devuelve un solo recurso: { datos: {...}, meta: null } → datos
export async function pedirUno<T>(
  ruta: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const respuesta = await clienteApi.request<{ datos: T }>({ url: ruta, ...config });

  return respuesta.data.datos;
}
