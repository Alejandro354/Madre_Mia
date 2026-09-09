import { useEffect, useState, type FormEvent } from "react";
import { apiGet, apiPostForm, apiDelete, urlArchivo, ApiError } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import type { Avance } from "../../types";
import { useMiPerfil } from "./WilShell";

export default function WilAvances() {
  const { practicante } = useMiPerfil();
  const [avances, setAvances] = useState<Avance[]>([]);
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { notificar } = useToast();

  function cargar() {
    apiGet("/api/wil/avances").then(setAvances);
  }
  useEffect(cargar, [practicante.id]);

  async function subir(e: FormEvent) {
    e.preventDefault();
    if (!descripcion.trim() || !archivo) {
      notificar("Describe el avance y adjunta un archivo.", "error");
      return;
    }
    const form = new FormData();
    form.append("descripcion", descripcion);
    form.append("archivo", archivo);
    setEnviando(true);
    try {
      await apiPostForm("/api/wil/avances", form);
      notificar("Avance cargado correctamente.", "success");
      setDescripcion(""); setArchivo(null);
      (document.getElementById("input-avance") as HTMLInputElement).value = "";
      cargar();
    } catch (err) {
      notificar(err instanceof ApiError ? err.message : "No se pudo subir el avance.", "error");
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar(id: number) {
    if (!confirm("¿Eliminar este avance? Esta acción no se puede deshacer.")) return;
    try {
      await apiDelete(`/api/wil/avances/${id}`);
      notificar("Avance eliminado.", "success");
      cargar();
    } catch {
      notificar("No se pudo eliminar el avance.", "error");
    }
  }

  return (
    <div className="panel">
      <h2 className="font-semibold mb-4">Cargar avances</h2>
      <form onSubmit={subir} className="flex flex-col gap-3 mb-2">
        <input className="input-field" placeholder="Describe brevemente el avance…" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <div className="flex flex-wrap gap-3 items-center">
          <input id="input-avance" type="file" accept=".pdf,.docx,.pptx,.xlsx,.jpg,.jpeg,.png" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} className="text-sm" />
          <button type="submit" disabled={enviando} className="pr-btn-primary">{enviando ? "Subiendo…" : "Subir avance"}</button>
        </div>
      </form>
      <p className="text-xs text-text-secondary mb-6">Formatos permitidos: PDF, DOCX, PPTX, XLSX, JPG, PNG · Máximo 10 MB.</p>

      {avances.length === 0 ? (
        <p className="text-sm text-text-secondary">Aún no has cargado avances.</p>
      ) : (
        <ul className="divide-y divide-border">
          {avances.map((a) => (
            <li key={a.id} className="py-3 flex items-center gap-3 text-sm">
              <span className="font-mono text-[10.5px] bg-surface text-text-secondary px-2 py-0.5 rounded">{a.tipo.toUpperCase()}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate">{a.descripcion}</p>
                <span className="text-xs text-text-secondary">{a.nombre_original} · {a.creado_en}</span>
              </div>
              <a href={urlArchivo(`/api/wil/avances/${a.id}/ver`)} target="_blank" rel="noreferrer" className="btn-ghost !py-1 !px-3 text-xs">Ver</a>
              <button onClick={() => eliminar(a.id)} className="btn-danger-ghost">Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
