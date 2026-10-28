import { useRegister } from "@/src/hooks/auth/useRegister";
import { Link } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import Button from "../../Button";
import Field from "../../Field";
import { GlassCard } from "../../GlassCard";
import { FondoGlass } from "../../glass/FondoGlass";
const RegisterScreen = () => {
  const { control, handleSubmit, getValues, formState, submit } = useRegister();
  return (
    <FondoGlass>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-3 py-4"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-7">
            <GlassCard className="gap-5 p-6">
              <View className="items-center gap-1.5">
                <View className="mb-1 h-1 w-10 rounded-full bg-zu-accent" />
                <Text className="text-xs font-semibold uppercase tracking-[3px] text-zu-slogan">
                  Registro
                </Text>
                <Text className="text-3xl font-bold text-zu-navy">
                  Crea tu cuenta
                </Text>
              </View>
              <View className="gap-2">
                <Field
                  control={control}
                  name="nombres"
                  label="Nombre(s)"
                  autoCapitalize="words"
                  placeholder="Nombre(s) del usuario"
                  maxLength={100}
                  rules={{
                    required: "El nombre es obligatorio",
                    minLength: { value: 2, message: "Mínimo 2 caracteres" },
                    maxLength: { value: 100, message: "Máximo 100 caracteres" },
                  }}
                />
                <Field
                  control={control}
                  name="apellidos"
                  label="Apellidos"
                  autoCapitalize="words"
                  placeholder="Apellidos del usuario"
                  maxLength={100}
                  rules={{
                    required: "Los apellidos son obligatorios",
                    minLength: { value: 2, message: "Mínimo 2 caracteres" },
                    maxLength: { value: 100, message: "Máximo 100 caracteres" },
                  }}
                />
                <Field
                  control={control}
                  name="documento_identidad"
                  label="Documento"
                  keyboardType="number-pad"
                  placeholder="Número de documento"
                  maxLength={20}
                  rules={{
                    required: "El documento de identidad es obligatorio",
                    minLength: { value: 6, message: "Mínimo 6 caracteres" },
                    maxLength: { value: 20, message: "Máximo 20 caracteres" },
                  }}
                />
                <Field
                  control={control}
                  name="celular"
                  label="Celular"
                  keyboardType="phone-pad"
                  placeholder="Número de celular (10 dígitos)"
                  maxLength={13}
                  rules={{
                    required: "El celular es obligatorio",
                    minLength: { value: 10, message: "Mínimo 10 dígitos" },
                    maxLength: { value: 13, message: "Máximo 13 dígitos" },
                  }}
                />
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
                  autoComplete="new-password"
                  placeholder="Contraseña"
                  maxLength={128}
                  rules={{
                    required: "La contraseña es obligatoria",
                    minLength: { value: 8, message: "Mínimo 8 caracteres" },
                    maxLength: { value: 128, message: "Máximo 128 caracteres" },
                  }}
                />
                <Field
                  control={control}
                  name="confirmation"
                  label="Confirmar contraseña"
                  secureTextEntry
                  autoComplete="new-password"
                  placeholder="Repite tu contraseña"
                  maxLength={128}
                  rules={{
                    required: "Confirma la contraseña",
                    maxLength: { value: 128, message: "Máximo 128 caracteres" },
                    validate: (value) =>
                      value === getValues("contrasena") ||
                      "Las contraseñas no coinciden",
                  }}
                />
              </View>
              <Button
                text={formState.isSubmitting ? "Creando…" : "Regístrate"}
                onPress={handleSubmit(submit)}
                disabled={formState.isSubmitting}
              />
            </GlassCard>
          </View>
          <Text className="my-5 text-center text-sm text-zu-slate">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-bold text-zu-navy underline">
              Accede
            </Link>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </FondoGlass>
  );
};
export default RegisterScreen;
