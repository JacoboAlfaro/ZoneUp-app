import { createZona } from "@/src/api";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

/** Los datos que captura este formulario. Todo entra como texto y se convierte al guardar. */
type NuevaZonaForm = {
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

export  function useNuevo_zona() {
    const { control, getValues, handleSubmit, setError, formState } = useForm<NuevaZonaForm>({
        defaultValues: {
          indicaciones: '',
          latitud: '5.0704',
          longitud: '-75.5178',
          capacidad: '0',
          capacidad_total: '10',
        },
      });
    
      const guardar = async (form: NuevaZonaForm) => {
        const capacidad = aEntero(form.capacidad);
        const capacidad_total = aEntero(form.capacidad_total);
    
        if (capacidad > capacidad_total) {
          setError('capacidad', {
            message: 'Los cupos disponibles no pueden superar la capacidad total',
          });
          return;
        }
    
        try {
          await createZona({
            indicaciones: form.indicaciones.trim(),
            latitud: aNumero(form.latitud),
            longitud: aNumero(form.longitud),
            capacidad,
            capacidad_total,
          });
          Alert.alert('Zona creada', 'La zona azul fue registrada correctamente.', [
            { text: 'Aceptar', onPress: () => router.back() },
          ]);
        } catch (cause) {
          setError('root', { message: (cause as Error).message });
        }
    };

  return { control, getValues, handleSubmit, formState, guardar, aNumero, aEntero }
}
