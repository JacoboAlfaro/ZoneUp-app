/**
 * Ventana emergente de ZoneUp: reemplaza a `Alert.alert` de React Native.
 *
 * Solo dibuja una alerta. Quién la abre, la cola y las animaciones viven en
 * `AlertaProvider`; las pantallas la usan con `useAlerta()`.
 *
 * El ícono va dentro de un círculo con una "órbita" inclinada alrededor, como
 * el pin y la órbita del logo.
 */

import { CircleAlert, CircleCheck, CircleX, Info, TriangleAlert } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';

export type TipoAlerta = 'exito' | 'error' | 'advertencia' | 'info' | 'pregunta';

export type EstiloBoton = 'principal' | 'destructivo' | 'cancelar';

export interface BotonAlerta {
  texto: string;
  estilo: EstiloBoton;
  onPress: () => void;
}

type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

const apariencia: Record<
  TipoAlerta,
  { icon: IconComponent; color: string; circulo: string; orbita: string }
> = {
  exito: {
    icon: CircleCheck,
    color: '#047857',
    circulo: 'bg-emerald-50 border-emerald-200',
    orbita: 'border-emerald-300',
  },
  error: {
    icon: CircleX,
    color: '#B91C1C',
    circulo: 'bg-red-50 border-red-200',
    orbita: 'border-red-300',
  },
  advertencia: {
    icon: TriangleAlert,
    color: '#B45309',
    circulo: 'bg-amber-50 border-amber-200',
    orbita: 'border-amber-300',
  },
  info: {
    icon: Info,
    color: '#1E3A5F',
    circulo: 'bg-zu-sky-fade border-zu-sky-bottom',
    orbita: 'border-zu-sky-top',
  },
  pregunta: {
    icon: CircleAlert,
    color: '#1E3A5F',
    circulo: 'bg-zu-sky-fade border-zu-sky-bottom',
    orbita: 'border-zu-sky-top',
  },
};

const estiloBoton: Record<EstiloBoton, { fondo: string; texto: string }> = {
  principal: { fondo: 'bg-zu-navy', texto: 'text-zu-white' },
  destructivo: { fondo: 'bg-red-600', texto: 'text-zu-white' },
  cancelar: { fondo: 'border border-zu-border bg-zu-white', texto: 'text-zu-navy' },
};

interface Props {
  tipo: TipoAlerta;
  titulo: string;
  mensaje?: string;
  /** En orden de importancia: el primero es la acción principal. */
  botones: BotonAlerta[];
}

export default function Alerta({ tipo, titulo, mensaje, botones }: Props) {
  const { icon: Icon, color, circulo, orbita } = apariencia[tipo];

  return (
    <View className="w-full max-w-sm overflow-hidden rounded-3xl border border-zu-white/70 bg-zu-white px-6 pb-6 pt-4 shadow-md">
      <View className="items-center">
        <View className="h-1 w-10 rounded-full bg-zu-accent" />

        <View className="mt-5 h-20 w-28 items-center justify-center">
          <View
            className={`absolute h-9 w-28 rounded-full border-2 ${orbita}`}
            style={{ transform: [{ rotate: '-18deg' }] }}
          />
          <View
            className={`h-16 w-16 items-center justify-center rounded-full border-4 ${circulo}`}>
            <Icon size={30} color={color} strokeWidth={2.2} />
          </View>
        </View>

        <Text
          accessibilityRole="header"
          className="mt-4 text-center text-lg font-bold text-zu-navy">
          {titulo}
        </Text>
        {mensaje ? (
          <Text className="mt-2 text-center text-base leading-6 text-zu-slate">{mensaje}</Text>
        ) : null}
      </View>

      <View className="mt-6 gap-3">
        {botones.map((boton) => (
          <Pressable
            key={`${boton.estilo}-${boton.texto}`}
            accessibilityRole="button"
            onPress={boton.onPress}
            className={`items-center rounded-xl p-4 active:opacity-80 ${estiloBoton[boton.estilo].fondo}`}>
            <Text className={`text-base font-semibold ${estiloBoton[boton.estilo].texto}`}>
              {boton.texto}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
