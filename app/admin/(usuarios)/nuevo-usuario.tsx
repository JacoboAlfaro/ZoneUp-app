import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toRegisterDto } from '../../../src/api/auth';
import { createUser } from '../../../src/api/users';
import Button from '../../../src/components/Button';
import Field from '../../../src/components/Field';
import Select from '../../../src/components/Select';
import type { Register } from '../../../src/types';

type CreateUserForm = Register & { confirmation: string };

const tipos = ['conductor', 'controlador'] as const;
const estados = ['activo', 'no_verificado', 'inactivo'] as const;

export default function NuevoUsuario() {
  const { control, getValues, handleSubmit, setError, formState } = useForm<CreateUserForm>({
    defaultValues: {
      documento_identidad: '',
      nombres: '',
      apellidos: '',
      email: '',
      contrasena: '',
      celular: '',
      tipo_usuario: 'conductor',
      estado: 'inactivo',
      confirmation: '',
    },
  });

  const guardar = async ({ confirmation: _, ...form }: CreateUserForm) => {
    try {
      await createUser(toRegisterDto(form));
      Alert.alert('Usuario creado', 'El usuario fue registrado correctamente.', [
        { text: 'Aceptar', onPress: () => router.back() },
      ]);
    } catch (cause) {
      setError('root', { message: (cause as Error).message });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EEF8FC' }} edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 px-5 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text className="mb-1 text-sm leading-5 text-zu-slate">
            Registra un conductor o controlador desde el panel administrativo.
          </Text>

          <Field
            control={control}
            name="documento_identidad"
            label="Documento de identidad"
            placeholder="Ej. 1234567890"
            keyboardType="number-pad"
            maxLength={20}
            rules={{ required: 'El documento es obligatorio' }}
          />
          <Field
            control={control}
            name="nombres"
            label="Nombres"
            placeholder="Todos los nombres"
            autoCapitalize="words"
            rules={{ required: 'Los nombres son obligatorios' }}
          />
          <Field
            control={control}
            name="apellidos"
            label="Apellidos"
            placeholder="Todos los apellidos"
            autoCapitalize="words"
            rules={{ required: 'Los apellidos son obligatorios' }}
          />
          <Field
            control={control}
            name="email"
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoComplete="email"
            rules={{
              required: 'El correo es obligatorio',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
            }}
          />
          <Field
            control={control}
            name="celular"
            label="Celular"
            placeholder="10 a 13 dígitos"
            keyboardType="phone-pad"
            maxLength={13}
            rules={{
              required: 'El celular es obligatorio',
              pattern: { value: /^\d{10,13}$/, message: 'Debe tener entre 10 y 13 dígitos' },
            }}
          />
          <Field
            control={control}
            name="contrasena"
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            secureTextEntry
            autoComplete="new-password"
            rules={{
              required: 'La contraseña es obligatoria',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            }}
          />
          <Field
            control={control}
            name="confirmation"
            label="Confirmar contraseña"
            placeholder="Repite la contraseña"
            secureTextEntry
            autoComplete="new-password"
            rules={{
              required: 'Confirma la contraseña',
              validate: (value) =>
                value === getValues('contrasena') || 'Las contraseñas no coinciden',
            }}
          />

          <Select control={control} name="tipo_usuario" label="Tipo de usuario" options={tipos} />
          <Select control={control} name="estado" label="Estado inicial" options={estados} />

          {formState.errors.root ? (
            <Text className="rounded-xl bg-red-50 p-3 text-center text-red-700">
              {formState.errors.root.message}
            </Text>
          ) : null}

          <Button
            text={formState.isSubmitting ? 'Guardando…' : 'Guardar usuario'}
            onPress={handleSubmit(guardar)}
            disabled={formState.isSubmitting}
            className="mt-2 bg-zu-navy"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
