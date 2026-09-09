import { useEffect, useState } from "react";
import { apiGet, urlArchivo } from "../../lib/api";
import type { Documento } from "../../types";
import { useMiPerfil } from "./WilShell";

export default function WilDocumentos() {
  const { practicante } = useMiPerfil();
  const [documentos, setDocumentos] = useState<Documento[]>([]);

  useEffect(() => {
    apiGet("/api/wil/documentos").then(setDocumentos);
  }, [practicante.id]);

  return (
    <div className="panel">
      <h2 className="font-semibold mb-1">Mis documentos</h2>
      <p className="text-xs text-text-secondary mb-6">
        Estos archivos los sube el equipo de acompañamiento. Puedes verlos y descargarlos, pero no modificarlos.
      </p>

      {documentos.length === 0 ? (
        <p className="text-sm text-text-secondary">El administrador aún no ha cargado documentos a tu perfil.</p>
      ) : (
        <ul className="divide-y divide-border">
          {documentos.map((d) => (
            <li key={d.id} className="py-3 flex items-center gap-3 text-sm">
              <span className="font-mono text-[10.5px] bg-surface text-text-secondary px-2 py-0.5 rounded">{d.tipo.toUpperCase()}</span>
              <span className="flex-1 truncate">{d.nombre_original}</span>
              <span className="text-text-secondary text-xs">{d.creado_en}</span>
              <a href={urlArchivo(`/api/wil/documentos/${d.id}/ver`)} target="_blank" rel="noreferrer" className="btn-ghost !py-1 !px-3 text-xs">Ver</a>
              <a href={urlArchivo(`/api/wil/documentos/${d.id}/descargar`)} className="btn-ghost !py-1 !px-3 text-xs">Descargar</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
