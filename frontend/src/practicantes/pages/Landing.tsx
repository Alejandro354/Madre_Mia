import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Briefcase, GraduationCap, Zap } from "lucide-react";

export default function Landing() {
  const { sesion } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 justify-center mb-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Zap size={18} className="text-white" fill="white" />
          </span>
          <span className="font-display font-bold text-lg text-text-primary">Tablero de Practicantes</span>
        </div>
        <p className="text-center text-text-secondary text-sm mb-10">
          Cada módulo tiene su propio inicio de sesión. Si ya estás dentro de uno, cierra sesión para entrar al otro.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          <Link
            to={sesion.rol === "frank" ? "/frank" : "/frank/login"}
            className="pr-card p-6 hover:shadow-md transition group"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white mb-4">
              <Briefcase size={18} />
            </span>
            <h2 className="font-display font-semibold text-lg mb-1.5">Panel Administrador</h2>
            <p className="text-sm text-text-secondary mb-4">
              Documentación, notas, observaciones, filtro y seguimiento de cada practicante.
            </p>
            <span className="text-sm font-semibold text-primary group-hover:underline">
              {sesion.rol === "frank" ? "Ir al panel →" : "Iniciar sesión →"}
            </span>
          </Link>

          <Link
            to={sesion.rol === "wil" ? "/wil/perfil" : "/wil/login"}
            className="pr-card p-6 hover:shadow-md transition group"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white mb-4">
              <GraduationCap size={18} />
            </span>
            <h2 className="font-display font-semibold text-lg mb-1.5">Portal Practicantes</h2>
            <p className="text-sm text-text-secondary mb-4">
              Perfil, documentos, avances, seguimiento e historial del practicante.
            </p>
            <span className="text-sm font-semibold text-primary group-hover:underline">
              {sesion.rol === "wil" ? "Ir al portal →" : "Iniciar sesión →"}
            </span>
          </Link>
        </div>

        <div className="mt-8 text-xs text-text-secondary bg-surface border border-border rounded-lg px-4 py-3 leading-relaxed">
          <strong className="text-text-primary">Administrador:</strong> <code>admin</code> / <code>admin123</code>
          <br />
          <strong className="text-text-primary">Practicantes:</strong> <code>mariana.zapata@correo.com</code> / <code>1234</code>
        </div>
      </div>
    </div>
  );
}
