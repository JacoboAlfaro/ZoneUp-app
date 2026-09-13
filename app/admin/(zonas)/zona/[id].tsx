import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { deleteZona, getZona, updateZona } from '../../../../src/api/zonas';
import Button from '../../../../src/components/Button';
import Field from '../../../../src/components/Field';
import type { ZonaAzul } from '../../../../src/types';

/** Los datos que captura este formulario. Todo entra como texto y se convierte al guardar. */
type ZonaForm = {
  indicaciones: string;
  latitud: string;
  longitud: string;
  capacidad: string;
  capacidad_total: string;
};

function aNumero(value: string): number {
  return Number(value.replace(',', '.').trim());
}

function aEntero(value: string): number {
  return Number.parseInt(value.trim(), 10);
}

function zonaAForm(zona: ZonaAzul): ZonaForm {
  return {
    indicaciones: zona.indicaciones ?? '',
    latitud: String(zona.latitud),
    longitud: String(zona.longitud),
    capacidad: String(zona.capacidad),
    capacidad_total: String(zona.capacidad_total),
  };
}

export default function AdminZonaDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [zona, setZona] = useState<ZonaAzul | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [cargaError, setCargaError] = useState<string | null>(null);

  const { control, getValues, handleSubmit, reset, setError, formState } = useForm<ZonaForm>({
    defaultValues: {
      indicaciones: '',
      latitud: '',
      longitud: '',
      capacidad: '',
      capacidad_total: '',
    },
  });

  const idNumerico = id ? Number(id) : NaN;

  useEffect(() => {
    if (!Number.isInteger(idNumerico)) {
      setCargaError('Identificador de zona inválido.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setCargaError(null);
    getZona(idNumerico)
      .then((data) => {
        setZona(data);
        reset(zonaAForm(data));
      })
      .catch((cause) => setCargaError((cause as Error).message))
      .finally(() => setLoading(false));
  }, [id, idNumerico, reset]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: zona ? `Zona #${zona.id}` : 'Detalle de la zona' });
  }, [navigation, zona]);

  const guardar = async (form: ZonaForm) => {
    if (!zona || formState.isSubmitting) return;
    const capacidad = aEntero(form.capacidad);
    const capacidad_total = aEntero(form.capacidad_total);

    if (capacidad > capacidad_total) {
      setError('capacidad', {
        message: 'Los cupos disponibles no pueden superar la capacidad total',
      });
      return;
    }

    try {
      const actualizada = await updateZona(zona.id, {
        indicaciones: form.indicaciones.trim(),
        latitud: aNumero(form.latitud),
        longitud: aNumero(form.longitud),
        capacidad,
        capacidad_total,
      });
      setZona(actualizada);
      reset(zonaAForm(actualizada));
      Alert.alert('Zona actualizada', 'Los cambios fueron guardados correctamente.');
    } catch (cause) {
      setError('root', { message: (cause as Error).message });
    }
  };

  const eliminar = () => {
    if (!zona || deleting) return;

    Alert.alert(
      'Eliminar zona',
      `La zona #${zona.id} se eliminará de forma permanente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteZona(zona.id);
              Alert.alert('Zona eliminada', 'La zona fue eliminada correctamente.', [
                { text: 'Aceptar', onPress: () => router.back() },
              ]);
            } catch (cause) {
              setError('root', { message: (cause as Error).message });
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#EEF8FC',
        }}
        edges={['bottom']}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </SafeAreaView>
    );
  }

  if (!zona) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#EEF8FC', paddingHorizontal: 20, paddingTop: 20 }}
        edges={['bottom']}>
        <Text className="text-base text-red-700">
          {cargaError ?? formState.errors.root?.message ?? 'No se encontró la zona.'}
        </Text>
      </SafeAreaView>
    );
  }

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
          <View className="rounded-2xl border border-zu-white/70 bg-zu-white/90 p-5 shadow-sm">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
              Zona
            </Text>
            <Text className="mt-1 text-lg font-bold text-zu-navy">#{zona.id}</Text>
            <Text className="mt-1 text-sm text-zu-slate">
              Cupos: {zona.capacidad}/{zona.capacidad_total} disponibles / total · (
              {zona.latitud}, {zona.longitud})
            </Text>
          </View>

          <Field
            control={control}
            name="indicaciones"
            label="Indicaciones"
            placeholder="Dirección, barrio y cómo llegar (puedes usar varias líneas)"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            autoCapitalize="sentences"
            className="min-h-[140px] py-3"
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

          {formState.errors.root ? (
            <Text className="rounded-xl bg-red-50 p-3 text-center text-red-700">
              {formState.errors.root.message}
            </Text>
          ) : null}

          {cargaError ? (
            <Text className="rounded-xl bg-red-50 p-3 text-center text-red-700">{cargaError}</Text>
          ) : null}

          <Button
            text={formState.isSubmitting ? 'Guardando…' : 'Guardar cambios'}
            onPress={handleSubmit(guardar)}
            disabled={formState.isSubmitting || deleting}
            className="mt-2 bg-zu-navy"
          />

          <Button
            text={deleting ? 'Eliminando…' : 'Eliminar zona'}
            onPress={eliminar}
            disabled={formState.isSubmitting || deleting}
            secondary
            className="border-red-400 bg-red-300/60"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
