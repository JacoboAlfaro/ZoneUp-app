import { createZona } from "@/src/api";
import { useAlerta } from "@/src/components/alerta/AlertaProvider";
import { router } from "expo-router";
import { useForm } from "react-hook-form";

/** Los datos que captura este formulario. Todo entra como texto y se convierte al guardar. */
type NuevaZonaForm = {
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

export  function useNuevo_zona() {
    const alerta = useAlerta();
    const { control, handleSubmit, formState } = useForm<NuevaZonaForm>({
        defaultValues: {
          indicaciones: '',
          latitud: '5.0704',
          longitud: '-75.5178',
          capacidad_total: '10',
        },
      });
    
      const guardar = async (form: NuevaZonaForm) => {
        // Solo la capacidad total: los cupos disponibles los calcula el servidor.
        try {
          await createZona({
            indicaciones: form.indicaciones.trim(),
            latitud: aNumero(form.latitud),
            longitud: aNumero(form.longitud),
            capacidad_total: aEntero(form.capacidad_total),
          });
          await alerta.mostrar({
            tipo: 'exito',
            titulo: 'Zona creada',
            mensaje: 'La zona azul fue registrada correctamente.',
          });
          router.back();
        } catch (cause) {
          void alerta.mostrar({
            tipo: 'error',
            titulo: 'No se pudo crear la zona',
            mensaje: (cause as Error).message,
          });
        }
    };

  return { control, handleSubmit, formState, guardar, aNumero, aEntero }
}
