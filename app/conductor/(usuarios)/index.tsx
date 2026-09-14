import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import Button from '../../../src/components/Button';
import { useSession } from '../../../src/session/context';

export default function Usuario() {
  const { user } = useSession();

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
    <View className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 p-6"
        showsVerticalScrollIndicator={false}>

        <View className="gap-2">
          <Text className="text-3xl font-bold text-neutral-900">
            Mi perfil
          </Text>

          <Text className="text-neutral-500">
            Consulta tu información personal
          </Text>
        </View>

        <View className="gap-5 rounded-2xl bg-white p-5">

          <View>
            <Text className="text-sm font-semibold text-neutral-500">
              Documento
            </Text>

            <Text className="mt-1 text-base text-neutral-900">
              {user.documento_identidad}
            </Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-neutral-500">
              Nombre completo
            </Text>

            <Text className="mt-1 text-base text-neutral-900">
              {user.name}
            </Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-neutral-500">
              Correo electrónico
            </Text>

            <Text className="mt-1 text-base text-neutral-900">
              {user.email}
            </Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-neutral-500">
              Celular
            </Text>

            <Text className="mt-1 text-base text-neutral-900">
              {user.celular}
            </Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-neutral-500">
              Tipo de usuario
            </Text>

            <Text className="mt-1 text-base text-neutral-900">
              {user.tipo_usuario === 'conductor'
                ? 'Conductor'
                : user.tipo_usuario}
            </Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-neutral-500">
              Estado
            </Text>

            <Text className="mt-1 text-base text-neutral-900">
              {user.estado}
            </Text>
          </View>
        </View>

        <Button
          text="Editar perfil"
          onPress={() => router.push('/conductor/(usuarios)/edition')}
        />

      </ScrollView>
    </View>
  );
}