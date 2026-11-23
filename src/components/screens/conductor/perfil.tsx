import { FondoPantalla } from "@/src/components/glass/FondoPantalla";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSession } from "../../../session/context";
import Button from "../../Button";
import { GlassCard } from "../../GlassCard";
import NoSessionState from "../../NoSessionState";

const PerfilScreen = function () {
  const { user } = useSession();

  if (!user) {
    return <NoSessionState />;
  }

  return (
    <FondoPantalla>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 p-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <Text className="text-3xl font-bold text-zu-navy">Mi perfil</Text>

          <Text className="text-zu-slate">
            Consulta tu información personal
          </Text>
        </View>

        <GlassCard className="gap-5 p-5">
          <View>
            <Text className="text-sm font-semibold text-zu-slate">
              Documento
            </Text>

            <Text className="mt-1 text-base text-zu-navy">
              {user.documento_identidad}
            </Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-zu-slate">
              Nombre completo
            </Text>

            <Text className="mt-1 text-base text-zu-navy">{user.name}</Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-zu-slate">
              Correo electrónico
            </Text>

            <Text className="mt-1 text-base text-zu-navy">{user.email}</Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-zu-slate">Celular</Text>

            <Text className="mt-1 text-base text-zu-navy">{user.celular}</Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-zu-slate">
              Tipo de usuario
            </Text>

            <Text className="mt-1 text-base text-zu-navy">
              {user.tipo_usuario === "conductor"
                ? "Conductor"
                : user.tipo_usuario}
            </Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-zu-slate">Estado</Text>

            <Text className="mt-1 text-base text-zu-navy">{user.estado}</Text>
          </View>
        </GlassCard>

        <Button
          text="Editar perfil"
          onPress={() => router.push("/conductor/(panel)/(usuarios)/edition")}
        />
      </ScrollView>
    </FondoPantalla>
  );
};

export default PerfilScreen;
