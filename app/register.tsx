import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ScrollView, Text } from 'react-native';
import Button from '../src/components/Button';
import Field from '../src/components/Field';
import { useSession } from '../src/session/context';

type RegisterForm = { name: string; email: string; password: string; confirmation: string };

export default function Register() {
  const { signUp } = useSession();
  const { control, handleSubmit, setError, getValues, formState } = useForm<RegisterForm>({
    defaultValues: { name: '', email: '', password: '', confirmation: '' },
  });

  // `confirmation` no se envía: solo sirve para verificar que no hubo errata.
  const submit = async ({ name, email, password }: RegisterForm) => {
    try {
      await signUp(name, email, password);
    } catch (error) {
      setError('root', { message: (error as Error).message });
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerClassName="gap-5 p-6"
      keyboardShouldPersistTaps="handled">
      <Text className="text-neutral-500">
        Se creará una cuenta de solicitante para reportar y seguir tus casos.
      </Text>

      <Field
        control={control}
        name="name"
        label="Nombre completo"
        autoCapitalize="words"
        placeholder="Ana María Restrepo"
        rules={{
          required: 'El nombre es obligatorio',
          minLength: { value: 2, message: 'Mínimo 2 caracteres' },
        }}
      />
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
        name="password"
        label="Contraseña"
        secureTextEntry
        placeholder="••••••••"
        rules={{
          required: 'La contraseña es obligatoria',
          // 8 caracteres es lo que exige el backend: si aquí se pide menos, el
          // servidor rechazaría el registro y el usuario no sabría por qué.
          minLength: { value: 8, message: 'Mínimo 8 caracteres' },
        }}
      />
      <Field
        control={control}
        name="confirmation"
        label="Confirmar contraseña"
        secureTextEntry
        placeholder="••••••••"
        rules={{
          required: 'Confirma la contraseña',
          validate: (value) => value === getValues('password') || 'Las contraseñas no coinciden',
        }}
      />

      {!!formState.errors.root && (
        <Text className="rounded-lg bg-red-50 p-3 text-center text-red-700">
          {formState.errors.root.message}
        </Text>
      )}

      <Button
        text={formState.isSubmitting ? 'Creando…' : 'Crear cuenta'}
        onPress={handleSubmit(submit)}
        disabled={formState.isSubmitting}
      />

      <Link href="/login" className="text-center text-blue-600">
        ¿Ya tienes cuenta? Inicia sesión
      </Link>
    </ScrollView>
  );
}
