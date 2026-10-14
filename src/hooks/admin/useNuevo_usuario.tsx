import { createUser, toRegisterDto } from "@/src/api";
import { useAlerta } from "@/src/components/alerta/AlertaProvider";
import { Register } from "@/src/types";
import { router } from "expo-router";
import { useForm } from "react-hook-form";

type CreateUserForm = Register & { confirmation: string };

const tipos = ['conductor', 'controlador'] as const;
const estados = ['activo', 'no_verificado', 'inactivo'] as const;

export function useNuevo_usuario() {
    const alerta = useAlerta();
    const { control, getValues, handleSubmit, formState } = useForm<CreateUserForm>({
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
          await alerta.mostrar({
            tipo: 'exito',
            titulo: 'Usuario creado',
            mensaje: 'El usuario fue registrado correctamente.',
          });
          router.back();
        } catch (cause) {
          void alerta.mostrar({
            tipo: 'error',
            titulo: 'No se pudo crear el usuario',
            mensaje: (cause as Error).message,
          });
        }
      };

      return { tipos, estados, control, getValues, handleSubmit, formState, guardar }
}
