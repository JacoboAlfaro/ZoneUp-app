import { createUser, toRegisterDto } from "@/src/api";
import { Register } from "@/src/types";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

type CreateUserForm = Register & { confirmation: string };

const tipos = ['conductor', 'controlador'] as const;
const estados = ['activo', 'no_verificado', 'inactivo'] as const;

export function useNuevo_usuario() {
    const { control, getValues, handleSubmit, setError, formState } = useForm<CreateUserForm>({
        defaultValues: {
          documento_identidad: '',
          nombres: '',
          apellidos: '',
          email: '',
          contrasena: '',
          celular: '',
          tipo_usuario: 'conductor',
          estado: 'inactivo',
          confirmation: '',
        },
      });
    
      const guardar = async ({ confirmation: _, ...form }: CreateUserForm) => {
        try {
          await createUser(toRegisterDto(form));
          Alert.alert('Usuario creado', 'El usuario fue registrado correctamente.', [
            { text: 'Aceptar', onPress: () => router.back() },
          ]);
        } catch (cause) {
          setError('root', { message: (cause as Error).message });
        }
      };

      return { tipos, estados, control, getValues, handleSubmit, formState, guardar }
}
