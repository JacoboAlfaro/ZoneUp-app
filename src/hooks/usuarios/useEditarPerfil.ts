import { router } from 'expo-router';
import { useForm, type RegisterOptions } from 'react-hook-form';
import { Alert } from 'react-native';

import { updateUser } from '@/src/api/users';
import { useSession } from '@/src/session/context';

/** Los datos que captura el formulario de edición del perfil. */
export type EditarUsuarioForm = {
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  email: string;
  celular: string;
};

/** Validaciones de los campos obligatorios. <Field /> muestra el mensaje debajo del input. */
const reglas: Partial<Record<keyof EditarUsuarioForm, RegisterOptions<EditarUsuarioForm>>> = {
  primer_nombre: { required: 'El primer nombre es obligatorio' },
  primer_apellido: { required: 'El primer apellido es obligatorio' },
  email: {
    required: 'El correo es obligatorio',
    pattern: {
      value: /^\S+@\S+\.\S+$/,
      message: 'Correo inválido',
    },
  },
  celular: { required: 'El celular es obligatorio' },
};

/**
 * Lógica de la pantalla "Editar perfil": llena el formulario con los datos del
 * usuario en sesión, guarda los cambios en el servidor y actualiza la sesión.
 */
export function useEditarPerfil() {
  const { user, updateCurrentUser } = useSession();

  const { control, handleSubmit, formState } = useForm<EditarUsuarioForm>({
    defaultValues: {
      primer_nombre: user?.primer_nombre ?? '',
      segundo_nombre: user?.segundo_nombre ?? '',
      primer_apellido: user?.primer_apellido ?? '',
      segundo_apellido: user?.segundo_apellido ?? '',
      email: user?.email ?? '',
      celular: user?.celular ?? '',
    },
  });

  const guardar = async (datos: EditarUsuarioForm) => {
    if (!user) return;

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

  return {
    user,
    control,
    reglas,
    guardando: formState.isSubmitting,
    guardarCambios: handleSubmit(guardar),
  };
}
