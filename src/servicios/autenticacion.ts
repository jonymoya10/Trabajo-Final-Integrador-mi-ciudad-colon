// Inicio de sesión y registro.
// Se conectan a la API cuando esté configurada en ./api.ts.
// Ajustar las rutas y la forma de la respuesta a la API nueva.

import { Usuario } from "../tipos/modelos";
import { pedirApi } from "./api";

interface ResultadoLogin {
  usuario: Usuario;
  token: string;
}

interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
}

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function iniciarSesion(
  email: string,
  password: string,
): Promise<ResultadoLogin> {
  return pedirApi<ResultadoLogin>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: normalizarEmail(email), password }),
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

  if (datos.password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  return pedirApi<ResultadoLogin>("/auth/registro", {
    method: "POST",
    body: JSON.stringify({ nombre, email, password: datos.password }),
  });
}

export async function obtenerUsuarioPorId(id: string): Promise<Usuario | null> {
  try {
    return await pedirApi<Usuario>(`/usuarios/${id}`);
  } catch {
    return null;
  }
}
