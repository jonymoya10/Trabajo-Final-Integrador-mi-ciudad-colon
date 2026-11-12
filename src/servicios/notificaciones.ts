import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function configurarNotificaciones(): Promise<void> {
  const permisosActuales = await Notifications.getPermissionsAsync();

  let estadoFinal = permisosActuales.status;

  if (estadoFinal !== "granted") {
    const nuevosPermisos = await Notifications.requestPermissionsAsync();

    estadoFinal = nuevosPermisos.status;
  }

  if (estadoFinal !== "granted") {
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("general", {
      name: "General",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function mostrarNotificacion(
  titulo: string,
  mensaje: string,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: mensaje,
      sound: true,
    },
    trigger: null,
  });
}
