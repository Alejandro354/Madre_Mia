import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Tipo = "success" | "error";
interface Toast {
  id: number;
  tipo: Tipo;
  mensaje: string;
}

interface ToastContextValue {
  notificar: (mensaje: string, tipo?: Tipo) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let contador = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const cerrar = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notificar = useCallback(
    (mensaje: string, tipo: Tipo = "success") => {
      const id = ++contador;
      setToasts((prev) => [...prev, { id, tipo, mensaje }]);
      if (tipo === "success") {
        setTimeout(() => cerrar(id), 4000);
      }
    },
    [cerrar]
  );

  return (
    <ToastContext.Provider value={{ notificar }}>
      {children}
      <div className="fixed top-5 right-5 z-[1100] flex flex-col gap-2 w-full max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "flex items-start justify-between gap-3 rounded-lg px-4 py-3 text-sm shadow-lg border animate-[fadeIn_.15s_ease] " +
              (t.tipo === "success"
                ? "bg-white border-green-200 text-green-700"
                : "bg-white border-primary-light text-primary")
            }
          >
            <span>{t.mensaje}</span>
            <button
              onClick={() => cerrar(t.id)}
              className="text-lg leading-none opacity-60 hover:opacity-100"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
