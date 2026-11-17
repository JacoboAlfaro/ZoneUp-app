import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';

import { useAlerta } from '../components/alerta/AlertaProvider';
import {
  activarAvisos,
  estadoDelPermiso,
  registrarEsteTelefono,
  type EstadoPermiso,
} from './dispositivo';

/** En qué momento se pide el permiso. Cada uno explica para qué sirven los avisos. */
export type MotivoPermiso = 'reserva' | 'encargado';

const EXPLICACION: Record<MotivoPermiso, { titulo: string; mensaje: string }> = {
  reserva: {
    titulo: '¿Te avisamos a tiempo?',
    mensaje:
      'Te enviaremos un aviso 5 minutos antes de que venza tu tiempo para llegar y 5 minutos ' +
      'antes de que termine tu parqueo. Así no pierdes el cupo ni te pasas del tiempo.',
  },
  encargado: {
    titulo: '¿Te avisamos de las reservas nuevas?',
    mensaje:
      'Te avisaremos cuando llegue una reserva a tus zonas, para que la aceptes antes de que ' +
      'pasen 15 minutos.',
  },
};

/** Motivos por los que ya se preguntó mientras la app sigue abierta: no se insiste. */
const yaPreguntado = new Set<MotivoPermiso>();

/**
 * Pide el permiso de avisos EN CONTEXTO: primero una alerta propia que explica para qué
 * sirven y, solo si el usuario acepta, el diálogo del sistema. Así no se gasta ese diálogo
 * en frío (en Android, después de negarlo puede no volver a aparecer). Si lo niega, la app
 * sigue funcionando igual, sin avisos.
 */
export function usePermisoAvisos() {
  const alerta = useAlerta();

  /** true si al final el teléfono quedó recibiendo avisos. Nunca lanza. */
  const pedirEnContexto = useCallback(
    async (motivo: MotivoPermiso): Promise<boolean> => {
      try {
        const permiso = await estadoDelPermiso();
        if (permiso.concedido) {
          await registrarEsteTelefono();
          return true;
        }
        if (!permiso.sePuedePreguntar || yaPreguntado.has(motivo)) return false;
        yaPreguntado.add(motivo);

        const quiere = await alerta.confirmar({
          ...EXPLICACION[motivo],
          tipo: 'pregunta',
          textoConfirmar: 'Activar avisos',
          textoCancelar: 'Ahora no',
        });
        return quiere ? await activarAvisos() : false;
      } catch {
        // Sin red o sin Google Play no hay token: la app sigue sin avisos.
        return false;
      }
    },
    [alerta],
  );

  return { pedirEnContexto };
}

/**
 * Si los avisos están desactivados, para mostrarlo en pantalla y ofrecer activarlos. Se
 * revisa al enfocar la pantalla y al volver a la app (por ejemplo, desde Ajustes).
 */
export function useAvisosDesactivados() {
  const [permiso, setPermiso] = useState<EstadoPermiso | null>(null);
  // Si el usuario los activó desde Ajustes, hay que registrar el teléfono al volver.
  const concedidoAntes = useRef<boolean | null>(null);

  const revisar = useCallback(() => {
    estadoDelPermiso()
      .then((actual) => {
        if (concedidoAntes.current === false && actual.concedido) {
          registrarEsteTelefono().catch(() => undefined);
        }
        concedidoAntes.current = actual.concedido;
        setPermiso(actual);
      })
      .catch(() => setPermiso(null));
  }, []);

  useFocusEffect(revisar);

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') revisar();
    });
    return () => suscripcion.remove();
  }, [revisar]);

  /** El usuario tocó "Activar": diálogo del sistema si todavía se puede; si no, Ajustes. */
  const activar = async () => {
    if (permiso?.sePuedePreguntar) {
      await activarAvisos().catch(() => false);
      revisar();
    } else {
      await Linking.openSettings();
    }
  };

  return {
    desactivados: permiso !== null && !permiso.concedido,
    /** El sistema ya no muestra el diálogo: hay que ir a Ajustes. */
    soloDesdeAjustes: permiso !== null && !permiso.sePuedePreguntar,
    activar,
  };
}
