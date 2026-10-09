import { deleteZona, getZona, updateZona } from '@/src/api';
import { ZonaAzul } from '@/src/types';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';

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

export function useDetalle_zona() {
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
    return { zona, control, getValues, handleSubmit, formState, loading, deleting, cargaError, guardar, eliminar, aNumero, aEntero }
}
