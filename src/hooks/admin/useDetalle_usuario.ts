import { getUserByEmail, updateUser } from "@/src/api";
import { EstadoUsuario, TipoUsuario, User } from "@/src/types";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { Alert } from "react-native";

export  function useDetalle_usuario() {
    const { email } = useLocalSearchParams<{ email: string }>();
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    setError(null);

    try {
      setUsuario(await updateUser(usuario.documento_identidad, cambios));
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstado = (estado: EstadoUsuario) => {
    if (estado !== 'eliminado') {
      void actualizar({ estado });
      return;
    }

    Alert.alert(
      'Marcar como eliminado',
      'El usuario quedará marcado como eliminado y no podrá acceder a su cuenta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: () => void actualizar({ estado }),
        },
      ],
    );
  };
  return { usuario, loading, saving, error, actualizar, cambiarEstado }
}
