/**
 * Contexto de sesión: quién está dentro de la app en este momento.
 *
 * Un "contexto" de React es un valor que se comparte con todas las pantallas
 * sin tener que pasarlo de una a otra por props. Aquí guardamos el usuario y
 * exponemos las tres acciones que lo cambian: entrar, registrarse y salir.
 */

import { createContext, use, useState, type PropsWithChildren } from 'react';
import * as api from '../api/auth';
import { setToken } from '../api/client';
import type { Register, User } from '../types';

interface Session {
  /** null = nadie ha entrado. El layout raíz usa esto para decidir qué mostrar. */
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (dto: Register) => Promise<void>;
  signOut: () => void;
}

const SessionContext = createContext<Session | null>(null);

/** Atajo para leer la sesión desde cualquier pantalla: `const { user } = useSession()`. */
export function useSession(): Session {
  const value = use(SessionContext);
  if (!value) throw new Error('useSession debe usarse dentro de <SessionProvider />');
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);

  /**
   * Pide el token al backend y lo deja disponible para las siguientes
   * peticiones. Si las credenciales son malas, `api.login` lanza el error del
   * servidor y la pantalla de login lo muestra: aquí no se atrapa.
   */
  const signIn = async (email: string, password: string) => {
    const session = await api.login(email.trim().toLowerCase(), password);
    setToken(session.token);
    setUser(session.user);
  };

  return (
    <SessionContext
      value={{
        user,
        signIn,
        // `api.register` devuelve la sesión completa (el backend firma el JWT
        // al crear la cuenta), así que se entra directo sin un login extra.
        signUp: async (form) => {
          // `api.register` normaliza los datos y parte nombres y apellidos.
          const session = await api.register({ ...form, tipo_usuario: 'conductor' });
          setToken(session.token);
          setUser(session.user);
        },
        signOut: () => {
          setToken(null);
          setUser(null);
        },
      }}>
      {children}
    </SessionContext>
  );
}
