// Servicio de categorías. Con la API pide GET /categorias (ya vienen por "orden").
// Sin API, responde con los datos de prueba (src/mocks).

import { categoriasMock } from "../mocks/categorias";
import { Categoria } from "../tipos/modelos";
import { HAY_API, pedirLista } from "./api";

export async function obtenerCategorias(): Promise<Categoria[]> {
  const categorias = HAY_API
    ? (await pedirLista<Categoria>("/categorias")).datos
    : categoriasMock;

  return [...categorias].sort((a, b) => a.orden - b.orden);
}
