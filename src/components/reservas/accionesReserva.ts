/**
 * Acciones del encargado sobre una reserva: pedir confirmación, llamar a la
 * API y avisar el resultado. Las usan el listado y el detalle para que los
 * textos y el comportamiento sean los mismos en ambos.
 */

import {
  aceptarReserva,
  CARGO_RESERVA,
  cancelarReserva,
  confirmarLlegada,
  llego,
} from '../../api/reservas';
import { formatPesos } from '../../formato';
import type { Reserva } from '../../types';
import type { Alertas } from '../alerta/AlertaProvider';

export type AccionReserva = 'aceptar' | 'rechazar' | 'confirmar_llegada' | 'cancelar';

interface Textos {
  titulo: string;
  pregunta: (placa: string, reserva: Reserva) => string;
  boton: string;
  destructiva: boolean;
  exito: string;
  detalleExito: (placa: string) => string;
}

/** Lo que se cobra si se cancela antes de que el vehículo llegue. */
const SOLO_CARGO = `Se cobra solo el cargo de reserva (${formatPesos(CARGO_RESERVA)}).`;

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
      `La solicitud de la placa ${placa} se cancelará y el cupo quedará libre. ${SOLO_CARGO}`,
    boton: 'Rechazar',
    destructiva: true,
    exito: 'Reserva rechazada',
    detalleExito: () => 'La solicitud quedó cancelada y el cupo se liberó.',
  },
  confirmar_llegada: {
    titulo: 'Confirmar llegada',
    pregunta: (placa) =>
      `Confirmas que el vehículo frente a ti tiene la placa ${placa}. La reserva seguirá activa hasta su hora de fin.`,
    boton: 'Confirmar',
    destructiva: false,
    exito: 'Llegada confirmada',
    detalleExito: (placa) => `La llegada de la placa ${placa} quedó registrada.`,
  },
  cancelar: {
    titulo: 'Cancelar reserva',
    pregunta: (placa, reserva) =>
      `La reserva de la placa ${placa} se cancelará y el cupo quedará libre.` +
      (llego(reserva) ? '' : ` ${SOLO_CARGO}`),
    boton: 'Cancelar reserva',
    destructiva: true,
    exito: 'Reserva cancelada',
    detalleExito: () => 'La reserva quedó cancelada y el cupo se liberó.',
  },
};

const llamadas: Record<AccionReserva, (reserva: Reserva) => Promise<Reserva>> = {
  aceptar: (reserva) => aceptarReserva(reserva.id),
  rechazar: (reserva) => cancelarReserva(reserva.id),
  confirmar_llegada: (reserva) => confirmarLlegada(reserva.id),
  cancelar: (reserva) => cancelarReserva(reserva.id),
};

/**
 * Pide confirmación y, si el encargado acepta, cambia el estado de la reserva
 * y avisa el resultado. Devuelve la reserva actualizada, o null si se echó
 * para atrás. Los errores del servidor se lanzan para que la pantalla los muestre.
 *
 * @param alerta Las alertas de la app, de `useAlerta()` en el hook que la llama.
 */
export async function ejecutarAccionReserva(
  accion: AccionReserva,
  reserva: Reserva,
  alerta: Alertas,
): Promise<Reserva | null> {
  const texto = textos[accion];
  const placa = reserva.id_vehiculo ?? 'sin registrar';

  // Tocar fuera de la alerta o el botón atrás de Android equivale a "Volver".
  const confirmado = await alerta.confirmar({
    titulo: texto.titulo,
    mensaje: texto.pregunta(placa, reserva),
    textoConfirmar: texto.boton,
    textoCancelar: 'Volver',
    destructiva: texto.destructiva,
  });
  if (!confirmado) return null;

  const actualizada = await llamadas[accion](reserva);
  void alerta.mostrar({ tipo: 'exito', titulo: texto.exito, mensaje: texto.detalleExito(placa) });
  return actualizada;
}
