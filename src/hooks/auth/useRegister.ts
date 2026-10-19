import { useAlerta } from '@/src/components/alerta/AlertaProvider';
import { useSession } from '@/src/session/context';
import { useForm } from 'react-hook-form';
import { Register } from '@/src/types';

type RegisterForm = Register & { confirmation: string };

export function useRegister() {
  const { signUp } = useSession();
  const alerta = useAlerta();
    const { control, handleSubmit, getValues, formState } = useForm<RegisterForm>({
      defaultValues: {
        documento_identidad: '',
        nombres: '',
        apellidos: '',
        email: '',
        contrasena: '',
        celular: '',
        confirmation: '',
      },
    });
  
    const submit = async ({ confirmation: _, ...dto }: RegisterForm) => {
      try {
        await signUp(dto);
      } catch (error) {
        void alerta.mostrar({
          tipo: 'error',
          titulo: 'No se pudo crear la cuenta',
          mensaje: (error as Error).message,
        });
      }
    };
  return {control, handleSubmit, getValues, formState, submit}
}