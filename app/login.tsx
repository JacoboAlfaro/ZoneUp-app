import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import Button from '../src/components/Button';
import Field from '../src/components/Field';
import { useSession } from '../src/session/context';

/** Los datos que captura este formulario. */
type LoginForm = { email: string; contrasena: string };

export default function Login() {
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

  return (
    <View className="flex-1 justify-center gap-5 bg-neutral-50 p-6">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-neutral-900">Login ZoneUp</Text>
        <Text className="text-neutral-500">Entra con tu cuenta de correo</Text>
      </View>

      <Field
        control={control}
        name="email"
        label="Correo"
        keyboardType="email-address"
        placeholder="nombre@autonoma.edu.co"
        rules={{
          required: 'El correo es obligatorio',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
        }}
      />
      <Field
        control={control}
        name="contrasena"
        label="Contraseña"
        secureTextEntry
        placeholder="••••••••"
        rules={{ required: 'La contraseña es obligatoria' }}
      />

      {!!formState.errors.root && (
        <Text className="rounded-lg bg-red-50 p-3 text-center text-red-700">
          {formState.errors.root.message}
        </Text>
      )}

      <Button
        text={formState.isSubmitting ? 'Entrando…' : 'Entrar'}
        onPress={handleSubmit(submit)}
        disabled={formState.isSubmitting}
      />

      <Link href="/register" className="text-center text-blue-600">
        ¿No tienes cuenta? Regístrate
      </Link>
    </View>
  );
}
