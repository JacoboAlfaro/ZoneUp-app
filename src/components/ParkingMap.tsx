import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { Car } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { color, glass, withAlpha } from "@/src/theme";
import type { ZonaAzul } from "@/src/types";
import { VidrioRespaldo } from "./glass/VidrioRespaldo";

const MANIZALES = {
  latitude: 5.0766,
  longitude: -75.5206,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function tieneCoordenadas(zona: ZonaAzul) {
  return Number.isFinite(zona.latitud) && Number.isFinite(zona.longitud);
}

function estiloDeCupo(zona: ZonaAzul) {
  if (zona.capacidad <= 0) {
    return { tint: withAlpha(color.slate, 0.72), fondo: "bg-zu-slate/72" };
  }
  if (zona.capacidad <= 2 || zona.capacidad <= zona.capacidad_total * 0.25) {
    return { tint: withAlpha("#D97706", 0.72), fondo: "bg-amber-600/72" };
  }
  return { tint: glass.navy, fondo: "bg-zu-navy/82" };
}

const LIQUID =
  Platform.OS === "ios" &&
  isLiquidGlassAvailable() &&
  isGlassEffectAPIAvailable();

function MarcadorCarrito({
  tint,
  seleccionado,
  sinCupo,
}: {
  tint: string;
  fondo: string;
  seleccionado: boolean;
  sinCupo: boolean;
}) {
  const lado = seleccionado ? 46 : 40;
  const caja = seleccionado ? "h-[46px] w-[46px]" : "h-10 w-10";
  const interior = (
    <View className={`items-center justify-center ${caja}`}>
      <Car size={seleccionado ? 20 : 18} color={color.white || "#ffffff"} />
      {sinCupo ? (
        <View className="absolute h-0.75 w-7 rounded-sm bg-zu-white -rotate-45" />
      ) : null}
    </View>
  );

  if (LIQUID) {
    return (
      <GlassView
        colorScheme="light"
        glassEffectStyle="clear"
        tintColor={tint}
        style={{
          height: lado,
          width: lado,
          borderRadius: lado / 2,
          overflow: "hidden",
        }}
      >
        {interior}
      </GlassView>
    );
  }

  // Android (y iOS < 26): marcador de vidrio por capas con el color del cupo.
  // Sin desenfoque: el mapa de Google no se puede capturar para desenfocarlo.
  return (
    <VidrioRespaldo tint={tint} radius={lado / 2} oscuro>
      {interior}
    </VidrioRespaldo>
  );
}

export function ParkingMap({
  zonas = [],
  zonaSeleccionadaId,
  onPressZona,
  onPressMapa,
}: {
  zonas?: ZonaAzul[];
  zonaSeleccionadaId?: number | null;
  onPressZona?: (zona: ZonaAzul) => void;
  onPressMapa?: () => void;
}) {
  const mapa = useRef<MapView>(null);
  const tocandoMarcador = useRef(false);
  const [seguirCambios, setSeguirCambios] = useState(true);
  const visibles = zonas.filter(tieneCoordenadas);

  useEffect(() => {
    setSeguirCambios(true);
    const listo = setTimeout(() => setSeguirCambios(false), 400);
    return () => clearTimeout(listo);
  }, [zonas, zonaSeleccionadaId]);

  useEffect(() => {
    if (zonaSeleccionadaId) return;
    const coords = zonas.filter(tieneCoordenadas).map((zona) => ({
      latitude: zona.latitud,
      longitude: zona.longitud,
    }));
    if (coords.length === 0) return;

    if (coords.length === 1) {
      mapa.current?.animateToRegion({
        ...coords[0],
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      return;
    }

    mapa.current?.fitToCoordinates(coords, {
      edgePadding: { top: 120, right: 48, bottom: 48, left: 48 },
      animated: true,
    });
  }, [zonas, zonaSeleccionadaId]);

  useEffect(() => {
    if (!zonaSeleccionadaId) return;
    const zona = zonas.find((item) => item.id === zonaSeleccionadaId);
    if (!zona || !tieneCoordenadas(zona)) return;
    mapa.current?.animateToRegion({
      latitude: zona.latitud,
      longitude: zona.longitud,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    });
  }, [zonaSeleccionadaId, zonas]);

  return (
    <View className="flex-1">
      <MapView
        ref={mapa}
        style={{ width: "100%", height: "100%" }}
        initialRegion={MANIZALES}
        showsMyLocationButton={false}
        mapType="standard"
        onPress={() => {
          if (tocandoMarcador.current) {
            tocandoMarcador.current = false;
            return;
          }
          onPressMapa?.();
        }}
      >
        {visibles.map((zona) => {
          const seleccionado = zona.id === zonaSeleccionadaId;
          const estilo = estiloDeCupo(zona);
          return (
            <Marker
              key={zona.id}
              coordinate={{ latitude: zona.latitud, longitude: zona.longitud }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={LIQUID || seguirCambios}
              onPress={() => {
                tocandoMarcador.current = true;
                onPressZona?.(zona);
              }}
            >
              <MarcadorCarrito
                tint={estilo.tint}
                fondo={estilo.fondo}
                seleccionado={seleccionado}
                sinCupo={zona.capacidad <= 0}
              />
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}
