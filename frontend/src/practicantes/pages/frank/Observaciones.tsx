import { useEffect, useState, type FormEvent } from "react";
import { apiGet, apiPost, ApiError } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import type { Observacion } from "../../types";
import { usePracticante } from "./PracticanteShell";

export default function FrankObservaciones() {
  const { practicante } = usePracticante();
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [texto, setTexto] = useState("");
  const [autor, setAutor] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { notificar } = useToast();

  function cargar() {
    apiGet(`/api/frank/practicantes/${practicante.id}/observaciones`).then(setObservaciones);
  }
  useEffect(cargar, [practicante.id]);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await apiPost(`/api/frank/practicantes/${practicante.id}/observaciones`, { texto, autor });
      notificar("Observación guardada y asociada al perfil.", "success");
      setTexto(""); setAutor("");
      cargar();
    } catch (err) {
      notificar(err instanceof ApiError ? err.message : "No se pudo guardar la observación.", "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="panel">
      <h2 className="font-semibold mb-4">Hacer observaciones</h2>
      <form onSubmit={guardar} className="flex flex-col gap-3 mb-6">
        <textarea className="input-field" rows={3} placeholder="Escribe una observación o retroalimentación…" value={texto} onChange={(e) => setTexto(e.target.value)} required />
        <div className="flex gap-3">
          <input className="input-field flex-1" placeholder="Autor (opcional)" value={autor} onChange={(e) => setAutor(e.target.value)} />
          <button type="submit" disabled={enviando} className="pr-btn-primary">{enviando ? "Guardando…" : "Guardar observación"}</button>
        </div>
      </form>

      {observaciones.length === 0 ? (
        <p className="text-sm text-text-secondary">Aún no hay observaciones.</p>
      ) : (
        <ul className="divide-y divide-border">
          {observaciones.map((o) => (
            <li key={o.id} className="py-3">
              <p className="text-sm">{o.texto}</p>
              <span className="text-xs text-text-secondary">{o.autor} · {o.creado_en}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
