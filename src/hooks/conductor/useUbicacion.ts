import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export type Coordenada = {
  latitude: number;
  longitude: number;
};

export function useUbicacion() {
  const [concedido, setConcedido] = useState(false);
  const [coordenada, setCoordenada] = useState<Coordenada | null>(null);
  const [listo, setListo] = useState(false);

  const refrescar = useCallback(async () => {
    setListo(false);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setConcedido(false);
        setCoordenada(null);
        return;
      }

      setConcedido(true);

      let coords: Location.LocationObjectCoords | null = null;
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = pos.coords;
      } catch {
        const ultima = await Location.getLastKnownPositionAsync();
        coords = ultima?.coords ?? null;
      }

      if (coords) {
        setCoordenada({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      } else {
        setCoordenada(null);
      }
    } catch {
      setCoordenada(null);
    } finally {
      setListo(true);
    }
  }, []);

  useEffect(() => {
    void refrescar();
  }, [refrescar]);

  return { concedido, coordenada, listo, refrescar };
}