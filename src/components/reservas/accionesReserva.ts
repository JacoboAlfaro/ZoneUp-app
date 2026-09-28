/**
 * Acciones del encargado sobre una reserva: pedir confirmación, llamar a la
 * API y avisar el resultado. Las usan el listado y el detalle para que los
 * textos y el comportamiento sean los mismos en ambos.
 */

import { Alert } from 'react-native';

import { aceptarReserva, cancelarReserva, confirmarLlegada } from '../../api/reservas';
import type { Reserva } from '../../types';

export type AccionReserva = 'aceptar' | 'rechazar' | 'confirmar_llegada' | 'cancelar';

interface Textos {
  titulo: string;
  pregunta: (placa: string) => string;
  boton: string;
  destructiva: boolean;
  exito: string;
  detalleExito: (placa: string) => string;
}

const textos: Record<AccionReserva, Textos> = {
  aceptar: {
    titulo: 'Aceptar reserva',
    pregunta: (placa) =>
      `La reserva de la placa ${placa} quedará activa y el cupo seguirá apartado para el conductor.`,
    boton: 'Aceptar',
    destructiva: false,
    exito: 'Reserva aceptada',
    detalleExito: (placa) => `Cuando llegue el vehículo, verifica que su placa sea ${placa}.`,
  },
  rechazar: {
    titulo: 'Rechazar reserva',
    pregunta: (placa) =>
      `La solicitud de la placa ${placa} se cancelará y el cupo quedará libre.`,
    boton: 'Rechazar',
    destructiva: true,
    exito: 'Reserva rechazada',
    detalleExito: () => 'La solicitud quedó cancelada y el cupo se liberó.',
  },
  confirmar_llegada: {
    titulo: 'Confirmar llegada',
    pregunta: (placa) =>
      `Confirmas que el vehículo frente a ti tiene la placa ${placa}. La reserva quedará completada.`,
    boton: 'Confirmar',
    destructiva: false,
    exito: 'Llegada confirmada',
    detalleExito: (placa) => `La reserva de la placa ${placa} quedó completada.`,
  },
  cancelar: {
    titulo: 'Cancelar reserva',
    pregunta: (placa) =>
      `La reserva de la placa ${placa} se cancelará y el cupo quedará libre.`,
    boton: 'Cancelar reserva',
    destructiva: true,
    exito: 'Reserva cancelada',
    detalleExito: () => 'La reserva quedó cancelada y el cupo se liberó.',
  },
};

const llamadas: Record<AccionReserva, (reserva: Reserva) => Promise<Reserva>> = {
  aceptar: (reserva) => aceptarReserva(reserva.id),
  rechazar: (reserva) => cancelarReserva(reserva.id),
  confirmar_llegada: (reserva) => confirmarLlegada(reserva),
  cancelar: (reserva) => cancelarReserva(reserva.id),
};

/**
 * Pide confirmación y, si el encargado acepta, cambia el estado de la reserva
 * y avisa el resultado. Devuelve la reserva actualizada, o null si se echó
 * para atrás. Los errores del servidor se lanzan para que la pantalla los muestre.
 */
export function ejecutarAccionReserva(
  accion: AccionReserva,
  reserva: Reserva,
): Promise<Reserva | null> {
  const texto = textos[accion];
  const placa = reserva.id_vehiculo ?? 'sin registrar';

  return new Promise((resolve, reject) => {
    Alert.alert(
      texto.titulo,
      texto.pregunta(placa),
      [
        { text: 'Volver', style: 'cancel', onPress: () => resolve(null) },
        {
          text: texto.boton,
          style: texto.destructiva ? 'destructive' : 'default',
          onPress: () => {
            llamadas[accion](reserva).then((actualizada) => {
              Alert.alert(texto.exito, texto.detalleExito(placa));
              resolve(actualizada);
            }, reject);
          },
        },
      ],
      // En Android, tocar fuera del diálogo equivale a "Volver".
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}
