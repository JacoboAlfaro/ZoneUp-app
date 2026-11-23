import { FondoPantalla } from "@/src/components/glass/FondoPantalla";
import { useEditarPerfil } from "@/src/hooks/usuarios/useEditarPerfil";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import Button from "../../Button";
import Field from "../../Field";
import { GlassCard } from "../../GlassCard";
import NoSessionState from "../../NoSessionState";

const EditarPerfilScreen = function () {
  const { user, control, reglas, guardando, guardarCambios } =
    useEditarPerfil();

  if (!user) {
    return <NoSessionState />;
  }

  return (
    <FondoPantalla>
      {/* "padding" en las dos plataformas: en Android (edge-to-edge) la
          ventana no se encoge con el teclado, así que hay que dejarle espacio. */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        keyboardVerticalOffset={100}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 p-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-2">
            <Text className="text-3xl font-bold text-zu-navy">
              Editar perfil
            </Text>

            <Text className="text-zu-slate">
              Actualiza tu información personal
            </Text>
          </View>

          <GlassCard className="gap-3 p-5">
            <Field
              control={control}
              name="primer_nombre"
              label="Primer nombre"
              placeholder="Primer nombre"
              rules={reglas.primer_nombre}
            />

            <Field
              control={control}
              name="segundo_nombre"
              label="Segundo nombre"
              placeholder="Segundo nombre"
            />

            <Field
              control={control}
              name="primer_apellido"
              label="Primer apellido"
              placeholder="Primer apellido"
              rules={reglas.primer_apellido}
            />

            <Field
              control={control}
              name="segundo_apellido"
              label="Segundo apellido"
              placeholder="Segundo apellido"
            />

            <Field
              control={control}
              name="email"
              label="Correo electrónico"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              rules={reglas.email}
            />

            <Field
              control={control}
              name="celular"
              label="Celular"
              keyboardType="phone-pad"
              placeholder="Celular"
              rules={reglas.celular}
            />
          </GlassCard>

          <Button
            text={guardando ? "Guardando…" : "Guardar cambios"}
            onPress={guardarCambios}
            disabled={guardando}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </FondoPantalla>
  );
};

export default EditarPerfilScreen;
