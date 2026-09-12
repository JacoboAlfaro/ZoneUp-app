import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
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
              autoComplete="current-password"
              placeholder="Contraseña"
              rules={{ required: 'La contraseña es obligatoria' }}
            />
          </View>

          {!!formState.errors.root && (
            <Text className="rounded-xl bg-red-50 p-3 text-center text-red-700">
              {formState.errors.root.message}
            </Text>
          )}

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
