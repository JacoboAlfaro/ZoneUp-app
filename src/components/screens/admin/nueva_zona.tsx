import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../Button';
import Field from '../../Field';
import FormError from '../../FormError';
import { useNuevo_zona } from '@/src/hooks/admin/useNuevo_zona';

const NuevaZonaScreen = () => {
  
  const { control, getValues, handleSubmit, formState, guardar, aNumero, aEntero } = useNuevo_zona();
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
            Dirección, barrio y cómo llegar. La primera línea se usa como título en el
            listado.
          </Text>

          <Field
            control={control}
            name="indicaciones"
            label="Indicaciones"
            placeholder="Dirección, barrio y cómo llegar (puedes usar varias líneas)"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            autoCapitalize="sentences"
            className="min-h-35 py-3"
            rules={{
              required: 'Las indicaciones son obligatorias',
              minLength: { value: 8, message: 'Escribe al menos 8 caracteres' },
            }}
          />
          <Field
            control={control}
            name="latitud"
            label="Latitud"
            placeholder="5.0704"
            keyboardType="decimal-pad"
            autoCorrect={false}
            rules={{
              required: 'La latitud es obligatoria',
              validate: (value) => {
                const numero = aNumero(value);
                if (!Number.isFinite(numero)) return 'Latitud inválida';
                if (numero < -90 || numero > 90) return 'Debe estar entre -90 y 90';
                return true;
              },
            }}
          />
          <Field
            control={control}
            name="longitud"
            label="Longitud"
            placeholder="-75.5178"
            keyboardType="decimal-pad"
            autoCorrect={false}
            rules={{
              required: 'La longitud es obligatoria',
              validate: (value) => {
                const numero = aNumero(value);
                if (!Number.isFinite(numero)) return 'Longitud inválida';
                if (numero < -180 || numero > 180) return 'Debe estar entre -180 y 180';
                return true;
              },
            }}
          />
          <Field
            control={control}
            name="capacidad"
            label="Cupos disponibles"
            placeholder="0"
            keyboardType="number-pad"
            maxLength={6}
            rules={{
              required: 'Los cupos disponibles son obligatorios',
              validate: (value) => {
                const numero = aEntero(value);
                if (!Number.isInteger(numero)) return 'Debe ser un número entero';
                if (numero < 0) return 'No puede ser negativo';
                const total = aEntero(getValues('capacidad_total'));
                if (Number.isInteger(total) && numero > total)
                  return 'No puede superar la capacidad total';
                return true;
              },
            }}
          />
          <Field
            control={control}
            name="capacidad_total"
            label="Capacidad total"
            placeholder="10"
            keyboardType="number-pad"
            maxLength={6}
            rules={{
              required: 'La capacidad total es obligatoria',
              validate: (value) => {
                const numero = aEntero(value);
                if (!Number.isInteger(numero)) return 'Debe ser un número entero';
                if (numero < 1) return 'Debe ser al menos 1';
                return true;
              },
            }}
          />

          <FormError message={formState.errors.root?.message} />

          <Button
            text={formState.isSubmitting ? 'Guardando…' : 'Crear zona'}
            onPress={handleSubmit(guardar)}
            disabled={formState.isSubmitting}
            className="mt-2 bg-zu-navy"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default NuevaZonaScreen