import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useEditarPerfil } from '@/src/hooks/usuarios/useEditarPerfil';
import Button from '../../Button';
import Field from '../../Field';
import NoSessionState from '../../NoSessionState';

const EditarPerfilScreen = function() {
  const { user, control, reglas, guardando, guardarCambios } = useEditarPerfil();

  if (!user) {
    return <NoSessionState />;
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-neutral-50" behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-6"
        showsVerticalScrollIndicator={false}>

        <View className="gap-2">
          <Text className="text-3xl font-bold text-neutral-900">
            Editar perfil
          </Text>

          <Text className="text-neutral-500">
            Actualiza tu información personal
          </Text>
        </View>

        <View className="gap-3 rounded-2xl bg-white p-5">

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

        </View>

        <Button
          text={guardando ? 'Guardando…' : 'Guardar cambios'}
          onPress={guardarCambios}
          disabled={guardando}
        />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default EditarPerfilScreen;