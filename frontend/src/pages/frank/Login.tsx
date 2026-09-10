import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { ApiError } from "../../lib/api";
import { Zap, ArrowLeftRight, ArrowLeft } from "lucide-react";

export default function FrankLogin() {
  const { loginFrank, logoutWil, sesion } = useAuth();
  const { notificar } = useToast();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [cambiando, setCambiando] = useState(false);

  useEffect(() => {
    if (sesion.rol === "frank") navigate("/frank", { replace: true });
  }, [sesion.rol, navigate]);

  async function cerrarWilYContinuar() {
    setCambiando(true);
    try {
      await logoutWil();
      notificar("Sesión de Practicantes cerrada. Ya puedes ingresar aquí.", "success");
    } finally {
      setCambiando(false);
    }
  }

  if (sesion.rol === "wil") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="card p-8 max-w-sm">
          <p className="text-sm text-text-primary mb-4">
            Ya tienes una sesión activa en Portal Practicantes. Ciérrala para entrar al Panel Administrador.
          </p>
          <button onClick={cerrarWilYContinuar} disabled={cambiando} className="btn-primary w-full inline-flex items-center justify-center gap-2 mb-3">
            <ArrowLeftRight size={16} />
            {cambiando ? "Cerrando sesión…" : "Cerrar sesión de Practicantes y continuar"}
          </button>
          <Link to="/" className="text-sm text-text-secondary hover:text-text-primary inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Volver
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!usuario.trim() || !password) {
      setError("Ingresa usuario y contraseña.");
      return;
    }
    setEnviando(true);
    try {
      await loginFrank(usuario.trim(), password);
      notificar("Bienvenido/a, Administrador.", "success");
      navigate("/frank");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "No se pudo iniciar sesión.";
      setError(msg);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-sm text-text-secondary hover:text-text-primary inline-flex items-center gap-1 mb-4">
          <ArrowLeft size={14} /> Volver
        </Link>
        <div className="flex items-center gap-2 justify-center mb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Zap size={18} className="text-white" fill="white" />
          </span>
          <span className="font-display font-bold text-lg">Panel Administrador</span>
        </div>

        <div className="card p-8">
          <h1 className="font-display text-xl font-bold mb-1">¡Bienvenido de nuevo!</h1>
          <p className="text-sm text-text-secondary mb-6">Inicia sesión para gestionar a los practicantes.</p>

          {error && (
            <div className="mb-4 rounded-lg bg-primary-light text-primary text-sm px-3 py-2">{error}</div>
          )}

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <label className="field-label block">Usuario</label>
              <input
                className="input-field"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="admin"
                autoFocus
              />
            </div>
            <div>
              <label className="field-label block">Contraseña</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={enviando} className="btn-primary mt-2">
              {enviando ? "Ingresando…" : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-text-secondary">
          Usuario de prueba: <code>admin</code> / <code>admin123</code>
        </p>
      </div>
    </div>
  );
}
