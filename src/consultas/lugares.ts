// Consultas de lugares y categorías con TanStack Query (useQuery).
// La queryKey es la identidad del dato: todo lo que cambia el resultado va adentro.

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { obtenerCategorias } from "../servicios/categorias";
import { obtenerLugarPorId, obtenerLugares } from "../servicios/lugares";
import { Lugar } from "../tipos/modelos";

export const claves = {
  lugares: ["lugares"] as const,
  lugar: (id: string) => ["lugares", id] as const,
  categorias: ["categorias"] as const,
};

// Lista completa de lugares activos (se filtra en memoria en la pantalla)
export function useLugares() {
  return useQuery({
    queryKey: claves.lugares,
    queryFn: () => obtenerLugares(),
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: claves.categorias,
    queryFn: obtenerCategorias,
    staleTime: 60 * 60 * 1000, // las categorías casi no cambian
  });
}

// Detalle: si el lugar ya vino en la lista, se muestra al instante con esos datos
// y se pide igual a la API para tener la versión más nueva.
export function useLugar(id: string) {
  const cliente = useQueryClient();

  return useQuery({
    queryKey: claves.lugar(id),
    queryFn: () => obtenerLugarPorId(id),
    enabled: id.length > 0,
    placeholderData: () =>
      cliente.getQueryData<Lugar[]>(claves.lugares)?.find((lugar) => lugar.id === id),
  });
}
