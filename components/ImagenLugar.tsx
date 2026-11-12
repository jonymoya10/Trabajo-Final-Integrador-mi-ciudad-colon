import Ionicons from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { useState } from "react";
import { ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { Colores } from "../constants/colores";

interface Props {
  uri: string | undefined;
  style: StyleProp<ViewStyle>;
  descripcion: string;
}

// Foto de un lugar. Si no hay foto o no carga (sin señal), muestra un ícono.
export function ImagenLugar({ uri, style, descripcion }: Props) {
  const [fallo, setFallo] = useState(false);

  if (!uri || fallo) {
    return (
      <View
        style={[style, styles.vacia]}
        accessible
        accessibilityLabel={`${descripcion}: sin foto`}
      >
        <Ionicons name="image-outline" size={40} color={Colores.textoSecundario} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style as StyleProp<ImageStyle>}
      contentFit="cover"
      cachePolicy="disk"
      onError={() => setFallo(true)}
      accessibilityLabel={descripcion}
    />
  );
}

const styles = StyleSheet.create({
  vacia: {
    backgroundColor: Colores.fondoSuave,
    alignItems: "center",
    justifyContent: "center",
  },
});
