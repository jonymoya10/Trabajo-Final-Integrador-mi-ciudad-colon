import Ionicons from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { FiltroCategorias } from "../../components/FiltroCategorias";
import { LugarCard } from "../../components/LugarCard";
import { Colores, TOQUE_MINIMO } from "../../constants/colores";
import { obtenerCategorias } from "../../src/servicios/categorias";
import { filtrarLugares, obtenerLugares } from "../../src/servicios/lugares";
import { Categoria, Lugar } from "../../src/tipos/modelos";

// Catálogo de lugares: búsqueda por nombre, filtro por categoría y listado.
// Se piden todos los lugares una vez y se filtran en memoria.
export default function LugaresScreen() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [texto, setTexto] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const [listaLugares, listaCategorias] = await Promise.all([
        obtenerLugares(),
        obtenerCategorias(),
      ]);

      setLugares(listaLugares);
      setCategorias(listaCategorias);
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudieron cargar los lugares.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = useMemo(
    () => filtrarLugares(lugares, { texto, categoriaId }),
    [lugares, texto, categoriaId],
  );

  const categoriaPorId = useMemo(
    () => new Map(categorias.map((categoria) => [categoria.id, categoria])),
    [categorias],
  );

  const abrirLugar = useCallback((id: string) => {
    router.push({ pathname: "/lugar/[id]", params: { id } });
  }, []);

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={Colores.primario} />
        <Text style={styles.mensaje}>Cargando lugares…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centro}>
        <Ionicons name="cloud-offline-outline" size={56} color={Colores.error} />
        <Text style={styles.mensaje}>{error}</Text>
        <Pressable
          onPress={cargar}
          style={styles.boton}
          accessibilityRole="button"
          accessibilityLabel="Reintentar"
        >
          <Text style={styles.botonTexto}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={visibles}
      keyExtractor={(lugar) => lugar.id}
      renderItem={({ item }) => (
        <LugarCard lugar={item} categoria={categoriaPorId.get(item.categoriaId)} onPress={abrirLugar} />
      )}
      contentContainerStyle={styles.lista}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      initialNumToRender={6}
      windowSize={7}
      ListHeaderComponent={
        <View style={styles.encabezado}>
          <View style={styles.buscador}>
            <Ionicons name="search" size={24} color={Colores.textoSecundario} />
            <TextInput
              value={texto}
              onChangeText={setTexto}
              placeholder="Buscar un lugar"
              placeholderTextColor={Colores.textoSecundario}
              style={styles.input}
              returnKeyType="search"
              accessibilityLabel="Buscar un lugar por nombre"
            />
            {texto.length > 0 && (
              <Pressable
                onPress={() => setTexto("")}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Borrar búsqueda"
              >
                <Ionicons name="close-circle" size={24} color={Colores.textoSecundario} />
              </Pressable>
            )}
          </View>

          <FiltroCategorias
            categorias={categorias}
            seleccionada={categoriaId}
            onSeleccionar={setCategoriaId}
          />
        </View>
      }
      ListEmptyComponent={
        <View style={styles.vacio}>
          <Ionicons name="map-outline" size={48} color={Colores.textoSecundario} />
          <Text style={styles.mensaje}>No hay lugares para mostrar.</Text>
          {(texto.length > 0 || categoriaId) && (
            <Pressable
              onPress={() => {
                setTexto("");
                setCategoriaId(null);
              }}
              style={styles.boton}
              accessibilityRole="button"
            >
              <Text style={styles.botonTexto}>Ver todos</Text>
            </Pressable>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    paddingBottom: 32,
    gap: 16,
    backgroundColor: Colores.fondoSuave,
    flexGrow: 1,
  },

  encabezado: {
    gap: 12,
    paddingTop: 16,
  },

  buscador: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colores.borde,
    backgroundColor: Colores.fondo,
  },

  input: {
    flex: 1,
    fontSize: 18,
    color: Colores.texto,
    paddingVertical: 12,
  },

  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
    backgroundColor: Colores.fondo,
  },

  vacio: {
    alignItems: "center",
    gap: 12,
    padding: 32,
  },

  mensaje: {
    fontSize: 18,
    textAlign: "center",
    color: Colores.texto,
  },

  boton: {
    minHeight: TOQUE_MINIMO,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: "center",
    backgroundColor: Colores.primario,
  },

  botonTexto: {
    fontSize: 18,
    fontWeight: "700",
    color: Colores.primarioTexto,
  },
});
