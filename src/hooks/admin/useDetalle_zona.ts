import { ApiError, deleteZona, getZona, updateZona } from '@/src/api';
import { useAlerta } from '@/src/components/alerta/AlertaProvider';
import { ZonaAzul } from '@/src/types';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react'
import { useForm } from 'react-hook-form';

/** Los datos que captura este formulario. Todo entra como texto y se convierte al guardar. */
type ZonaForm = {
    indicaciones: string;
    latitud: string;
    longitud: string;
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
      capacidad_total: String(zona.capacidad_total),
    };
  }

export function useDetalle_zona() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const alerta = useAlerta();
  const [zona, setZona] = useState<ZonaAzul | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [cargaError, setCargaError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState } = useForm<ZonaForm>({
    defaultValues: {
      indicaciones: '',
      latitud: '',
      longitud: '',
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

    // Solo la capacidad total: los cupos disponibles los calcula el servidor.
    try {
      const actualizada = await updateZona(zona.id, {
        indicaciones: form.indicaciones.trim(),
        latitud: aNumero(form.latitud),
        longitud: aNumero(form.longitud),
        capacidad_total: aEntero(form.capacidad_total),
      });
      setZona(actualizada);
      reset(zonaAForm(actualizada));
      void alerta.mostrar({
        tipo: 'exito',
        titulo: 'Zona actualizada',
        mensaje: 'Los cambios fueron guardados correctamente.',
      });
    } catch (cause) {
      const conflicto = cause instanceof ApiError && cause.status === 409;
      void alerta.mostrar({
        tipo: conflicto ? 'advertencia' : 'error',
        titulo: 'No se pudo guardar la zona',
        mensaje: (cause as Error).message,
      });
    }
  };

  const eliminar = async () => {
    if (!zona || deleting) return;

    const confirmado = await alerta.confirmar({
      titulo: 'Eliminar zona',
      mensaje: `La zona #${zona.id} se eliminará de forma permanente.`,
      textoConfirmar: 'Eliminar',
      destructiva: true,
    });
    if (!confirmado) return;

    setDeleting(true);
    try {
      await deleteZona(zona.id);
      await alerta.mostrar({
        tipo: 'exito',
        titulo: 'Zona eliminada',
        mensaje: 'La zona fue eliminada correctamente.',
      });
      router.back();
    } catch (cause) {
      void alerta.mostrar({
        tipo: 'error',
        titulo: 'No se pudo eliminar la zona',
        mensaje: (cause as Error).message,
      });
      setDeleting(false);
    }
  };
    return { zona, control, handleSubmit, formState, loading, deleting, cargaError, guardar, eliminar, aNumero, aEntero }
}
