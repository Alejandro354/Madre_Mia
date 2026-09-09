import { useEffect, useState } from "react";
import { apiGet } from "../../lib/api";
import type { Nota } from "../../types";
import { useMiPerfil } from "./WilShell";

export default function WilCalificaciones() {
  const { practicante } = useMiPerfil();
  const [porPeriodo, setPorPeriodo] = useState<Record<string, Nota[]>>({});

  useEffect(() => {
    apiGet("/api/wil/calificaciones").then(setPorPeriodo);
  }, [practicante.id]);

  const periodos = Object.keys(porPeriodo);

  return (
    <div className="panel">
      <h2 className="font-semibold mb-4">Mi seguimiento</h2>
      {periodos.length === 0 ? (
        <p className="text-sm text-text-secondary">Todavía no tienes seguimiento registrado.</p>
      ) : (
        periodos.map((periodo) => (
          <div key={periodo} className="mb-5 last:mb-0">
            <h3 className="text-sm text-text-secondary mb-2">{periodo}</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11.5px] uppercase tracking-wide text-text-secondary border-b border-border">
                  <th className="py-2">Criterio</th><th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {porPeriodo[periodo].map((n) => (
                  <tr key={n.id} className="border-b border-border">
                    <td className="py-2.5">{n.criterio}</td>
                    <td className="font-semibold">{n.valor.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
