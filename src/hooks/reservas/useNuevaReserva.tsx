import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useForm, type RegisterOptions } from 'react-hook-form';

import {
  createReserva,
  estaEnCamino,
  HORAS_MAX,
  HORAS_MIN,
  listReservasConductor,
  MINUTOS_PARA_LLEGAR,
} from '@/src/api/reservas';
import { getVehiculos } from '@/src/api/vehiculos';
import { getZona } from '@/src/api/zonas';
import { useAlerta } from '@/src/components/alerta/AlertaProvider';
import { detalleZona, tituloZona } from '@/src/formato';
import { useSession } from '@/src/session/context';
import type { Reserva, Vehiculo, ZonaAzul } from '@/src/types';

/** Los datos que captura este formulario. Las horas entran como texto y se convierten al guardar. */
export type NuevaReservaForm = {
  placa: string;
  horas: string;
};

const MS_POR_HORA = 60 * 60 * 1000;

/** Horas enteras dentro del rango permitido, o null si el texto no sirve. */
function horasValidas(value: string): number | null {
  const numero = Number(value.trim());
  return Number.isInteger(numero) && numero >= HORAS_MIN && numero <= HORAS_MAX ? numero : null;
}

/** Validaciones de cada campo. El formulario muestra el mensaje debajo del campo. */
const reglas: Record<keyof NuevaReservaForm, RegisterOptions<NuevaReservaForm>> = {
  placa: { required: 'Elige el vehículo con el que vas a parquear' },
  horas: {
    required: 'Escribe cuántas horas vas a parquear',
    validate: (value) =>
      horasValidas(value) !== null || `Deben ser horas enteras entre ${HORAS_MIN} y ${HORAS_MAX}`,
  },
};

/**
 * Lógica de la pantalla "Nueva reserva": lee la zona de la ruta, carga la zona,
 * los vehículos del conductor y si ya tiene una reserva en curso; maneja el
 * formulario (vehículo y horas) y crea la reserva tras confirmar que la zona
 * sigue con cupo.
 */
export function useNuevaReserva() {
  const { idZona } = useLocalSearchParams<{ idZona: string }>();
  const { user } = useSession();
  const alerta = useAlerta();
  const [zona, setZona] = useState<ZonaAzul | null>(null);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [enCamino, setEnCamino] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);
  const [cargaError, setCargaError] = useState<string | null>(null);
  // Si la zona ya se mostró, un error al recargar no se vería en pantalla: se avisa con una alerta.
  const zonaCargada = useRef(false);

  const { control, getValues, handleSubmit, setValue, watch, formState } =
    useForm<NuevaReservaForm>({
      defaultValues: { placa: '', horas: '1' },
    });

  const idNumerico = idZona ? Number(idZona) : NaN;

  // Al volver de registrar un vehículo hay que ver la lista nueva: se recarga al enfocar.
  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setLoading(false);
        return;
      }
      if (!Number.isInteger(idNumerico)) {
        setCargaError('Identificador de zona inválido.');
        setLoading(false);
        return;
      }

      let active = true;
      setLoading(true);
      setCargaError(null);

      Promise.all([
        getZona(idNumerico),
        getVehiculos(user.documento_identidad),
        listReservasConductor(user.id),
      ])
        .then(([zonaActual, misVehiculos, misReservas]) => {
          if (!active) return;
          zonaCargada.current = true;
          setZona(zonaActual);
          setVehiculos(misVehiculos);
          setEnCamino(misReservas.find((reserva) => estaEnCamino(reserva)) ?? null);

          // Deja elegido el primer vehículo si no hay uno válido seleccionado.
          const placaActual = getValues('placa');
          if (!misVehiculos.some((vehiculo) => vehiculo.placa === placaActual)) {
            setValue('placa', misVehiculos[0]?.placa ?? '');
          }
        })
        .catch((cause) => {
          if (!active) return;
          const mensaje = (cause as Error).message;
          setCargaError(mensaje);
          if (zonaCargada.current) {
            void alerta.mostrar({
              tipo: 'error',
              titulo: 'No se pudo actualizar la zona',
              mensaje,
            });
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [user, idNumerico, getValues, setValue, alerta]),
  );

  const horas = horasValidas(watch('horas'));

  const titulo = tituloZona(zona?.indicaciones, zona?.id ?? null);
  const extra = detalleZona(zona?.indicaciones);
  const sinCupo = zona !== null && zona.capacidad <= 0;
  const finEstimado = horas ? new Date(Date.now() + horas * MS_POR_HORA) : null;

  const elegirHoras = (opcion: number) =>
    setValue('horas', String(opcion), { shouldValidate: true });

  const guardar = async (form: NuevaReservaForm) => {
    if (!user || !zona) return;

    const horasReserva = horasValidas(form.horas);
    if (!horasReserva) return;

    try {
      // El servidor no revisa cupos al crear: se confirma que sigan libres justo antes.
      const zonaActual = await getZona(zona.id);
      setZona(zonaActual);
      if (zonaActual.capacidad <= 0) {
        void alerta.mostrar({
          tipo: 'advertencia',
          titulo: 'La zona se quedó sin cupos',
          mensaje: 'Alguien tomó el último cupo antes que tú. Elige otra zona.',
        });
        return;
      }

      const reserva = await createReserva({
        id_conductor: user.id,
        id_zona: zona.id,
        id_vehiculo: form.placa,
        fecha_fin: new Date(Date.now() + horasReserva * MS_POR_HORA).toISOString(),
      });

      await alerta.mostrar({
        tipo: 'exito',
        titulo: 'Reserva creada',
        mensaje: `Tu solicitud en ${titulo} quedó pendiente de aprobación. Tienes ${MINUTOS_PARA_LLEGAR} minutos para llegar a la zona.`,
        textoBoton: 'Ver reserva',
      });
      router.replace({
        pathname: '/conductor/(reservas)/reserva/[id]',
        params: { id: String(reserva.id) },
      });
    } catch (cause) {
      void alerta.mostrar({
        tipo: 'error',
        titulo: 'No se pudo crear la reserva',
        mensaje: (cause as Error).message,
      });
    }
  };

  return {
    user,
    zona,
    vehiculos,
    enCamino,
    loading,
    cargaError,
    control,
    reglas,
    horas,
    elegirHoras,
    titulo,
    extra,
    sinCupo,
    finEstimado,
    reservando: formState.isSubmitting,
    reservar: handleSubmit(guardar),
  };
}
