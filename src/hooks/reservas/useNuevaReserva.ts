import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useForm, type RegisterOptions } from 'react-hook-form';

import { ApiError } from '@/src/api/client';
import {
  createReserva,
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
 * los vehículos del conductor y sus reservas en curso (una por vehículo como
 * máximo); maneja el formulario (vehículo y horas) y crea la reserva. El
 * servidor revisa el cupo y el vehículo en el mismo momento de reservar.
 */
export function useNuevaReserva() {
  const { idZona } = useLocalSearchParams<{ idZona: string }>();
  const { user } = useSession();
  const alerta = useAlerta();
  const [zona, setZona] = useState<ZonaAzul | null>(null);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  /** Reserva en curso de cada vehículo (por placa). Esos vehículos no pueden reservar. */
  const [ocupados, setOcupados] = useState<Map<string, Reserva>>(() => new Map());
  // Cambiarlo vuelve a cargar todo (p. ej. después de que el servidor rechazó la reserva).
  const [recargas, setRecargas] = useState(0);
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
        // Solo las que ocupan un cupo ahora: hay como máximo una por vehículo.
        listReservasConductor(user.id, { enCurso: true, limit: 50 }),
      ])
        .then(([zonaActual, misVehiculos, enCurso]) => {
          if (!active) return;
          zonaCargada.current = true;
          setZona(zonaActual);
          setVehiculos(misVehiculos);
          const porPlaca = new Map<string, Reserva>();
          for (const { reserva } of enCurso.items) {
            if (reserva.id_vehiculo) porPlaca.set(reserva.id_vehiculo, reserva);
          }
          setOcupados(porPlaca);

          // Deja elegido el primer vehículo libre si el seleccionado no sirve.
          const placaActual = getValues('placa');
          const libres = misVehiculos.filter((vehiculo) => !porPlaca.has(vehiculo.placa));
          if (!libres.some((vehiculo) => vehiculo.placa === placaActual)) {
            setValue('placa', libres[0]?.placa ?? '');
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
    }, [user, idNumerico, getValues, setValue, alerta, recargas]),
  );

  const horas = horasValidas(watch('horas'));

  const titulo = tituloZona(zona?.indicaciones, zona?.id ?? null);
  const extra = detalleZona(zona?.indicaciones);
  const sinCupo = zona !== null && zona.capacidad <= 0;
  // Fin estimado: el servidor lo calcula igual, desde el momento de reservar.
  const finEstimado = horas ? new Date(Date.now() + horas * MS_POR_HORA) : null;
  const todosOcupados =
    vehiculos.length > 0 && vehiculos.every((vehiculo) => ocupados.has(vehiculo.placa));
  /** La reserva que se muestra cuando todos los vehículos están ocupados. */
  const reservaEnCurso = todosOcupados ? (ocupados.values().next().value ?? null) : null;

  const elegirHoras = (opcion: number) =>
    setValue('horas', String(opcion), { shouldValidate: true });

  const guardar = async (form: NuevaReservaForm) => {
    if (!user || !zona) return;

    const horasReserva = horasValidas(form.horas);
    if (!horasReserva) return;

    try {
      const reserva = await createReserva({
        id_zona: zona.id,
        id_vehiculo: form.placa,
        horas: horasReserva,
      });

      await alerta.mostrar({
        tipo: 'exito',
        titulo: 'Reserva creada',
        mensaje: `Tu solicitud en ${titulo} quedó pendiente de aprobación. Tienes ${MINUTOS_PARA_LLEGAR} minutos para llegar a la zona.`,
        textoBoton: 'Ver reserva',
      });
      router.replace({
        pathname: '/conductor/(panel)/(reservas)/reserva/[id]',
        params: { id: String(reserva.id) },
      });
    } catch (cause) {
      const codigo = cause instanceof ApiError ? cause.codigo : undefined;
      if (codigo === 'ZONA_SIN_CUPO') {
        void alerta.mostrar({
          tipo: 'advertencia',
          titulo: 'La zona se quedó sin cupos',
          mensaje: 'Alguien tomó el último cupo antes que tú. Elige otra zona.',
        });
        setRecargas((n) => n + 1);
      } else if (codigo === 'VEHICULO_CON_RESERVA') {
        void alerta.mostrar({
          tipo: 'advertencia',
          titulo: 'El vehículo ya tiene una reserva',
          mensaje: (cause as Error).message,
        });
        setRecargas((n) => n + 1);
      } else {
        void alerta.mostrar({
          tipo: 'error',
          titulo: 'No se pudo crear la reserva',
          mensaje: (cause as Error).message,
        });
      }
    }
  };

  return {
    user,
    zona,
    vehiculos,
    ocupados,
    todosOcupados,
    reservaEnCurso,
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
