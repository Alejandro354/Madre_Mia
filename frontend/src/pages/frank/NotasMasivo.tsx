import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiPost } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function FrankNotasMasivo() {
  const [lote, setLote] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { notificar } = useToast();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await apiPost("/api/frank/notas/masivo", { lote });
      if (res.guardadas) notificar(`Se guardaron ${res.guardadas} nota(s) correctamente.`, "success");
      if (res.errores?.length) {
        notificar(res.errores.slice(0, 5).join(" | ") + (res.errores.length > 5 ? " …" : ""), "error");
      }
      if (!res.guardadas && !res.errores?.length) notificar("No se recibió ninguna fila para procesar.", "error");
    } catch {
      notificar("No se pudo procesar el lote.", "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section>
      <Link to="/frank" className="text-sm text-text-secondary hover:text-text-primary mb-4 inline-block">← Volver al panel</Link>
      <header className="mb-6">
        <span className="inline-block bg-sidebar text-white text-xs font-semibold px-3 py-1.5 rounded-md mb-2">Administrador</span>
        <h1 className="font-display text-2xl font-bold">Carga Masiva de Seguimiento</h1>
        <p className="text-text-secondary text-sm mt-1">Registra el seguimiento para varios practicantes al mismo tiempo.</p>
      </header>

      <div className="panel">
        <h2 className="font-semibold mb-2">Pegar lote de notas</h2>
        <p className="text-sm text-text-secondary mb-4">
          Una fila por practicante, formato <code>documento;criterio;periodo;valor</code>. La nota debe estar entre 0.0 y 5.0.
        </p>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <textarea
            value={lote}
            onChange={(e) => setLote(e.target.value)}
            rows={8}
            className="input-field font-mono text-xs"
            placeholder={"1035421098;Compromiso;Corte 2;4.6\n1128940012;Puntualidad;Corte 2;3.9"}
          />
          <button type="submit" disabled={enviando} className="btn-primary self-start">
            {enviando ? "Procesando…" : "Procesar lote"}
          </button>
        </form>
      </div>
    </section>
  );
}
