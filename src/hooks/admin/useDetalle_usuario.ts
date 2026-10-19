import { getUserByEmail, updateUser } from "@/src/api";
import { useAlerta } from "@/src/components/alerta/AlertaProvider";
import { EstadoUsuario, TipoUsuario, User } from "@/src/types";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";

export  function useDetalle_usuario() {
    const { email } = useLocalSearchParams<{ email: string }>();
  const navigation = useNavigation();
  const alerta = useAlerta();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  /** Error al cargar el usuario. Los errores al guardar se muestran en una alerta. */
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;

    setLoading(true);
    getUserByEmail(email)
      .then(setUsuario)
      .catch((cause) => setError((cause as Error).message))
      .finally(() => setLoading(false));
  }, [email]);

  useLayoutEffect(() => {
    if (usuario) navigation.setOptions({ title: usuario.name || 'Usuario' });
  }, [navigation, usuario]);

  const actualizar = async (
    cambios: { estado?: EstadoUsuario; tipo_usuario?: TipoUsuario },
  ) => {
    if (!usuario || saving) return;
    setSaving(true);

    try {
      setUsuario(await updateUser(usuario.documento_identidad, cambios));
    } catch (cause) {
      void alerta.mostrar({
        tipo: 'error',
        titulo: cambios.tipo_usuario
          ? 'No se pudo cambiar el tipo de usuario'
          : 'No se pudo cambiar el estado',
        mensaje: (cause as Error).message,
      });
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstado = async (estado: EstadoUsuario) => {
    if (estado !== 'eliminado') {
      void actualizar({ estado });
      return;
    }

    const confirmado = await alerta.confirmar({
      titulo: 'Marcar como eliminado',
      mensaje: 'El usuario quedará marcado como eliminado y no podrá acceder a su cuenta.',
      textoConfirmar: 'Confirmar',
      destructiva: true,
    });
    if (confirmado) void actualizar({ estado });
  };
  return { usuario, loading, saving, error, actualizar, cambiarEstado }
}
