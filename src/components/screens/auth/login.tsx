import { useLogin } from '@/src/hooks/auth/useLogin';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import Button from '../../Button';
import Field from '../../Field';
import FormError from '../../FormError';


const LoginScreen = () => {
  const {control, handleSubmit, formState, submit} = useLogin();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-zu-sky-bottom"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-5 py-10"
        keyboardShouldPersistTaps="handled">
        <View className="absolute -right-20 top-12 h-56 w-56 rounded-full bg-zu-sky-mid" />
        <View className="absolute -left-24 bottom-8 h-64 w-64 rounded-full bg-zu-sky-fade" />

        <View className="gap-6 rounded-3xl border border-zu-white/70 bg-zu-white/65 p-6 shadow-md">
          <View className="items-center gap-2">
            <View className="mb-1 h-1 w-10 rounded-full bg-zu-accent" />
            <Text className="text-xs font-semibold uppercase tracking-[3px] text-zu-slogan">
              Inicio de sesión
            </Text>
            <Text className="text-3xl font-bold text-zu-navy">Accede</Text>
            <Text className="text-center text-sm text-zu-slate">
              Ingresa tus datos para continuar en ZoneUp
            </Text>
          </View>

          <View className="gap-3">
            <Field
              control={control}
              name="email"
              label="Correo electrónico"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="tu@correo.com"
              maxLength={254}
              rules={{
                required: 'El correo es obligatorio',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
                maxLength: { value: 254, message: 'Máximo 254 caracteres' },
              }}
            />
            <Field
              control={control}
              name="contrasena"
              label="Contraseña"
              secureTextEntry
              autoComplete="current-password"
              placeholder="Contraseña"
              maxLength={128}
              rules={{
                required: 'La contraseña es obligatoria',
                maxLength: { value: 128, message: 'Máximo 128 caracteres' },
              }}
            />
          </View>

          <FormError message={formState.errors.root?.message} />

          <Button
            text={formState.isSubmitting ? 'Ingresando…' : 'Ingresar'}
            onPress={handleSubmit(submit)}
            disabled={formState.isSubmitting}
            className="rounded-2xl bg-zu-navy"
          />
        </View>

        <Text className="mt-6 text-center text-sm text-zu-slate">
          ¿Sin cuenta?{' '}
          <Link href="/register" className="font-bold text-zu-navy underline">
            Crea una cuenta
          </Link>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen