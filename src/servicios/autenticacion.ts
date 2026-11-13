// Ingreso, registro y datos del usuario, contra la API de Mi Ciudad.
// POST /auth/ingreso y POST /auth/registro devuelven { datos: { token, usuario } }.
// GET /yo devuelve el usuario de la sesión (el token lo agrega el cliente de ./api.ts).

import { Usuario } from "../tipos/modelos";
import { ErrorDeApi, HAY_API, pedirUno } from "./api";

interface ResultadoLogin {
  usuario: Usuario;
  token: string;
}

interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
}

// La API pide al menos 8 caracteres
export const LARGO_MINIMO_CONTRASENA = 8;

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

function exigirApi(): void {
  if (!HAY_API) {
    throw new ErrorDeApi(
      "SIN_API",
      "Todavía no hay una API configurada (EXPO_PUBLIC_API_URL).",
    );
  }
}

export async function iniciarSesion(
  email: string,
  password: string,
): Promise<ResultadoLogin> {
  exigirApi();

  return pedirUno<ResultadoLogin>("/auth/ingreso", {
    method: "POST",
    data: { email: normalizarEmail(email), contrasena: password },
  });
}

export async function registrarUsuario(
  datos: DatosRegistro,
): Promise<ResultadoLogin> {
  const nombre = datos.nombre.trim();
  const email = normalizarEmail(datos.email);

  if (!nombre || !email || !datos.password.trim()) {
    throw new Error("Debe completar todos los campos.");
  }

  if (datos.password.length < LARGO_MINIMO_CONTRASENA) {
    throw new Error(
      `La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`,
    );
  }

  exigirApi();

  return pedirUno<ResultadoLogin>("/auth/registro", {
    method: "POST",
    data: { nombre, email, contrasena: datos.password },
  });
}

// La API no tiene /usuarios/:id: el usuario de la sesión se pide a GET /yo.
// Se compara el id con el guardado para no mostrar datos de otra cuenta.
export async function obtenerUsuarioPorId(id: string): Promise<Usuario | null> {
  if (!HAY_API) {
    return null;
  }

  try {
    const usuario = await pedirUno<Usuario>("/yo");

    return usuario.id === id ? usuario : null;
  } catch {
    return null;
  }
}
