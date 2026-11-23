import { FondoPantalla } from "@/src/components/glass/FondoPantalla";
import { router } from "expo-router";
import { MapPin, Users } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";

import { useAdminIndex } from "@/src/hooks/admin/useAdminIndex";
import Button from "../../Button";
import DashboardNavTile from "../../DashboardNavTile";
import DashboardStat from "../../DashboardStat";

const AdminIndexScreen = () => {
  const { user, signOut, totalUsuarios, totalZonas } = useAdminIndex();

  return (
    <FondoPantalla style={{ flex: 1 }} edges={["bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs font-semibold uppercase tracking-[3px] text-zu-slogan">
          ZoneUp
        </Text>
        <Text className="mt-2 text-3xl font-bold text-zu-navy">
          Hola, {user?.name}
        </Text>
        <Text className="mt-2 text-base leading-6 text-zu-slate">
          Consulta el estado del sistema y gestiona usuarios y zonas azules.
        </Text>

        <View className="mt-6 flex-row gap-3">
          <DashboardStat
            value={totalUsuarios ?? "…"}
            label="Usuarios registrados"
          />
          <DashboardStat
            value={totalZonas ?? "…"}
            label="Zonas azules gestionadas"
          />
        </View>

        <Text className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/50">
          Gestionar
        </Text>

        {/* Componente reusable para las tarjetas de navegación */}
        <DashboardNavTile
          icon={Users}
          title="Usuarios"
          subtitle="Ver datos, crear usuarios y cambiar su estado"
          onPress={() => router.push("/admin/(usuarios)/usuarios")}
        />

        <View className="mt-3">
          <DashboardNavTile
            icon={MapPin}
            title="Zonas azules"
            subtitle={
              totalZonas === null
                ? "Cupos y ubicación"
                : `${totalZonas} registradas · cupos y ubicación`
            }
            onPress={() => router.push("/admin/(zonas)/zonas")}
          />
        </View>

        <Button
          text="Cerrar sesión"
          onPress={signOut}
          destructive
          className="mt-8"
        />
      </ScrollView>
    </FondoPantalla>
  );
};

export default AdminIndexScreen;
