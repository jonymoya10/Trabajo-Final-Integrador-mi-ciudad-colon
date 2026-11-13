# Mi Ciudad — Guía turística de Colón

Aplicación móvil desarrollada como **Trabajo Integrador Final** de la asignatura **Desarrollo para Móviles — 2026**, Universidad Nacional de Entre Ríos (UNER).

Aplicación para el turista que visita Colón (Entre Ríos): lugares, mapa, agenda de eventos, recorrido y audioguías. Pedido de la Dirección de Turismo de la Municipalidad de Colón.

---

## Integrantes

| Integrante |
|---|
| Jonathan Exequiel Moyano |

---

## Entorno de desarrollo

- **Expo SDK 54**
- **React Native 0.81**
- **React 19**
- **TypeScript**
- **Expo Router**
- **Android Studio / Android Emulator**
- **Node.js + npm**

> El proyecto debe mantenerse en **Expo SDK 54** para conservar compatibilidad entre los integrantes del grupo.

---

## Qué está hecho

**Integrante 1: navegación base, interfaz y catálogo de lugares**

- **Pestañas** con Expo Router e íconos de `@react-native-vector-icons/ionicons`: **Mapa**, **Agenda**, **Mi recorrido** y **Yo**.
- **Catálogo de lugares** (`app/(tabs)/index.tsx`):
  - lista con `FlatList`;
  - búsqueda por nombre, sin importar tildes ni mayúsculas;
  - carrusel de categorías;
  - tarjeta `LugarCard`;
  - estados de carga, error con "Reintentar" y lista vacía.
- **Detalle de un lugar** (`app/lugar/[id].tsx`, ruta dinámica):
  - galería de fotos;
  - "Abierto ahora";
  - descripción larga;
  - dirección, precio de entrada, accesibilidad para silla de ruedas, teléfono y sitio web;
  - horarios de cada día de la semana;
  - botones de audioguía y de registrar visita.
- **Pensado para el sol y para gente grande:** letra grande, contraste fuerte y botones de al menos 48 px. No hay alturas fijas en los textos, así respeta la letra agrandada del teléfono.
- **Agenda** y **Mi recorrido** tienen una pantalla provisoria: son de los otros integrantes.

## Datos: la API de la cátedra

La app usa la **API de Mi Ciudad** de la cátedra (`api-proyectos-mobile/api-mi-ciudad`, NestJS). Lugares, categorías, ingreso, registro y "Yo" ya salen de ahí.

| Archivo | Qué hace |
|---|---|
| `src/tipos/modelos.ts` | Los tipos del documento, tal cual (Lugar, Categoria, Evento, Usuario, Favorito, Visita, respuesta de la API). Son los mismos que devuelve la API |
| `src/servicios/api.ts` | Cliente **Axios** único (`create` con `EXPO_PUBLIC_API_URL` y 60 s de espera). Interceptor de pedido: agrega `Authorization: Bearer <token>` desde `expo-secure-store`. Interceptor de respuesta: todo error pasa a `ErrorDeApi` con el `codigo` y el `mensaje` de la API (se muestra tal cual); sin respuesta → "No hay conexión con el servidor."; 401 `NO_AUTENTICADO` → cierra la sesión |
| `src/servicios/lugares.ts` | `GET /lugares?porPagina=100` y `GET /lugares/:id`. Un lugar dado de baja se trata como inexistente. **Sin API configurada responde con los datos de prueba** de `src/mocks`, con la misma forma |
| `src/servicios/categorias.ts` | `GET /categorias` (o el mock) |
| `src/servicios/autenticacion.ts` | `POST /auth/ingreso` y `POST /auth/registro` (campo `contrasena`, mínimo 8 caracteres) y `GET /yo` |
| `src/consultas/cliente.ts` | **TanStack Query**: `QueryClient` único (montado en `app/_layout.tsx`), `staleTime` 5 min, 2 reintentos (nunca ante un 4xx). Conecta `AppState` con `focusManager` (refresca al volver a la app) y `expo-network` con `onlineManager` (pausa sin señal) |
| `src/consultas/lugares.ts` | `useLugares`, `useLugar(id)` y `useCategorias`. El detalle se muestra al instante con los datos de la lista (`placeholderData`) y se actualiza con `GET /lugares/:id` |
| `src/utils/horarios.ts` | "Abierto ahora" calculado en el teléfono (la API no lo manda) |

No se usa Zustand: el estado propio de la app es poco (`useState`) y el del servidor lo maneja TanStack Query.

### Conectar la app a la API

1. Levantar la API (en su carpeta, ver su README): `pnpm install`, `pnpm db:reiniciar` y `pnpm dev`. Al arrancar imprime la dirección para el teléfono, por ejemplo `http://192.168.0.17:3000`.
2. En este proyecto, copiar `.env.example` a **`.env.local`** (no se sube a git) y poner esa dirección: `EXPO_PUBLIC_API_URL=http://192.168.0.17:3000`. **No `localhost`**: en Expo Go, `localhost` es el propio teléfono.
3. El teléfono y la compu en la misma wifi. Probar en el navegador del celular `http://192.168.0.17:3000/salud`: tiene que decir `"estado":"ok"`. Si no carga, es el firewall de Windows (permitir Node.js en redes privadas).
4. `npx expo start` (si ya estaba abierto, cerrarlo y volver a abrirlo para que lea `.env.local`).

Usuarios de demo de la API: `lucia@mail.com` / `lucia1234`, `nuevo@demo.ar` / `nuevo1234`.

**Casos difíciles de la API de demo:** `lug-025` con nombre y descripción larguísimos, `lug-003` sin fotos, varios sin teléfono, `cat-bodegas` sin lugares, `lug-026` dado de baja (no aparece) y `lug-009` sin horarios. Para ver el error: `SIMULAR_ERROR_RED = true` en `src/servicios/lugares.ts` (la API responde un 500 a propósito) o frenar la API.

**Sin API** (`EXPO_PUBLIC_API_URL` vacía) la app sigue andando con los datos de prueba de `src/mocks`; el ingreso y el registro avisan que no hay API.

## Arquitectura

```text
app/
├── (tabs)/
│   ├── index.tsx      Mapa: catálogo de lugares
│   ├── agenda.tsx
│   ├── recorrido.tsx
│   └── perfil.tsx     Yo
├── lugar/[id].tsx     Detalle de un lugar
├── login.tsx · registro.tsx
└── _layout.tsx

components/            LugarCard, FiltroCategorias, ImagenLugar, PantallaPendiente
constants/             colores, iconos
src/
├── consultas/         TanStack Query: cliente, lugares
├── mocks/             lugares, categorias (cuando no hay API)
├── servicios/         api (Axios), lugares, categorias, autenticacion, sesion, base-datos, …
├── tipos/             modelos
└── utils/             horarios, formato, distancias

__tests__/             horarios, lugares, distancias, api
```

---

## Instalación

Después de clonar o actualizar la rama:

```bash
npm ci
```

Este comando usa `package-lock.json` y mantiene las mismas versiones para todo el equipo. Para reinstalar un paquete de Expo, usar `npx expo install <paquete>`, que elige la versión compatible con SDK 54.

---

## Ejecución local

```bash
npx expo start          # celular con Expo Go (SDK 54) o emulador
npx expo start --web    # navegador
```

---

## Verificación

```bash
npx tsc --noEmit                 # tipos
npx expo lint                    # lint
npx jest --watchAll=false        # tests
npx expo install --check         # compatibilidad de dependencias
```
