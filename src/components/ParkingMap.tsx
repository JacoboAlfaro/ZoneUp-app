import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { Car } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { sePuedeReservar } from "@/src/api/zonas";
import type { Coordenada } from "@/src/hooks/conductor/useUbicacion";
import { color, glass, withAlpha } from "@/src/theme";
import type { ZonaAzul } from "@/src/types";
import { VidrioRespaldo } from "./glass/VidrioRespaldo";

const MANIZALES = {
  latitude: 5.0766,
  longitude: -75.5206,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const RADIO_CERCANO = 0.05;

function tieneCoordenadas(zona: ZonaAzul) {
  return Number.isFinite(zona.latitud) && Number.isFinite(zona.longitud);
}

function distanciaAprox(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  const dLat = a.latitude - b.latitude;
  const dLng = a.longitude - b.longitude;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function estiloDeCupo(zona: ZonaAzul) {
  if (!sePuedeReservar(zona)) {
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
  noReservable,
}: {
  tint: string;
  fondo: string;
  seleccionado: boolean;
  noReservable: boolean;
}) {
  const lado = seleccionado ? 46 : 40;
  const caja = seleccionado ? "h-[46px] w-[46px]" : "h-10 w-10";
  const interior = (
    <View className={`items-center justify-center ${caja}`}>
      <Car size={seleccionado ? 20 : 18} color={color.white || "#ffffff"} />
      {noReservable ? (
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

  return (
    <VidrioRespaldo tint={tint} radius={lado / 2} oscuro>
      {interior}
    </VidrioRespaldo>
  );
}

function regionDesdeUbicacion(ubicacion: Coordenada) {
  return {
    ...ubicacion,
    latitudeDelta: 0.035,
    longitudeDelta: 0.035,
  };
}

export function ParkingMap({
  zonas = [],
  zonaSeleccionadaId,
  onPressZona,
  onPressMapa,
  mostrarUbicacion = false,
  miUbicacion = null,
  ubicacionListo = true,
}: {
  zonas?: ZonaAzul[];
  zonaSeleccionadaId?: number | null;
  onPressZona?: (zona: ZonaAzul) => void;
  onPressMapa?: () => void;
  mostrarUbicacion?: boolean;
  miUbicacion?: Coordenada | null;
  ubicacionListo?: boolean;
}) {
  const mapa = useRef<MapView>(null);
  const tocandoMarcador = useRef(false);
  const [seguirCambios, setSeguirCambios] = useState(true);
  const [mapaListo, setMapaListo] = useState(false);
  /** Remonta el mapa cuando llega el GPS para que `initialRegion` sí sea tu posición. */
  const [claveMapa, setClaveMapa] = useState("esperando-gps");
  const encuadreHecho = useRef(false);
  const visibles = zonas.filter(tieneCoordenadas);

  const regionInicial = miUbicacion
    ? regionDesdeUbicacion(miUbicacion)
    : MANIZALES;

  useEffect(() => {
    if (!ubicacionListo) return;
    if (miUbicacion) {
      const clave = `yo-${miUbicacion.latitude.toFixed(4)}-${miUbicacion.longitude.toFixed(4)}`;
      setClaveMapa((actual) => {
        if (actual.startsWith("yo-")) return actual;
        return clave;
      });
      return;
    }
    setClaveMapa((actual) => (actual.startsWith("yo-") ? actual : "sin-gps"));
  }, [ubicacionListo, miUbicacion]);

  useEffect(() => {
    encuadreHecho.current = false;
    setMapaListo(false);
  }, [claveMapa]);

  useEffect(() => {
    setSeguirCambios(true);
    const listo = setTimeout(() => setSeguirCambios(false), 400);
    return () => clearTimeout(listo);
  }, [zonas, zonaSeleccionadaId]);

  // Encuadre: espera mapa listo + GPS resuelto. Prioriza al conductor.
  useEffect(() => {
    if (!mapaListo || !ubicacionListo || zonaSeleccionadaId) return;
    if (encuadreHecho.current) return;

    const padding = { top: 140, right: 48, bottom: 80, left: 48 };

    const correr = () => {
      if (!mapa.current || encuadreHecho.current) return;

      if (miUbicacion) {
        const cercanas = zonas
          .filter(tieneCoordenadas)
          .map((zona) => ({ latitude: zona.latitud, longitude: zona.longitud }))
          .filter((coord) => distanciaAprox(coord, miUbicacion) <= RADIO_CERCANO);

        encuadreHecho.current = true;
        if (cercanas.length > 0) {
          mapa.current.fitToCoordinates([miUbicacion, ...cercanas], {
            edgePadding: padding,
            animated: true,
          });
        } else {
          mapa.current.animateToRegion(regionDesdeUbicacion(miUbicacion), 600);
        }
        return;
      }

      const coords = zonas.filter(tieneCoordenadas).map((zona) => ({
        latitude: zona.latitud,
        longitude: zona.longitud,
      }));
      if (coords.length === 0) {
        // Aún no hay zonas: no marcar hecho; reintentará cuando lleguen.
        return;
      }

      encuadreHecho.current = true;
      if (coords.length === 1) {
        mapa.current.animateToRegion(
          { ...coords[0], latitudeDelta: 0.02, longitudeDelta: 0.02 },
          500,
        );
      } else {
        mapa.current.fitToCoordinates(coords, {
          edgePadding: { top: 120, right: 48, bottom: 48, left: 48 },
          animated: true,
        });
      }
    };

    const t1 = setTimeout(correr, 80);
    const t2 = setTimeout(correr, 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [mapaListo, ubicacionListo, miUbicacion, zonas, zonaSeleccionadaId, claveMapa]);

  useEffect(() => {
    if (!zonaSeleccionadaId || !mapaListo) return;
    const zona = zonas.find((item) => item.id === zonaSeleccionadaId);
    if (!zona || !tieneCoordenadas(zona)) return;
    mapa.current?.animateToRegion(
      {
        latitude: zona.latitud,
        longitude: zona.longitud,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      400,
    );
  }, [zonaSeleccionadaId, zonas, mapaListo]);

  return (
    <View className="flex-1">
      <MapView
        key={claveMapa}
        ref={mapa}
        style={{ width: "100%", height: "100%" }}
        initialRegion={regionInicial}
        showsUserLocation={mostrarUbicacion}
        showsMyLocationButton={false}
        mapType="standard"
        onMapReady={() => setMapaListo(true)}
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
                noReservable={!sePuedeReservar(zona)}
              />
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}