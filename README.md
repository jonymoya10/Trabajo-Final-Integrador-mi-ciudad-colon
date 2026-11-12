# Mi Ciudad — Guía turística de Colón

Aplicación móvil desarrollada como **Trabajo Integrador Final** de la asignatura **Desarrollo para Móviles — 2026**, Universidad Nacional de Entre Ríos (UNER).

Aplicación para el turista que visita Colón (Entre Ríos): lugares, mapa, agenda de eventos, recorrido y audioguías. Pedido de la Dirección de Turismo de la Municipalidad de Colón.

---

## Integrantes

| Integrante |
|---|
| Melina Johanna Lisette Casco |
| Daniel Marcelo Cisnero |
| José Ignacio Debuck |
| Marcos Gabriel Gainza |
| María Gabriela Olivares Contreras |
| Matías Vespa |

---

## Repositorio y rama de desarrollo

Repositorio principal del grupo:

[github.com/Ranger9707/DesarrolloparaMoviles2026](https://github.com/Ranger9707/DesarrolloparaMoviles2026)

Rama de desarrollo utilizada actualmente:

[`Melina-Casco---Test`](https://github.com/Ranger9707/DesarrolloparaMoviles2026/tree/Melina-Casco---Test)

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

## Datos (hasta que llegue la API de la cátedra)

| Carpeta | Qué hay |
|---|---|
| `src/tipos/modelos.ts` | Los tipos del documento, tal cual (Lugar, Categoria, Evento, Usuario, Favorito, Visita, respuesta de la API). No se tocan cuando llegue la API |
| `src/mocks/` | Datos de prueba (`lugares`, `categorias`) tipados con esos tipos |
| `src/servicios/lugares.ts` | Única puerta a los datos. Es asíncrono y hoy responde con el mock usando la forma de la API (`{ datos, meta }` o `{ error }`). Cuando llegue la API, solo cambia este archivo |
| `src/utils/horarios.ts` | "Abierto ahora" calculado en el teléfono (turnos cortados, días cerrados) |
| `src/servicios/api.ts` | Cliente de la API (`fetch` con el token de `expo-secure-store` en `Authorization: Bearer`). La dirección sale de `EXPO_PUBLIC_API_URL` en el archivo `.env`; mientras esté vacía, los servicios usan los mocks |

**Casos difíciles incluidos en los datos de prueba:**
- lugar sin audioguía y sin teléfono (Playa Paso Vela);
- descripción larguísima y sin fotos (El Palmar);
- lugar dado de baja, que no se muestra;
- categoría sin lugares (Alojamiento);
- error de red: poner `SIMULAR_ERROR_RED = true` en `src/servicios/lugares.ts`.

Las fotos de prueba apuntan a `api.colon.tur.ar`, que todavía no existe. Mientras tanto se ve un ícono en su lugar.

## Arquitectura

```text
app/
├── (tabs)/
│   ├── index.tsx      Mapa: catálogo de lugares
│   ├── agenda.tsx
│   ├── recorrido.tsx
│   └── perfil.tsx     Yo
├── lugar/[id].tsx     Detalle de un lugar
├── login.tsx · registro.tsx · modal.tsx
└── _layout.tsx

components/            LugarCard, FiltroCategorias, ImagenLugar, PantallaPendiente
constants/             colores, iconos
src/
├── mocks/             lugares, categorias
├── servicios/         lugares, categorias, api, autenticacion, sesion, base-datos, …
├── tipos/             modelos
└── utils/             horarios, formato, distancias

__tests__/             horarios, lugares, distancias
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
