import { useEffect, useState, type FormEvent } from "react";
import { apiPostForm, apiDelete, apiGet, urlArchivo, ApiError } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import type { Documento } from "../../types";
import { usePracticante } from "./PracticanteShell";

export default function FrankDocumentos() {
  const { practicante } = usePracticante();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const { notificar } = useToast();

  function cargar() {
    apiGet(`/api/frank/practicantes/${practicante.id}/documentos`).then(setDocumentos);
  }
  useEffect(cargar, [practicante.id]);

  async function subir(e: FormEvent) {
    e.preventDefault();
    if (!archivo) {
      notificar("Selecciona un archivo antes de continuar.", "error");
      return;
    }
    const form = new FormData();
    form.append("archivo", archivo);
    setSubiendo(true);
    try {
      await apiPostForm(`/api/frank/practicantes/${practicante.id}/documentos`, form);
      notificar("Documento cargado correctamente en el almacenamiento.", "success");
      setArchivo(null);
      (document.getElementById("input-doc") as HTMLInputElement).value = "";
      cargar();
    } catch (err) {
      notificar(err instanceof ApiError ? err.message : "No se pudo subir el documento.", "error");
    } finally {
      setSubiendo(false);
    }
  }

  async function eliminar(id: number) {
    if (!confirm("¿Eliminar este documento?")) return;
    try {
      await apiDelete(`/api/frank/documentos/${id}`);
      notificar("Documento eliminado.", "success");
      cargar();
    } catch {
      notificar("No se pudo eliminar el documento.", "error");
    }
  }

  return (
    <div className="panel">
      <h2 className="font-semibold mb-4">Cargar documentación</h2>
      <form onSubmit={subir} className="flex flex-wrap gap-3 items-center mb-2">
        <input
          id="input-doc"
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <button type="submit" disabled={subiendo} className="pr-btn-primary">
          {subiendo ? "Subiendo…" : "Subir documento"}
        </button>
      </form>
      <p className="text-xs text-text-secondary mb-6">
        Formatos permitidos: PDF, DOCX · Tamaño máximo: 10 MB. El practicante podrá ver estos archivos pero no modificarlos.
      </p>

      {documentos.length === 0 ? (
        <p className="text-sm text-text-secondary">Aún no hay documentos cargados.</p>
      ) : (
        <ul className="divide-y divide-border">
          {documentos.map((d) => (
            <li key={d.id} className="py-3 flex items-center gap-3 text-sm">
              <span className="font-mono text-[10.5px] bg-surface text-text-secondary px-2 py-0.5 rounded">{d.tipo.toUpperCase()}</span>
              <span className="flex-1 truncate">{d.nombre_original}</span>
              <span className="text-text-secondary text-xs">{d.tamano_kb} KB · {d.creado_en}</span>
              <a href={urlArchivo(`/api/frank/documentos/${d.id}/ver`)} target="_blank" rel="noreferrer" className="btn-ghost !py-1 !px-3 text-xs">Ver</a>
              <button onClick={() => eliminar(d.id)} className="btn-danger-ghost">Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
