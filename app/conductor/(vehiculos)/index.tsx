import { router, useFocusEffect } from "expo-router";
import { Car, Plus, RefreshCw } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getVehiculos } from "../../../src/api/vehiculos";
import { useSession } from "../../../src/session/context";
import type { Vehiculo } from "../../../src/types";

export default function MisVehiculos() {
  const { user } = useSession();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarVehiculos = useCallback(
    async (refresh = false) => {
      if (!user) return;

      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        setVehiculos(await getVehiculos(user.documento_identidad));
      } catch (cause) {
        setError((cause as Error).message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      void cargarVehiculos();
    }, [cargarVehiculos]),
  );

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 p-6">
        <Text className="text-base text-red-600">
          No hay un usuario iniciado.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#EEF8FC" }}
      edges={["bottom"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-3"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void cargarVehiculos(true)}
          />
        }
      >
        <Text className="text-base leading-6 text-zu-slate">
          Consulta, agrega y edita los vehículos registrados a tu nombre.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Agregar vehículo"
          onPress={() => router.push("/conductor/(vehiculos)/nuevo-vehiculo")}
          className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl bg-zu-navy px-5 py-4 active:opacity-80"
        >
          <Plus size={21} color="#FFFFFF" />
          <Text className="text-base font-bold text-white">
            Agregar vehículo
          </Text>
        </Pressable>

        <View className="mt-5 flex-row gap-3">
          <View className="min-h-28 flex-1 justify-between rounded-2xl border border-zu-white/70 bg-zu-white/90 p-4 shadow-sm">
            <Text className="text-3xl font-bold text-zu-navy">
              {vehiculos.length}
            </Text>
            <Text className="mt-2 text-xs leading-4 text-zu-slate">
              Vehículos registrados
            </Text>
          </View>
        </View>

        <Text className="mb-1 mt-8 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/50">
          Listado ({vehiculos.length})
        </Text>

        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#1E3A5F" />
            <Text className="mt-3 text-zu-slate">Cargando vehículos…</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View className="mt-4 items-center rounded-2xl bg-red-50 p-5">
            <Text className="text-center text-red-700">{error}</Text>
            <Pressable
              onPress={() => void cargarVehiculos()}
              className="mt-4 flex-row items-center gap-2 rounded-xl px-4 py-2"
            >
              <RefreshCw size={18} color="#2563EB" />
              <Text className="font-semibold text-zu-navy">Reintentar</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && vehiculos.length === 0 ? (
          <View className="mt-4 items-center rounded-2xl bg-zu-white/80 p-8">
            <Car size={34} color="#6B8698" />
            <Text className="mt-3 text-center text-zu-slate">
              Todavía no tienes vehículos registrados.{"\n"}Toca “Agregar
              vehículo” para crear el primero.
            </Text>
          </View>
        ) : null}

        {!loading && !error
          ? vehiculos.map((vehiculo) => (
              <Pressable
                key={vehiculo.placa}
                accessibilityRole="button"
                accessibilityLabel={`Vehículo ${vehiculo.placa}`}
                onPress={() =>
                  router.push({
                    pathname: "/conductor/(vehiculos)/vehiculo/[placa]",
                    params: { placa: vehiculo.placa },
                  })
                }
                className="mt-3 rounded-2xl border border-zu-white/70 bg-zu-white/90 p-4 shadow-sm active:opacity-80"
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 flex-row items-center gap-4">
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-sky-100">
                      <Car size={22} color="#1E3A5F" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-zu-navy">
                        {vehiculo.placa}
                      </Text>
                      <Text className="mt-1 text-sm leading-5 text-zu-slate">
                        {vehiculo.marca || "Marca sin registrar"} ·{" "}
                        {vehiculo.color || "Color sin registrar"}
                      </Text>
                      <View className="mt-3.5 flex-row items-center gap-1.5 self-start rounded-full border border-zu-navy/10 bg-white/80 py-2 pl-3.5 pr-3 shadow-sm">
                        <Car size={16} color="#1E3A5F" />
                        <Text className="pr-0.5 text-[13px] font-semibold text-zu-navy">
                          Ver y editar
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="rounded-full bg-sky-100 px-2.5 py-1">
                    <Text className="text-xs font-semibold text-sky-900">
                      {vehiculo.placa}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          : null}
      </ScrollView>
    </SafeAreaView>
  );
}
