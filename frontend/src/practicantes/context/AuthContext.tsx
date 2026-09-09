import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiGet, apiPost } from "../lib/api";
import type { Sesion } from "../types";

interface AuthContextValue {
  sesion: Sesion;
  cargando: boolean;
  loginFrank: (usuario: string, password: string) => Promise<void>;
  loginWil: (email: string, password: string) => Promise<void>;
  logoutFrank: () => Promise<void>;
  logoutWil: () => Promise<void>;
  refrescarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion>({ rol: null });
  const [cargando, setCargando] = useState(true);

  async function refrescarSesion() {
    try {
      const data = await apiGet("/api/session");
      setSesion(data);
    } catch {
      setSesion({ rol: null });
    }
  }

  useEffect(() => {
    refrescarSesion().finally(() => setCargando(false));
  }, []);

  // Si cualquier llamada a la API responde 401 (sesión vencida, backend
  // reiniciado, cookie de una base de datos anterior, etc.), limpiamos la
  // sesión local para que las rutas protegidas te regresen al login en vez
  // de dejar la pantalla muda o rota.
  useEffect(() => {
    function onSesionInvalida() {
      setSesion({ rol: null });
    }
    window.addEventListener("sesion-invalida", onSesionInvalida);
    return () => window.removeEventListener("sesion-invalida", onSesionInvalida);
  }, []);

  async function loginFrank(usuario: string, password: string) {
    const data = await apiPost("/api/frank/login", { usuario, password });
    setSesion(data);
  }

  async function loginWil(email: string, password: string) {
    const data = await apiPost("/api/wil/login", { email, password });
    setSesion(data);
  }

  async function logoutFrank() {
    await apiPost("/api/frank/logout");
    setSesion({ rol: null });
  }

  async function logoutWil() {
    await apiPost("/api/wil/logout");
    setSesion({ rol: null });
  }

  return (
    <AuthContext.Provider value={{ sesion, cargando, loginFrank, loginWil, logoutFrank, logoutWil, refrescarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
