import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
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
    <KeyboardAvoidingView
      className="flex-1 bg-zu-sky-bottom"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-3 py-4"
        keyboardShouldPersistTaps="handled">
        <View className="absolute -right-20 top-12 h-56 w-56 rounded-full bg-zu-sky-mid" />
        <View className="absolute -left-24 bottom-8 h-64 w-64 rounded-full bg-zu-sky-fade" />

        <View className="gap-5 mt-7 rounded-3xl border border-zu-white/70 bg-zu-white/65 p-5 shadow-lg">
          <View className="items-center gap-1.5">
            <View className="mb-1 h-1 w-10 rounded-full bg-zu-accent" />
            <Text className="text-xs font-semibold uppercase tracking-[3px] text-zu-slogan">
              Registro
            </Text>
            <Text className="text-3xl font-bold text-zu-navy">Crea tu cuenta</Text>
          </View>

          <View className="gap-2">
            <Field
              control={control}
              name="nombres"
              label="Nombre(s)"
              autoCapitalize="words"
              placeholder="Nombre(s) del usuario"
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
              placeholder="Apellidos del usuario"
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
              placeholder="Número de documento"
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
              placeholder="Número de celular (10 dígitos)"
              rules={{
                required: 'El celular es obligatorio',
                minLength: { value: 10, message: 'Mínimo 10 dígitos' },
              }}
            />
            <Field
              control={control}
              name="email"
              label="Correo electrónico"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="tu@correo.com"
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
              autoComplete="new-password"
              placeholder="Contraseña"
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
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              rules={{
                required: 'Confirma la contraseña',
                validate: (value) =>
                  value === getValues('contrasena') || 'Las contraseñas no coinciden',
              }}
            />
          </View>

          {!!formState.errors.root && (
            <Text className="rounded-xl bg-red-50 p-3 text-center text-red-700">
              {formState.errors.root.message}
            </Text>
          )}

          <Button
            text={formState.isSubmitting ? 'Creando…' : 'Regístrate'}
            onPress={handleSubmit(submit)}
            disabled={formState.isSubmitting}
            className="rounded-2xl bg-zu-navy"
          />
        </View>

        <Text className="my-5 text-center text-sm text-zu-slate">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-bold text-zu-navy underline">
            Accede
          </Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}