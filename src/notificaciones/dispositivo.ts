/**
 * Avisos push en el teléfono: cómo se muestran, los canales de Android, el permiso y el
 * token que identifica al teléfono. No decide qué avisar ni a quién: eso es del servidor.
 *
 * Al importarse configura cómo se muestran los avisos con la app abierta. El layout raíz
 * lo importa (a través de `useAvisosPush`), así que queda listo antes de cualquier aviso.
 *
 * Nunca se imprime el token: identifica el teléfono de una persona.
 */

import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { quitarTelefono, registrarTelefono } from '../api/notificaciones';

// Sin esto, un aviso que llega con la app abierta no se ve.
// (`shouldShowAlert` está deprecado en el SDK 58: se usan banner y lista.)
Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
});

interface Canal {
  /** El mismo id que manda el servidor en `channelId`. */
  id: string;
  /** Lo que ve el usuario en Ajustes → Notificaciones. */
  nombre: string;
  descripcion: string;
  importancia: Notifications.AndroidImportance;
}

/**
 * Canales de Android. Los ids los usa el servidor (`canal` de cada aviso) y tienen que
 * existir en el teléfono ANTES de que llegue un aviso: Android no muestra los avisos de
 * un canal que no existe. El usuario puede silenciar cada uno en Ajustes.
 */
const CANALES: Canal[] = [
  {
    id: 'recordatorios',
    nombre: 'Recordatorios de tiempo',
    descripcion: 'Cuando faltan 5 minutos para que venza tu tiempo para llegar o tu parqueo.',
    importancia: Notifications.AndroidImportance.MAX,
  },
  {
    id: 'solicitudes',
    nombre: 'Reservas en tus zonas',
    descripcion: 'Para encargados: reservas nuevas y canceladas en las zonas que atiendes.',
    importancia: Notifications.AndroidImportance.MAX,
  },
  {
    id: 'reservas',
    nombre: 'Estado de tus reservas',
    descripcion: 'Cuando el encargado acepta tu reserva, confirma tu llegada o la reserva se cancela.',
    importancia: Notifications.AndroidImportance.HIGH,
  },
];

/** Crea (o actualiza) los canales. Se llama al arrancar la app; en iOS no hace nada. */
export async function crearCanales(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Promise.all(
    CANALES.map(({ id, nombre, descripcion, importancia }) =>
      Notifications.setNotificationChannelAsync(id, {
        name: nombre,
        description: descripcion,
        importance: importancia,
      }),
    ),
  );
}

export interface EstadoPermiso {
  concedido: boolean;
  /** false = el sistema ya no muestra el diálogo: solo se puede activar desde Ajustes. */
  sePuedePreguntar: boolean;
}

export async function estadoDelPermiso(): Promise<EstadoPermiso> {
  const { granted, canAskAgain } = await Notifications.getPermissionsAsync();
  return { concedido: granted, sePuedePreguntar: canAskAgain };
}

/**
 * Muestra el diálogo del sistema y, si el usuario acepta, registra este teléfono. Llámala
 * solo después de explicar para qué sirven los avisos (ver `usePermisoAvisos`).
 */
export async function activarAvisos(): Promise<boolean> {
  // En Android 13+ el diálogo no aparece si todavía no existe ningún canal.
  await crearCanales();
  const { granted } = await Notifications.requestPermissionsAsync();
  if (granted) await registrarEsteTelefono();
  return granted;
}

/** El token que quedó registrado en el servidor en esta sesión (null = ninguno). */
let tokenRegistrado: string | null = null;

/**
 * Registra este teléfono para el usuario en sesión, si ya dio permiso. Una sola vez por
 * sesión. Puede fallar (sin red, sin Google Play): quien la llama decide qué hacer, y la
 * app sigue funcionando sin avisos.
 */
export async function registrarEsteTelefono(): Promise<void> {
  if (tokenRegistrado !== null) return;
  if (!(await estadoDelPermiso()).concedido) return;

  const projectId: string | undefined =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

  await registrarTelefono(token);
  tokenRegistrado = token;
}

/**
 * Al cerrar sesión: el teléfono deja de recibir los avisos de esta cuenta y se limpia la
 * bandeja (en un teléfono compartido, el siguiente usuario no debe ver avisos ajenos).
 * Se llama ANTES de borrar el token de sesión: el DELETE necesita la sesión. No lanza.
 */
export async function olvidarEsteTelefono(): Promise<void> {
  const token = tokenRegistrado;
  tokenRegistrado = null;

  await Promise.allSettled([
    token ? quitarTelefono(token) : Promise.resolve(),
    Notifications.dismissAllNotificationsAsync(),
  ]);
}
