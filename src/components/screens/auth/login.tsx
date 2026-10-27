import { useLogin } from "@/src/hooks/auth/useLogin";
import { Link } from "expo-router";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import Button from "../../Button";
import Field from "../../Field";
import { GlassCard } from "../../GlassCard";
import { FondoGlass } from "../../glass/FondoGlass";
const LoginScreen = () => {
  const { control, handleSubmit, formState, submit } = useLogin();
  const { height } = useWindowDimensions();
  return (
    <FondoGlass>
      <ScrollView
        className="flex-1"
        contentContainerClassName="justify-center px-5 py-10"
        contentContainerStyle={{ minHeight: height }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <GlassCard className="gap-6">
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
                required: "El correo es obligatorio",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Correo inválido",
                },
                maxLength: { value: 254, message: "Máximo 254 caracteres" },
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
                required: "La contraseña es obligatoria",
                maxLength: { value: 128, message: "Máximo 128 caracteres" },
              }}
            />
          </View>
          <Button
            text={formState.isSubmitting ? "Ingresando…" : "Ingresar"}
            onPress={handleSubmit(submit)}
            disabled={formState.isSubmitting}
          />
        </GlassCard>
        <Text className="mt-6 text-center text-sm text-zu-slate">
          ¿Sin cuenta?{" "}
          <Link href="/register" className="font-bold text-zu-navy underline">
            Crea una cuenta
          </Link>
        </Text>
      </ScrollView>
    </FondoGlass>
  );
};
export default LoginScreen;
