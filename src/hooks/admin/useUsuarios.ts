import { listUsers } from "@/src/api";
import { EstadoUsuario, TipoUsuario, User } from "@/src/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

const estadoLabel: Record<EstadoUsuario, string> = {
    activo: 'Activo',
    no_verificado: 'No verificado',
    inactivo: 'Inactivo',
    eliminado: 'Eliminado',
  };
  
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
  
function normalizarBusqueda(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
}

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarUsuarios = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      setUsuarios(await listUsers());
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void cargarUsuarios();
    }, [cargarUsuarios]),
  );

  const activos = usuarios.filter((usuario) => usuario.estado === 'activo').length;
  const usuariosFiltrados = useMemo(() => {
    const termino = normalizarBusqueda(busqueda.trim());
    if (!termino) return usuarios;

    return usuarios.filter((usuario) =>
      [usuario.name, usuario.documento_identidad, usuario.email].some((value) =>
        normalizarBusqueda(value).includes(termino),
      ),
    );
  }, [busqueda, usuarios]);
  return { estadoLabel, tipoLabel, usuarios, busqueda, setBusqueda, loading, refreshing, error, activos, usuariosFiltrados, estadoClasses, cargarUsuarios }
}
