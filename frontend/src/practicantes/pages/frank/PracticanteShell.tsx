import { useEffect, useState } from "react";
import { Link, Outlet, useOutletContext, useParams } from "react-router-dom";
import { apiGet, ApiError } from "../../lib/api";
import type { Practicante } from "../../types";
import Avatar from "../../components/Avatar";
import EstadoPill from "../../components/EstadoPill";
import SectionTabs from "../../components/SectionTabs";
import Lightbox from "../../components/Lightbox";
import { urlArchivo } from "../../lib/api";

interface Ctx {
  practicante: Practicante;
  recargar: () => void;
}

export function usePracticante() {
  return useOutletContext<Ctx>();
}

export default function FrankPracticanteShell() {
  const { pid } = useParams();
  const [practicante, setPracticante] = useState<Practicante | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  function cargar() {
    if (!pid) return;
    setCargando(true);
    setError(null);
    apiGet(`/api/frank/practicantes/${pid}`)
      .then(setPracticante)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "No se pudo conectar con el servidor.");
      })
      .finally(() => setCargando(false));
  }

  useEffect(cargar, [pid]);

  if (cargando) return <p className="text-sm text-text-secondary">Cargando…</p>;
  if (error || !practicante) {
    return (
      <div className="bg-primary-light border border-primary/20 rounded-card p-5 text-sm text-primary flex items-center justify-between gap-4 max-w-lg">
        <span>No se pudo cargar este practicante{error ? `: ${error}` : ""}.</span>
        <button onClick={cargar} className="btn-ghost !border-primary/30 !text-primary shrink-0">Reintentar</button>
      </div>
    );
  }

  return (
    <section>
      <Link to="/frank" className="text-sm text-text-secondary hover:text-text-primary mb-4 inline-block">← Volver al panel</Link>

      <header className="flex items-center gap-4 mb-6">
        <Avatar
          foto={practicante.foto}
          nombres={practicante.nombres}
          apellidos={practicante.apellidos}
          tamano="md"
          onClick={practicante.foto ? () => setLightbox(urlArchivo(`/api/media/perfiles/${practicante.foto}`)) : undefined}
        />
        <div>
          <h1 className="font-display text-xl font-bold">{practicante.nombres} {practicante.apellidos}</h1>
          <p className="text-sm text-text-secondary mt-0.5 flex items-center gap-2 flex-wrap">
            {practicante.tipo_documento} {practicante.documento} · {practicante.cohorte}
            <EstadoPill estado={practicante.estado} />
          </p>
        </div>
      </header>

      <SectionTabs
        items={[
          { to: `/frank/practicantes/${pid}/perfil`, label: "Perfil" },
          { to: `/frank/practicantes/${pid}/documentos`, label: "Documentos" },
          { to: `/frank/practicantes/${pid}/notas`, label: "Notas" },
          { to: `/frank/practicantes/${pid}/observaciones`, label: "Observaciones" },
          { to: `/frank/practicantes/${pid}/avances`, label: "Avances" },
          { to: `/frank/practicantes/${pid}/historial`, label: "Historial" },
        ]}
      />

      <Outlet context={{ practicante, recargar: cargar } satisfies Ctx} />
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </section>
  );
}
