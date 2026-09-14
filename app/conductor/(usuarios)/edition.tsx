import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, Text, View } from 'react-native';
import Button from '../../../src/components/Button';
import Field from '../../../src/components/Field';
import NoSessionState from '../../../src/components/NoSessionState';
import { updateUser } from '../../../src/api/users';
import { useSession } from '../../../src/session/context';

type EditarUsuarioForm = {
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  email: string;
  celular: string;
};

export default function EditarUsuario() {
  const { user, updateCurrentUser } = useSession();

  const {
    control,
    handleSubmit,
    formState,
  } = useForm<EditarUsuarioForm>({
    defaultValues: {
      primer_nombre: user?.primer_nombre ?? '',
      segundo_nombre: user?.segundo_nombre ?? '',
      primer_apellido: user?.primer_apellido ?? '',
      segundo_apellido: user?.segundo_apellido ?? '',
      email: user?.email ?? '',
      celular: user?.celular ?? '',
    },
  });

  if (!user) {
    return <NoSessionState />;
  }

  const guardarCambios = async (datos: EditarUsuarioForm) => {
    try {
      const usuarioActualizado = await updateUser(user.documento_identidad, {
        primer_nombre: datos.primer_nombre,
        segundo_nombre: datos.segundo_nombre.trim() || null,
        primer_apellido: datos.primer_apellido,
        segundo_apellido: datos.segundo_apellido.trim() || null,
        email: datos.email,
        celular: datos.celular,
      });

      updateCurrentUser(usuarioActualizado);

      Alert.alert(
        'Perfil actualizado',
        'Tus datos se actualizaron correctamente.',
        [
          {
            text: 'Aceptar',
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.log("Error:", error)
      Alert.alert(
        'Error',
        (error as Error).message,
      );
    }
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-6"
        showsVerticalScrollIndicator={false}>

        <View className="gap-2">
          <Text className="text-3xl font-bold text-neutral-900">
            Editar perfil
          </Text>

          <Text className="text-neutral-500">
            Actualiza tu información personal
          </Text>
        </View>

        <View className="gap-3 rounded-2xl bg-white p-5">

          <Field
            control={control}
            name="primer_nombre"
            label="Primer nombre"
            placeholder="Primer nombre"
            rules={{
              required: 'El primer nombre es obligatorio',
            }}
          />

          <Field
            control={control}
            name="segundo_nombre"
            label="Segundo nombre"
            placeholder="Segundo nombre"
          />

          <Field
            control={control}
            name="primer_apellido"
            label="Primer apellido"
            placeholder="Primer apellido"
            rules={{
              required: 'El primer apellido es obligatorio',
            }}
          />

          <Field
            control={control}
            name="segundo_apellido"
            label="Segundo apellido"
            placeholder="Segundo apellido"
          />

          <Field
            control={control}
            name="email"
            label="Correo electrónico"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            rules={{
              required: 'El correo es obligatorio',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Correo inválido',
              },
            }}
          />

          <Field
            control={control}
            name="celular"
            label="Celular"
            keyboardType="phone-pad"
            placeholder="Celular"
            rules={{
              required: 'El celular es obligatorio',
            }}
          />

        </View>

        <Button
          text={formState.isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          onPress={handleSubmit(guardarCambios)}
          disabled={formState.isSubmitting}
        />

      </ScrollView>
    </View>
  );
}