import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ScrollView, Text } from 'react-native';
import Button from '../src/components/Button';
import Field from '../src/components/Field';
import { useSession } from '../src/session/context';
import type { Register } from '../src/types';

type RegisterForm = Register & { confirmation: string };

export default function Register() {
  const { signUp } = useSession();
  const { control, handleSubmit, setError, getValues, formState } = useForm<RegisterForm>({
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
      setError('root', { message: (error as Error).message });
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerClassName="gap-5 p-6"
      keyboardShouldPersistTaps="handled">
      <Text className="text-neutral-500">
        Crea tu cuenta de conductor para reservar zonas de parqueo.
      </Text>

      <Field
        control={control}
        name="nombres"
        label="Nombres"
        autoCapitalize="words"
        placeholder="Juan"
        rules={{
          required: 'El nombre es obligatorio',
          minLength: { value: 2, message: 'Mínimo 2 caracteres' },
        }}
      />
      <Field
        control={control}
        name="apellidos"
        label="Apellidos"
        autoCapitalize="words"
        placeholder="Pérez Gómez"
        rules={{
          required: 'Los apellidos son obligatorios',
          minLength: { value: 2, message: 'Mínimo 2 caracteres' },
        }}
      />
      <Field
        control={control}
        name="documento_identidad"
        label="Documento"
        keyboardType="number-pad"
        placeholder="1234567890"
        rules={{
          required: 'El documento de identidad es obligatorio',
          minLength: { value: 6, message: 'Mínimo 6 caracteres' },
        }}
      />
      <Field
        control={control}
        name="celular"
        label="Celular"
        keyboardType="phone-pad"
        placeholder="3001234567"
        rules={{
          required: 'El celular es obligatorio',
          minLength: { value: 10, message: 'Mínimo 10 dígitos' },
        }}
      />
      <Field
        control={control}
        name="email"
        label="Correo"
        keyboardType="email-address"
        placeholder="nombre@correo.com"
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
        rules={{
          required: 'La contraseña es obligatoria',
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
          validate: (value) => value === getValues('contrasena') || 'Las contraseñas no coinciden',
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
