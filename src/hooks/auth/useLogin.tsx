import { View, Text } from 'react-native'
import React from 'react'
import { useAlerta } from '@/src/components/alerta/AlertaProvider';
import { useSession } from '@/src/session/context';
import { useForm } from 'react-hook-form';

/** Los datos que captura este formulario. */
type LoginForm = { email: string; contrasena: string };

export function useLogin() {

  const { signIn } = useSession();
  const alerta = useAlerta();
  
    // `control` conecta los campos, `handleSubmit` valida antes de enviar y
    // `formState` trae los errores y si se está enviando en este momento.
    const { control, handleSubmit, formState } = useForm<LoginForm>({
      defaultValues: { email: '', contrasena: '' },
    });
  
    const submit = async ({ email, contrasena }: LoginForm) => {
      try {
        await signIn(email, contrasena);
        // No hay que navegar: al cambiar la sesión, el layout raíz muestra las
        // pantallas privadas automáticamente.
      } catch (error) {
        // Error del formulario completo (credenciales malas, servidor caído...).
        // Los errores de cada campo los sigue mostrando <Field /> debajo del input.
        void alerta.mostrar({
          tipo: 'error',
          titulo: 'No se pudo iniciar sesión',
          mensaje: (error as Error).message,
        });
      }
    };
  return {control, handleSubmit, formState, submit} 
}