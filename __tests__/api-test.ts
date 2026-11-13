import { AxiosError, AxiosHeaders } from "axios";

import { debeReintentar } from "../src/consultas/cliente";
import { CuerpoError, ErrorDeApi, convertirError } from "../src/servicios/api";
import { cerrarSesion } from "../src/servicios/sesion";

jest.mock("../src/servicios/sesion", () => ({
  obtenerTokenSesion: jest.fn(async () => null),
  cerrarSesion: jest.fn(async () => undefined),
}));

function errorConRespuesta(status: number, data: CuerpoError): AxiosError {
  const config = { headers: new AxiosHeaders() };

  return new AxiosError<CuerpoError>("falló", "ERR_BAD_RESPONSE", config, {}, {
    status,
    statusText: "",
    headers: {},
    config,
    data,
  });
}

describe("errores de la API", () => {
  beforeEach(() => jest.clearAllMocks());

  it("usa el código y el mensaje que manda la API", async () => {
    const error = await convertirError(
      errorConRespuesta(404, {
        error: { codigo: "LUGAR_NO_ENCONTRADO", mensaje: "No existe ese lugar." },
      }),
    );

    expect(error).toBeInstanceOf(ErrorDeApi);
    expect(error.codigo).toBe("LUGAR_NO_ENCONTRADO");
    expect(error.message).toBe("No existe ese lugar.");
    expect(error.estado).toBe(404);
  });

  it("cierra la sesión si el token venció (401 NO_AUTENTICADO)", async () => {
    await convertirError(
      errorConRespuesta(401, {
        error: { codigo: "NO_AUTENTICADO", mensaje: "Tenés que ingresar con tu cuenta." },
      }),
    );

    expect(cerrarSesion).toHaveBeenCalledTimes(1);
  });

  it("no cierra la sesión por una contraseña mal escrita", async () => {
    await convertirError(
      errorConRespuesta(401, {
        error: { codigo: "CREDENCIALES_INVALIDAS", mensaje: "El email o la contraseña no son correctos." },
      }),
    );

    expect(cerrarSesion).not.toHaveBeenCalled();
  });

  it("sin respuesta del servidor avisa que no hay conexión", async () => {
    const sinRed = new AxiosError("Network Error", "ERR_NETWORK", { headers: new AxiosHeaders() }, {});
    const error = await convertirError(sinRed);

    expect(error.codigo).toBe("SIN_CONEXION");
    expect(error.message).toBe("No hay conexión con el servidor.");
  });

  it("si el servidor tarda demasiado lo dice", async () => {
    const lento = new AxiosError("timeout", AxiosError.ECONNABORTED, { headers: new AxiosHeaders() }, {});

    expect((await convertirError(lento)).codigo).toBe("SIN_RESPUESTA");
  });
});

describe("reintentos de TanStack Query", () => {
  it("no reintenta un 404", () => {
    expect(debeReintentar(0, new ErrorDeApi("LUGAR_NO_ENCONTRADO", "No existe ese lugar.", 404))).toBe(false);
  });

  it("reintenta dos veces sin conexión o con un 500", () => {
    const sinRed = new ErrorDeApi("SIN_CONEXION", "No hay conexión con el servidor.");

    expect(debeReintentar(0, sinRed)).toBe(true);
    expect(debeReintentar(1, new ErrorDeApi("ERROR_INTERNO", "Algo salió mal.", 500))).toBe(true);
    expect(debeReintentar(2, sinRed)).toBe(false);
  });
});
