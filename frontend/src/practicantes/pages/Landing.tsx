import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, ArrowRight, Briefcase, GraduationCap, Zap } from "lucide-react";

export default function Landing() {
  const { sesion } = useAuth();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary transition mb-6"
        >
          <ArrowLeft size={16} />
          Volver a inicio
        </Link>

        <div className="bg-background border border-border rounded-2xl shadow-sm p-8 sm:p-10">
          <div className="flex flex-col items-center text-center mb-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
              <Zap size={22} className="text-white" fill="white" />
            </span>
            <h1 className="font-display font-bold text-xl text-text-primary mb-2">Tablero de Practicantes</h1>
            <p className="text-text-secondary text-sm max-w-md">
              Cada módulo tiene su propio inicio de sesión. Si ya estás dentro de uno, cierra sesión para entrar al otro.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Link
              to={sesion.rol === "frank" ? "/frank" : "/frank/login"}
              className="group flex flex-col rounded-2xl border border-border bg-background p-6 transition hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary mb-4">
                <Briefcase size={20} />
              </span>
              <h2 className="font-display font-semibold text-lg text-text-primary mb-1.5">Panel de Profesor</h2>
              <p className="text-sm text-text-secondary mb-5 flex-1">
                Documentación, notas, observaciones, filtro y seguimiento de cada practicante.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                {sesion.rol === "frank" ? "Ir al panel" : "Iniciar sesión"}
                <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              to={sesion.rol === "wil" ? "/wil/perfil" : "/wil/login"}
              className="group flex flex-col rounded-2xl border border-border bg-background p-6 transition hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary mb-4">
                <GraduationCap size={20} />
              </span>
              <h2 className="font-display font-semibold text-lg text-text-primary mb-1.5">Portal Practicantes</h2>
              <p className="text-sm text-text-secondary mb-5 flex-1">
                Perfil, documentos, avances, seguimiento e historial del practicante.
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                {sesion.rol === "wil" ? "Ir al portal" : "Iniciar sesión"}
                <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>

          <div className="mt-8 text-xs text-text-secondary bg-surface border border-border rounded-xl px-4 py-3 leading-relaxed">
            <strong className="text-text-primary">Administrador:</strong> <code>admin</code> / <code>admin123</code>
            <br />
            <strong className="text-text-primary">Practicantes:</strong> <code>mariana.zapata@correo.com</code> / <code>1234</code>
          </div>
        </div>
      </div>
    </div>
  );
}
