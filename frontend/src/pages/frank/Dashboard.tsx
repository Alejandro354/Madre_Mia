import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { apiGet, ApiError } from "../../lib/api";
import type { Practicante } from "../../types";
import Avatar from "../../components/Avatar";
import EstadoPill from "../../components/EstadoPill";

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function FrankDashboard() {
  const [practicantes, setPracticantes] = useState<Practicante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [cohorte, setCohorte] = useState("");

  function cargar() {
    setCargando(true);
    setError(null);
    apiGet("/api/frank/practicantes")
      .then(setPracticantes)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "No se pudo conectar con el servidor.");
      })
      .finally(() => setCargando(false));
  }

  useEffect(cargar, []);

  const estados = useMemo(() => Array.from(new Set(practicantes.map((p) => p.estado))).sort(), [practicantes]);
  const cohortes = useMemo(() => Array.from(new Set(practicantes.map((p) => p.cohorte))).sort(), [practicantes]);

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return practicantes.filter((p) => {
      const coincideNombre =
        !q || normalizar(`${p.nombres} ${p.apellidos} ${p.documento}`).includes(q);
      const coincideEstado = !estado || p.estado === estado;
      const coincideCohorte = !cohorte || p.cohorte === cohorte;
      return coincideNombre && coincideEstado && coincideCohorte;
    });
  }, [practicantes, busqueda, estado, cohorte]);

  function limpiar() {
    setBusqueda("");
    setEstado("");
    setCohorte("");
  }

  return (
    <section>
      <header className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <span className="inline-block bg-sidebar text-white text-xs font-semibold px-3 py-1.5 rounded-md mb-2">
            Administrador
          </span>
          <h1 className="font-display text-2xl font-bold">Gestión y evaluación de practicantes</h1>
          <p className="text-text-secondary text-sm mt-1">Busca y filtra para dar seguimiento al progreso de cada practicante.</p>
        </div>
        <Link to="/frank/notas-masivo" className="btn-ghost">
          Carga Masiva de Seguimiento →
        </Link>
      </header>

      {/* Filtros: fondo claro, como la referencia */}
      <div className="bg-surface border border-border rounded-card p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-disabled-text" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o documento…"
            className="input-field pl-9 bg-white"
          />
        </div>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="input-field w-auto bg-white">
          <option value="">Todos los estados</option>
          {estados.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <select value={cohorte} onChange={(e) => setCohorte(e.target.value)} className="input-field w-auto bg-white">
          <option value="">Todas las cohortes</option>
          {cohortes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button onClick={limpiar} className="btn-ghost">
          <SlidersHorizontal size={14} /> Limpiar
        </button>
        <span className="ml-auto font-mono text-xs text-text-secondary">
          {filtrados.length} de {practicantes.length}
        </span>
      </div>

      {cargando ? (
        <p className="text-sm text-text-secondary">Cargando practicantes…</p>
      ) : error ? (
        <div className="bg-primary-light border border-primary/20 rounded-card p-5 text-sm text-primary flex items-center justify-between gap-4">
          <span>No se pudieron cargar los practicantes: {error}</span>
          <button onClick={cargar} className="btn-ghost !border-primary/30 !text-primary shrink-0">Reintentar</button>
        </div>
      ) : filtrados.length === 0 ? (
        <p className="text-sm text-text-secondary py-8">No hay practicantes que coincidan con el filtro.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((p) => (
            <div key={p.id} className="card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar foto={p.foto} nombres={p.nombres} apellidos={p.apellidos} tamano="md" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate">{p.nombres} {p.apellidos}</h3>
                  <p className="text-xs text-text-secondary truncate">Doc. {p.documento} · {p.cohorte}</p>
                </div>
                <EstadoPill estado={p.estado} />
              </div>
              <Link to={`/frank/practicantes/${p.id}/perfil`} className="btn-primary w-full">
                Perfil
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
