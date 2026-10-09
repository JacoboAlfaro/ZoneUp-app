import { View, Text } from 'react-native'
import React from 'react'
import { useSession } from '@/src/session/context';
import { useForm } from 'react-hook-form';

/** Los datos que captura este formulario. */
type LoginForm = { email: string; contrasena: string };

export function useLogin() {

  const { signIn } = useSession();
  
    // `control` conecta los campos, `handleSubmit` valida antes de enviar y
    // `formState` trae los errores y si se está enviando en este momento.
    const { control, handleSubmit, setError, formState } = useForm<LoginForm>({
      defaultValues: { email: '', contrasena: '' },
    });
  
    const submit = async ({ email, contrasena }: LoginForm) => {
      try {
        await signIn(email, contrasena);
        // No hay que navegar: al cambiar la sesión, el layout raíz muestra las
        // pantallas privadas automáticamente.
      } catch (error) {
        // `root` es el error del formulario completo (credenciales malas, servidor
        // caído...), a diferencia del error de un campo concreto.
        setError('root', { message: (error as Error).message });
      }
    };
  return {control, handleSubmit, formState, submit} 
}