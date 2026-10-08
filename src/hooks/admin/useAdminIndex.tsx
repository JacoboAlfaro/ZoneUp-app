import { listUsers, listZonas } from "@/src/api";
import { useSession } from "@/src/session/context";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useAdminIndex() {
  const { user, signOut } = useSession();
  const [totalUsuarios, setTotalUsuarios] = useState<number | null>(null);
  const [totalZonas, setTotalZonas] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      listUsers()
        .then((users) => {
          if (active) setTotalUsuarios(users.length);
        })
        .catch(() => {
          if (active) setTotalUsuarios(null);
        });

      listZonas()
        .then((zonas) => {
          if (active) setTotalZonas(zonas.length);
        })
        .catch(() => {
          if (active) setTotalZonas(null);
        });

      return () => {
        active = false;
      };
    }, []),
  );
  return { user, signOut, totalUsuarios, totalZonas }
}
