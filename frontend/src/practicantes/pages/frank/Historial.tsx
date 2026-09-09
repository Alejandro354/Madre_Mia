import { useEffect, useState } from "react";
import { apiGet } from "../../lib/api";
import type { EventoHistorial } from "../../types";
import { usePracticante } from "./PracticanteShell";

export default function FrankHistorial() {
  const { practicante } = usePracticante();
  const [historial, setHistorial] = useState<EventoHistorial[]>([]);

  useEffect(() => {
    apiGet(`/api/frank/practicantes/${practicante.id}/historial`).then(setHistorial);
  }, [practicante.id]);

  return (
    <div className="panel">
      <h2 className="font-semibold mb-4">Historial de seguimiento</h2>
      {historial.length === 0 ? (
        <p className="text-sm text-text-secondary">Sin eventos registrados todavía.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {historial.map((h) => (
            <li key={h.id} className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
              <div>
                <strong className="text-sm">{h.evento}</strong>
                <p className="text-sm text-text-secondary">{h.descripcion}</p>
                <span className="text-[11.5px] text-text-secondary">{h.creado_en}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
