# Guion del video — Integrante 1

**Mi parte:** navegación base y la pestaña "Los Lugares" (catálogo y detalle).
**Duración:** unos 5 minutos. Cada bloque dice **qué mostrar** y **qué decir**.

---

## Antes de grabar (2 minutos)

1. **Levantar la API de la cátedra** (carpeta `api-mi-ciudad`): `pnpm dev`. Anotar la dirección que imprime para el teléfono (por ejemplo `http://192.168.0.17:3000`) y ponerla en `.env.local` del proyecto: `EXPO_PUBLIC_API_URL=http://192.168.0.17:3000`. Abrir esa dirección + `/salud` en el navegador del celular: tiene que decir `"estado":"ok"`.
2. En el celular (Android), instalar **Expo Go para SDK 54**. El del Play Store no sirve, porque solo abre la última versión:
   https://github.com/expo/expo-go-releases/releases/download/Expo-Go-54.0.8/Expo-Go-54.0.8.apk
3. En la PC, dentro de la carpeta del proyecto:
   ```
   npx expo start
   ```
4. Escanear el código QR con Expo Go. El celular y la PC tienen que estar en el mismo wifi.
5. Dejar abierto en VS Code: `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/lugar/[id].tsx`, `src/servicios/lugares.ts`, `src/servicios/api.ts` y `src/consultas/lugares.ts`.
6. Para mostrar el error: en `src/servicios/lugares.ts`, línea 14, cambiar `SIMULAR_ERROR_RED` a `true` (la API responde un error 500 a propósito). **Después volverlo a `false`.** Otra forma: frenar la API un momento.

---

## 1. Presentación (20 s)

**Mostrar:** la app abierta en el celular, en la pestaña Mapa.

**Decir:**
> "Soy el Integrante 1. Me tocó la navegación base de la app y la pestaña Los Lugares: el catálogo con búsqueda y filtros, y el detalle de cada lugar."

---

## 2. Navegación con Expo Router (1 min)

**Mostrar en el celular:** tocar las 4 pestañas (Mapa, Agenda, Mi recorrido, Yo).

**Mostrar en el código:** la carpeta `app/` y el archivo `app/(tabs)/_layout.tsx`.

**Decir:**
> "Con Expo Router cada archivo de la carpeta `app` es una pantalla. No registro rutas a mano."
>
> "En `(tabs)/_layout.tsx` armo las cuatro pestañas con `Tabs` (línea 8). Cada una tiene su ícono de `@react-native-vector-icons/ionicons`, que es el que pide la cátedra (línea 24). Los paréntesis de `(tabs)` hacen que sea un grupo: no aparece en la dirección."
>
> "En el `_layout.tsx` de afuera está el `Stack`. A `(tabs)` le pongo `headerShown: false` (línea 81), porque si no aparecen dos encabezados, uno arriba del otro."

---

## 3. Ruta dinámica `/lugar/[id]` (40 s)

**Mostrar en el celular:** tocar la tarjeta del Molino Forclaz y que se abra el detalle.

**Mostrar en el código:** `app/(tabs)/index.tsx`, línea 55, y `app/lugar/[id].tsx`, líneas 33 y 80.

**Decir:**
> "El archivo `lugar/[id].tsx` es una ruta dinámica: los corchetes indican un parámetro. Al tocar una tarjeta hago `router.push` con el id del lugar (línea 55)."
>
> "En el detalle leo ese id con `useLocalSearchParams` (línea 33). Los parámetros siempre llegan como texto. El título del encabezado lo pongo con el nombre del lugar (línea 80)."
>
> "Si el lugar ya vino en la lista, el detalle se muestra al instante con esos datos (`placeholderData` en `src/consultas/lugares.ts`) y se pide igual a la API para tener la versión más nueva."

---

## 4. Los datos: tipos, servicios, Axios y TanStack Query (1 min 20 s)

**Mostrar en el código:** `src/tipos/modelos.ts` (línea 22, `Lugar`), `src/servicios/lugares.ts`, `src/servicios/api.ts` y `src/consultas/lugares.ts`.

**Decir:**
> "Los datos vienen de la API de la cátedra. Los tipos están escritos una sola vez en `src/tipos`, tal cual el documento, y cuando conecté la API no los tuve que tocar."
>
> "Ninguna pantalla habla con la API. Todo pasa por `servicios/lugares.ts` (`GET /lugares` y `GET /lugares/:id`). Si no hay API configurada, ese mismo archivo responde con los datos de prueba de `src/mocks`, con la misma forma `{ datos, meta }`."
>
> "Para hablar con la API uso **Axios**, como vimos en la unidad 5, porque hay API propia con token. En `src/servicios/api.ts` hay un solo cliente con `create` y la dirección de `EXPO_PUBLIC_API_URL` (línea 32). Tiene dos interceptores: el de pedido agrega el token `Authorization: Bearer` guardado en `expo-secure-store` (línea 44), y el de respuesta convierte cualquier error en un mensaje claro y, si el token venció (401), cierra la sesión en un solo lugar (línea 71). Distingue las tres formas de error de Axios: el servidor contestó mal, no hubo respuesta, o error de configuración."
>
> "Para las pantallas uso **TanStack Query** (`src/consultas/lugares.ts`): `useQuery` con una `queryKey` por dato. Me da la caché (si vuelvo a la lista no la pide de nuevo), los reintentos (dos, pero nunca ante un 404) y el refresco. En `app/_layout.tsx` está el `QueryClientProvider` (línea 78), y en `src/consultas/cliente.ts` conecto `AppState` con `focusManager` para que se actualice al volver a la app, y `expo-network` con `onlineManager` para pausar sin señal."

**Mostrar en el celular los 3 estados** (es la unidad 5, redes):
- **Cargando:** se ve un instante al abrir (`isPending`, línea 59 de `index.tsx`).
- **Error:** con `SIMULAR_ERROR_RED = true` aparece el mensaje de la API y el botón **Reintentar** (línea 69). Si ya había datos, se siguen viendo.
- **Actualizar:** deslizar la lista hacia abajo la vuelve a pedir (`RefreshControl`).
- **Vacío:** buscar "xyz" → "No hay lugares para mostrar" y el botón **Ver todos**.

---

## 5. FlatList eficiente (50 s)

**Mostrar en el código:** `app/(tabs)/index.tsx`, líneas 89 a 158, y `components/LugarCard.tsx`, línea 56.

**Decir:**
> "El catálogo es una `FlatList`: dibuja solo las tarjetas que se ven en pantalla, no las cien de golpe. Le paso `keyExtractor` con el id (línea 91), `initialNumToRender` y `windowSize` (líneas 106 y 107)."
>
> "La tarjeta `LugarCard` está envuelta en `memo` (línea 56) y la función para abrirla en `useCallback` (línea 54). Así, cuando escribo en el buscador, no se vuelven a dibujar todas las tarjetas."
>
> "El buscador y las categorías van en `ListHeaderComponent`, y el mensaje de lista vacía en `ListEmptyComponent`. El carrusel de categorías y la galería de fotos del detalle también son `FlatList` horizontales; la galería usa `pagingEnabled` para pasar de a una foto."

---

## 6. Búsqueda y filtro en memoria (40 s)

**Mostrar en el celular:** escribir **MOLINO** en mayúsculas → aparece "Molino Forclaz". Después tocar la categoría **Museos y patrimonio**.

**Mostrar en el código:** `src/servicios/lugares.ts`, líneas 31 y 59, y `index.tsx`, línea 44.

**Decir:**
> "Pido los lugares una sola vez y filtro en memoria con `useMemo` (línea 44), así no llamo a la API cada vez que escribo una letra. La lista completa la guarda TanStack Query."
>
> "`normalizarTexto` saca las tildes y las mayúsculas: por eso 'MOLINO' o 'museo' encuentran el lugar igual. Los lugares dados de baja (`activo: false`) nunca se muestran."

---

## 7. El detalle del lugar (40 s)

**Mostrar en el celular:** el detalle del Molino, de arriba hacia abajo.

**Decir:**
> "En el detalle están las fotos que se deslizan, la categoría, si está **abierto ahora** y a qué hora cierra (calculado en el teléfono, con los turnos cortados y los días cerrados), la descripción larga, la dirección, el precio, si es accesible para silla de ruedas, el teléfono (al tocarlo, llama) y los horarios de toda la semana, con el día de hoy marcado."
>
> "Los botones de audioguía y de registrar visita llevan a las partes de mis compañeros. El de audioguía aparece solo si el lugar la tiene."

**Mostrar un caso difícil:** abrir **Playa Paso Vela** → dice "Sin teléfono" y no tiene audioguía. Si una foto no carga, se ve un ícono en lugar de un espacio vacío.

---

## 8. Pensado para el usuario (30 s)

**Mostrar en el código:** `constants/colores.ts`, línea 16 (`TOQUE_MINIMO = 48`), y algún `StyleSheet`.

**Decir:**
> "Valeria pidió que se use al sol, con una mano y por gente grande. Por eso la letra es de 18 o más, el contraste es fuerte y los botones miden por lo menos 48 píxeles."
>
> "No hay alturas fijas en los textos: uso `minHeight`, `flexShrink` y `aspectRatio`, y la galería toma el ancho de la pantalla con `useWindowDimensions`. Así, si el teléfono tiene la letra agrandada, la app no se rompe."

---

## 9. Tests (30 s)

**Mostrar en la terminal:**
```
npx jest --watchAll=false
```

**Decir:**
> "Testeo la lógica propia, que es lo que importa: el filtro de lugares, el 'abierto ahora' con turnos cortados y el cálculo de distancias, los errores de la API (404, 401 con token vencido, sin conexión, demora) y cuándo reintentar. Son 23 tests con `jest-expo`, y además el código pasa TypeScript y `expo lint` sin errores."

---

## 10. Cierre (10 s)

> "Con esto queda lista la base de navegación y el catálogo de lugares. Mis compañeros completan las demás pestañas sobre esta estructura. Gracias."

---

## Si te preguntan

| Pregunta | Respuesta corta |
|---|---|
| ¿Por qué `FlatList` y no `ScrollView`? | `ScrollView` dibuja todo junto; `FlatList` solo lo visible. Con muchos lugares, consume menos memoria y no se traba. |
| ¿Qué es `[id]`? | Un parámetro en la ruta. `/lugar/lug-004` abre el Molino. Se lee con `useLocalSearchParams`. |
| ¿Por qué los servicios son asíncronos? | Porque la API tarda. Lo eran desde el primer día (con el mock), por eso al conectar la API no se reescribieron las pantallas. |
| ¿Por qué Axios y no `fetch`? | La unidad 5: Axios si hay API propia con token y errores uniformes. Un 404/500 ya es error, tiene tiempo máximo y los interceptores ponen el token y manejan el 401 en un solo lugar. |
| ¿Para qué TanStack Query? | El dato del servidor es una copia que envejece. Da caché, reintentos, refresco al volver a la app y pausa sin señal. `staleTime` de 5 minutos para lugares. |
| ¿Y Zustand? | No hace falta: el estado de la app es poco (`useState`); lo del servidor lo maneja TanStack Query. |
| ¿Qué pasa sin internet? | TanStack Query pausa los pedidos y los retoma al volver la señal. Si no había datos, se ve el error con "Reintentar". Las fotos que no cargan muestran un ícono. |
| ¿Dónde se guarda el token? | En `expo-secure-store`, nunca en `kv-store`. Viaja como `Authorization: Bearer`. |
| ¿Por qué Ionicons de `@react-native-vector-icons`? | `@expo/vector-icons` quedó deprecado; la cátedra pide este paquete. |
