// Servicio de categorías. Hoy responde con los datos de prueba (src/mocks).

import { categoriasMock } from "../mocks/categorias";
import { Categoria } from "../tipos/modelos";

export async function obtenerCategorias(): Promise<Categoria[]> {
  return [...categoriasMock].sort((a, b) => a.orden - b.orden);
}
