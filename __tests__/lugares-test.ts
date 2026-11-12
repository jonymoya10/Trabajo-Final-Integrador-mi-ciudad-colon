import { lugaresMock } from "../src/mocks/lugares";
import { filtrarLugares, obtenerLugarPorId, obtenerLugares } from "../src/servicios/lugares";
import { formatearDuracion, formatearPrecio } from "../src/utils/formato";

describe("servicio de lugares", () => {
  it("no devuelve los lugares dados de baja", async () => {
    const lugares = await obtenerLugares();

    expect(lugares.length).toBeGreaterThan(0);
    expect(lugares.every((lugar) => lugar.activo)).toBe(true);
  });

  it("busca por nombre sin importar tildes ni mayúsculas", () => {
    const encontrados = filtrarLugares(lugaresMock, { texto: "colon" });

    expect(encontrados.map((lugar) => lugar.id)).toEqual(["lug-001"]);
  });

  it("filtra por categoría", () => {
    const museos = filtrarLugares(lugaresMock, { categoriaId: "cat-museos" });

    expect(museos.every((lugar) => lugar.categoriaId === "cat-museos")).toBe(true);
    expect(museos.length).toBe(2);
  });

  it("devuelve una lista vacía para una categoría sin lugares", () => {
    expect(filtrarLugares(lugaresMock, { categoriaId: "cat-alojamiento" })).toEqual([]);
  });

  it("trae un lugar por id y avisa si no existe", async () => {
    const molino = await obtenerLugarPorId("lug-004");

    expect(molino.nombre).toBe("Molino Forclaz");
    await expect(obtenerLugarPorId("lug-999")).rejects.toThrow("No existe ese lugar.");
  });
});

describe("formatos", () => {
  it("muestra el precio de entrada", () => {
    expect(formatearPrecio(0)).toBe("Gratis");
    expect(formatearPrecio(null)).toBe("No aplica");
    expect(formatearPrecio(1500)).toMatch(/^\$ 1.?500$/);
  });

  it("muestra la duración de la audioguía", () => {
    expect(formatearDuracion(252)).toBe("4:12");
    expect(formatearDuracion(65)).toBe("1:05");
  });
});
