import { useEffect, useState, type FormEvent } from "react";
import { apiGet, apiPost, ApiError } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import type { Nota } from "../../types";
import { usePracticante } from "./PracticanteShell";

export default function FrankNotas() {
  const { practicante } = usePracticante();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [promedio, setPromedio] = useState<number | null>(null);
  const [criterio, setCriterio] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [valor, setValor] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { notificar } = useToast();

  function cargar() {
    apiGet(`/api/frank/practicantes/${practicante.id}/notas`).then((data) => {
      setNotas(data.notas);
      setPromedio(data.promedio);
    });
  }
  useEffect(cargar, [practicante.id]);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await apiPost(`/api/frank/practicantes/${practicante.id}/notas`, { criterio, periodo, valor });
      notificar("Nota guardada correctamente.", "success");
      setCriterio(""); setPeriodo(""); setValor("");
      cargar();
    } catch (err) {
      notificar(err instanceof ApiError ? err.message : "No se pudo guardar la nota.", "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="panel">
      <h2 className="font-semibold mb-4">
        Cargar notas {promedio !== null && <span className="text-text-secondary font-normal text-sm">· Promedio: {promedio.toFixed(2)}</span>}
      </h2>
      <form onSubmit={guardar} className="flex flex-wrap gap-3 mb-2">
        <input className="input-field w-auto flex-1 min-w-[160px]" placeholder="Criterio (ej. Compromiso)" value={criterio} onChange={(e) => setCriterio(e.target.value)} required />
        <input className="input-field w-auto flex-1 min-w-[140px]" placeholder="Periodo (ej. Corte 1)" value={periodo} onChange={(e) => setPeriodo(e.target.value)} required />
        <input className="input-field w-32" type="number" step="0.1" min="0" max="5" placeholder="0.0 – 5.0" value={valor} onChange={(e) => setValor(e.target.value)} required />
        <button type="submit" disabled={enviando} className="btn-primary">{enviando ? "Guardando…" : "Guardar nota"}</button>
      </form>
      <p className="text-xs text-text-secondary mb-6">La nota debe estar entre 0.0 y 5.0.</p>

      {notas.length === 0 ? (
        <p className="text-sm text-text-secondary">Aún no hay notas registradas.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11.5px] uppercase tracking-wide text-text-secondary border-b border-border">
              <th className="py-2">Criterio</th><th>Periodo</th><th>Valor</th><th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {notas.map((n) => (
              <tr key={n.id} className="border-b border-border">
                <td className="py-2.5">{n.criterio}</td>
                <td>{n.periodo}</td>
                <td className="font-semibold">{n.valor.toFixed(1)}</td>
                <td className="text-text-secondary text-xs">{n.creado_en}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
