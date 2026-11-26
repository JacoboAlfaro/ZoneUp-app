import { Linking, Platform } from 'react-native';

export async function abrirComoLlegar(
  latitud: number,
  longitud: number,
  etiqueta?: string,
): Promise<void> {
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
    throw new Error('Esta zona no tiene coordenadas válidas.');
  }

  const destino = `${latitud},${longitud}`;
  const label = encodeURIComponent(etiqueta?.trim() || 'Zona azul');

  const nativo =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${destino}&dirflg=d`
      : `google.navigation:q=${destino}`;
  const respaldo = `https://www.google.com/maps/dir/?api=1&destination=${destino}&travelmode=driving`;

  try {
    await Linking.openURL(nativo);
  } catch {
    try {
      await Linking.openURL(
        Platform.OS === 'ios'
          ? `http://maps.apple.com/?daddr=${destino}&q=${label}`
          : respaldo,
      );
    } catch {
      await Linking.openURL(respaldo);
    }
  }
}