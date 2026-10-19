/**
 * Alertas emergentes de ZoneUp: reemplazo de `Alert.alert` con el estilo de la app.
 *
 * `AlertaProvider` envuelve la app una sola vez (en el layout raíz) y dibuja la
 * alerta por encima de todas las pantallas. Cualquier pantalla o hook la abre
 * con `useAlerta()`:
 *
 *   const alerta = useAlerta();
 *   void alerta.mostrar({ tipo: 'error', titulo: 'No se pudo guardar', mensaje });
 *   if (await alerta.confirmar({ titulo: 'Eliminar zona', destructiva: true })) { ... }
 *
 * Las dos funciones devuelven una promesa que se resuelve al cerrar la alerta,
 * así que "hacer algo después de Aceptar" es simplemente `await`. Si se piden
 * varias alertas a la vez se muestran una detrás de otra.
 *
 * Se dibuja como una capa encima de la app y no con `<Modal>`: así no hay
 * problemas al abrir una alerta justo después de cerrar otra, y también
 * funciona en web, donde `Alert.alert` no muestra nada.
 */

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  Animated,
  BackHandler,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import Alerta, { type BotonAlerta, type TipoAlerta } from './Alerta';

export interface OpcionesAlerta {
  /** Define el ícono y el color. Por defecto 'info'. */
  tipo?: TipoAlerta;
  titulo: string;
  mensaje?: string;
  /** Por defecto "Aceptar". */
  textoBoton?: string;
}

export interface OpcionesConfirmacion {
  titulo: string;
  mensaje?: string;
  /** Por defecto "Confirmar". */
  textoConfirmar?: string;
  /** Por defecto "Cancelar". */
  textoCancelar?: string;
  /** Pinta el botón de confirmar en rojo, para acciones que no se pueden deshacer. */
  destructiva?: boolean;
  /** Por defecto 'advertencia' si es destructiva, si no 'pregunta'. */
  tipo?: TipoAlerta;
}

export interface Alertas {
  /** Muestra un aviso con un solo botón. Se resuelve cuando el usuario lo cierra. */
  mostrar: (opciones: OpcionesAlerta) => Promise<void>;
  /**
   * Pide confirmación. Se resuelve en `true` si el usuario confirma y en `false`
   * si cancela, toca fuera de la alerta o usa el botón atrás de Android.
   */
  confirmar: (opciones: OpcionesConfirmacion) => Promise<boolean>;
}

interface Pendiente {
  tipo: TipoAlerta;
  titulo: string;
  mensaje?: string;
  /** Solo en confirmaciones: el botón que acepta la acción. */
  confirmar?: { texto: string; destructiva: boolean };
  /** Texto del botón que cierra sin confirmar ("Aceptar" o "Cancelar"). */
  textoCerrar: string;
  resolver: (confirmado: boolean) => void;
}

const AlertaContext = createContext<Alertas | null>(null);

/** Atajo para abrir alertas desde cualquier pantalla o hook. */
export function useAlerta(): Alertas {
  const value = use(AlertaContext);
  if (!value) throw new Error('useAlerta debe usarse dentro de <AlertaProvider />');
  return value;
}

// En web no existe el driver nativo de animaciones y React Native avisa por consola.
const useNativeDriver = Platform.OS !== 'web';

export function AlertaProvider({ children }: PropsWithChildren) {
  const [cola, setCola] = useState<Pendiente[]>([]);
  const actual = cola[0] ?? null;
  const progreso = useRef(new Animated.Value(0)).current;
  // Evita que un doble toque cierre la alerta dos veces mientras se anima la salida.
  const cerrando = useRef(false);

  const alertas = useMemo<Alertas>(
    () => ({
      mostrar: ({ tipo = 'info', titulo, mensaje, textoBoton = 'Aceptar' }) =>
        new Promise<void>((resolve) =>
          setCola((actuales) => [
            ...actuales,
            { tipo, titulo, mensaje, textoCerrar: textoBoton, resolver: () => resolve() },
          ]),
        ),
      confirmar: ({
        titulo,
        mensaje,
        textoConfirmar = 'Confirmar',
        textoCancelar = 'Cancelar',
        destructiva = false,
        tipo = destructiva ? 'advertencia' : 'pregunta',
      }) =>
        new Promise<boolean>((resolve) =>
          setCola((actuales) => [
            ...actuales,
            {
              tipo,
              titulo,
              mensaje,
              confirmar: { texto: textoConfirmar, destructiva },
              textoCerrar: textoCancelar,
              resolver: resolve,
            },
          ]),
        ),
    }),
    [],
  );

  // Entrada: cada vez que aparece una alerta nueva al frente de la cola.
  useEffect(() => {
    if (!actual) return;
    cerrando.current = false;
    Keyboard.dismiss();
    progreso.setValue(0);
    Animated.spring(progreso, {
      toValue: 1,
      damping: 16,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver,
    }).start();
  }, [actual, progreso]);

  const cerrar = useCallback(
    (confirmado: boolean) => {
      if (!actual || cerrando.current) return;
      cerrando.current = true;
      Animated.timing(progreso, { toValue: 0, duration: 140, useNativeDriver }).start(() => {
        setCola((actuales) => actuales.slice(1));
        actual.resolver(confirmado);
      });
    },
    [actual, progreso],
  );

  // En Android, el botón atrás cierra la alerta en vez de salir de la pantalla.
  useEffect(() => {
    if (!actual) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      cerrar(false);
      return true;
    });
    return () => subscription.remove();
  }, [actual, cerrar]);

  const botones: BotonAlerta[] = [];
  if (actual?.confirmar) {
    botones.push({
      texto: actual.confirmar.texto,
      estilo: actual.confirmar.destructiva ? 'destructivo' : 'principal',
      onPress: () => cerrar(true),
    });
  }
  if (actual) {
    botones.push({
      texto: actual.textoCerrar,
      estilo: actual.confirmar ? 'cancelar' : 'principal',
      onPress: () => cerrar(false),
    });
  }

  // La opacidad llega a 1 a mitad de camino: así el rebote del resorte solo
  // mueve la escala y la tarjeta nunca se ve medio transparente.
  const opacidad = progreso.interpolate({
    inputRange: [0, 0.5],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <AlertaContext value={alertas}>
      {/* Mientras hay una alerta, los lectores de pantalla ignoran lo que queda detrás. */}
      <View
        style={styles.flex}
        importantForAccessibility={actual ? 'no-hide-descendants' : 'auto'}
        accessibilityElementsHidden={actual !== null}>
        {children}
      </View>

      {actual ? (
        <View style={StyleSheet.absoluteFill}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: opacidad }]}>
            <Pressable
              accessible={false}
              importantForAccessibility="no"
              onPress={() => cerrar(false)}
              className="flex-1 bg-zu-navy/55"
            />
          </Animated.View>

          <View className="flex-1 items-center justify-center px-6" style={styles.dejaPasarToques}>
            <Animated.View
              accessibilityViewIsModal
              accessibilityLiveRegion="assertive"
              style={[
                styles.tarjeta,
                {
                  opacity: opacidad,
                  transform: [
                    {
                      translateY: progreso.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 0],
                      }),
                    },
                    {
                      scale: progreso.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}>
              <Alerta
                tipo={actual.tipo}
                titulo={actual.titulo}
                mensaje={actual.mensaje}
                botones={botones}
              />
            </Animated.View>
          </View>
        </View>
      ) : null}
    </AlertaContext>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // Los toques fuera de la tarjeta llegan al fondo (que cierra la alerta). Tiene que
  // ir en StyleSheet.create: en web, 'box-none' en un estilo en línea se ignora.
  dejaPasarToques: { pointerEvents: 'box-none' },
  tarjeta: { width: '100%', alignItems: 'center' },
});
