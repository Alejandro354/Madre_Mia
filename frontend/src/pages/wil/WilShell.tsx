import { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { apiGet, urlArchivo, ApiError } from "../../lib/api";
import type { Practicante } from "../../types";
import Avatar from "../../components/Avatar";
import EstadoPill from "../../components/EstadoPill";
import Lightbox from "../../components/Lightbox";

interface Ctx {
  practicante: Practicante;
  recargar: () => void;
}

export function useMiPerfil() {
  return useOutletContext<Ctx>();
}

export default function WilShell() {
  const [practicante, setPracticante] = useState<Practicante | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  function cargar() {
    setCargando(true);
    setError(null);
    apiGet("/api/wil/perfil")
      .then(setPracticante)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "No se pudo conectar con el servidor.");
      })
      .finally(() => setCargando(false));
  }
  useEffect(cargar, []);

  if (cargando) return <p className="text-sm text-text-secondary">Cargando…</p>;
  if (error || !practicante) {
    return (
      <div className="bg-primary-light border border-primary/20 rounded-card p-5 text-sm text-primary flex items-center justify-between gap-4 max-w-lg">
        <span>No se pudo cargar tu perfil{error ? `: ${error}` : ""}.</span>
        <button onClick={cargar} className="btn-ghost !border-primary/30 !text-primary shrink-0">Reintentar</button>
      </div>
    );
  }

  return (
    <section>
      <header className="flex items-center gap-4 mb-6">
        <Avatar
          foto={practicante.foto}
          nombres={practicante.nombres}
          apellidos={practicante.apellidos}
          tamano="md"
          onClick={practicante.foto ? () => setLightbox(urlArchivo(`/api/media/perfiles/${practicante.foto}`)) : undefined}
        />
        <div>
          <h1 className="font-display text-xl font-bold">Hola, {practicante.nombres}</h1>
          <p className="text-sm text-text-secondary mt-0.5 flex items-center gap-2">
            {practicante.cohorte} <EstadoPill estado={practicante.estado} />
          </p>
        </div>
      </header>

      <Outlet context={{ practicante, recargar: cargar } satisfies Ctx} />
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </section>
  );
}
