import { getResumenUsuarios, listUsers } from "@/src/api";
import { EstadoUsuario, ResumenUsuarios, TipoUsuario } from "@/src/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { useListaPaginada } from "../useListaPaginada";

type FiltroEstado = 'todos' | EstadoUsuario;

const estadoLabel: Record<EstadoUsuario, string> = {
    activo: 'Activo',
    no_verificado: 'No verificado',
    inactivo: 'Inactivo',
    eliminado: 'Eliminado',
  };

const filtrosEstado: { valor: FiltroEstado; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'activo', label: 'Activo' },
  { valor: 'no_verificado', label: 'No verificado' },
  { valor: 'inactivo', label: 'Inactivo' },
  { valor: 'eliminado', label: 'Eliminado' },
];
  
  const tipoLabel: Record<TipoUsuario, string> = {
    conductor: 'Conductor',
    controlador: 'Controlador',
    admin: 'Admin',
  };

function estadoClasses(estado: EstadoUsuario): string {
    if (estado === 'activo') return 'bg-emerald-100 text-emerald-800';
    if (estado === 'no_verificado') return 'bg-amber-100 text-amber-800';
    if (estado === 'eliminado') return 'bg-slate-200 text-slate-700';
    return 'bg-red-100 text-red-700';
}
  
/**
 * Lógica de "Administrar usuarios". La búsqueda y la paginación las hace el
 * servidor. El estado se filtra aquí sobre los registros ya cargados.
 */
export function useUsuarios() {
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const lista = useListaPaginada(listUsers, (usuario) => usuario.id);
  const [resumen, setResumen] = useState<ResumenUsuarios | null>(null);

  const cargarResumen = useCallback(() => {
    getResumenUsuarios()
      .then(setResumen)
      .catch(() => setResumen(null));
  }, []);

  useFocusEffect(cargarResumen);

  /** Deslizar hacia abajo: primera página y totales de nuevo. */
  const refrescar = () => {
    void lista.recargar(true);
    cargarResumen();
  };

  const items =
    filtroEstado === 'todos'
      ? lista.items
      : lista.items.filter((usuario) => usuario.estado === filtroEstado);

  return {
    estadoLabel,
    tipoLabel,
    estadoClasses,
    filtrosEstado,
    filtroEstado,
    setFiltroEstado,
    ...lista,
    items,
    cargados: lista.items.length,
    resumen,
    refrescar,
  };
}
