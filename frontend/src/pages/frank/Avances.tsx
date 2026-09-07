import { useEffect, useState } from "react";
import { apiGet, apiDelete, urlArchivo } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import type { Avance } from "../../types";
import { usePracticante } from "./PracticanteShell";

export default function FrankAvances() {
  const { practicante } = usePracticante();
  const [avances, setAvances] = useState<Avance[]>([]);
  const { notificar } = useToast();

  function cargar() {
    apiGet(`/api/frank/practicantes/${practicante.id}/avances`).then(setAvances);
  }
  useEffect(cargar, [practicante.id]);

  async function eliminar(id: number) {
    if (!confirm("¿Eliminar este avance?")) return;
    try {
      await apiDelete(`/api/frank/avances/${id}`);
      notificar("Avance eliminado.", "success");
      cargar();
    } catch {
      notificar("No se pudo eliminar el avance.", "error");
    }
  }

  return (
    <div className="panel">
      <h2 className="font-semibold mb-1">Avances cargados por el practicante</h2>
      <p className="text-xs text-text-secondary mb-6">
        Estos archivos los sube el practicante desde su portal. Como administrador, puedes verlos o eliminarlos.
      </p>

      {avances.length === 0 ? (
        <p className="text-sm text-text-secondary">El practicante aún no ha cargado avances.</p>
      ) : (
        <ul className="divide-y divide-border">
          {avances.map((a) => (
            <li key={a.id} className="py-3 flex items-center gap-3 text-sm">
              <span className="font-mono text-[10.5px] bg-surface text-text-secondary px-2 py-0.5 rounded">{a.tipo.toUpperCase()}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate">{a.descripcion}</p>
                <span className="text-xs text-text-secondary">{a.nombre_original} · {a.creado_en}</span>
              </div>
              <a href={urlArchivo(`/api/frank/avances/${a.id}/ver`)} target="_blank" rel="noreferrer" className="btn-ghost !py-1 !px-3 text-xs">Ver</a>
              <button onClick={() => eliminar(a.id)} className="btn-danger-ghost">Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
