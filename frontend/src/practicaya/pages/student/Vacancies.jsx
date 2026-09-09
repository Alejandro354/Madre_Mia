import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getVacancies } from '../../api/vacancies';
import { apply } from '../../api/applications';
import { addFavorite, removeFavorite } from '../../api/favorites';
import VacancyCard from '../../components/VacancyCard';
import SuccessToast from '../../components/SuccessToast';
import ErrorToast from '../../components/ErrorToast';

const ALL = '';

function optionsFor(vacancies, field) {
  return [...new Set(vacancies.map((v) => v[field]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
}

const Vacancies = () => {
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [query, setQuery] = useState('');
  const [empresa, setEmpresa] = useState(ALL);
  const [ubicacion, setUbicacion] = useState(ALL);
  const [modalidad, setModalidad] = useState(ALL);
  const [tipoContrato, setTipoContrato] = useState(ALL);

  useEffect(() => {
    getVacancies()
      .then((res) => setVacancies(res.data.vacancies))
      .catch(() => setError('No se pudieron cargar las vacantes'))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vacancies
      .filter((v) => {
        if (q && !`${v.cargo} ${v.empresa}`.toLowerCase().includes(q)) return false;
        if (empresa && v.empresa !== empresa) return false;
        if (ubicacion && v.ubicacion !== ubicacion) return false;
        if (modalidad && v.modalidad !== modalidad) return false;
        if (tipoContrato && v.tipo_contrato !== tipoContrato) return false;
        return true;
      })
      .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));
  }, [vacancies, query, empresa, ubicacion, modalidad, tipoContrato]);

  function patch(id, changes) {
    setVacancies((prev) => prev.map((v) => (v.id === id ? { ...v, ...changes } : v)));
  }

  async function handleFavorite(vacancy) {
    patch(vacancy.id, { guardada: !vacancy.guardada });
    try {
      if (vacancy.guardada) await removeFavorite(vacancy.id);
      else await addFavorite(vacancy.id);
    } catch {
      patch(vacancy.id, { guardada: vacancy.guardada });
      setError('Ocurrió un error. Intenta de nuevo.');
      setTimeout(() => setError(''), 2600);
    }
  }

  async function handleApply(vacancy) {
    setBusyId(vacancy.id);
    try {
      await apply(vacancy.id);
      patch(vacancy.id, { aplicada: true });
      setSuccess('Postulación enviada con éxito');
      setTimeout(() => setSuccess(''), 1600);
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 409) {
        patch(vacancy.id, { aplicada: true });
        setError('Ya te has postulado a esta vacante');
      } else if (data?.missing_section) {
        setError('Completa tu perfil antes de postularte');
      } else {
        setError(data?.msg || 'Ocurrió un error. Intenta de nuevo.');
      }
      setTimeout(() => setError(''), 2600);
    } finally {
      setBusyId(null);
    }
  }

  const filters = [
    { key: 'empresa', label: 'Empresa', value: empresa, set: setEmpresa, options: optionsFor(vacancies, 'empresa') },
    { key: 'ubicacion', label: 'Ubicación', value: ubicacion, set: setUbicacion, options: optionsFor(vacancies, 'ubicacion') },
    { key: 'modalidad', label: 'Modalidad', value: modalidad, set: setModalidad, options: optionsFor(vacancies, 'modalidad') },
    { key: 'tipo_contrato', label: 'Tipo de contrato', value: tipoContrato, set: setTipoContrato, options: optionsFor(vacancies, 'tipo_contrato') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
      <div className="filters-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="filters-group" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {filters.map(({ key, label, value, set, options }) => (
            <div key={key} style={{ position: 'relative' }}>
              <select
                value={value}
                onChange={(e) => set(e.target.value)}
                style={{
                  appearance: 'none',
                  padding: '0.5rem 2rem 0.5rem 0.75rem',
                  background: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: value ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  outline: 'none',
                }}
              >
                <option value="">{label}</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown size={14} color="var(--text-disabled)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          ))}
        </div>

        <div className="filters-search" style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem',
          background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', width: '280px',
        }}>
          <Search size={16} color="var(--text-disabled)" />
          <input
            type="text"
            placeholder="Buscar por cargo o empresa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.85rem', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {loading ? (
        <p>Cargando vacantes...</p>
      ) : vacancies.length === 0 ? (
        <p>No hay vacantes disponibles en este momento.</p>
      ) : visible.length === 0 ? (
        <p>Ninguna vacante coincide con los filtros seleccionados.</p>
      ) : (
        <div className="grid-cards">
          {visible.map((v) => (
            <VacancyCard
              key={v.id}
              vacancy={v}
              busy={busyId === v.id}
              onOpen={() => navigate(`/estudiante/vacantes/${v.id}`, { state: { from: '/estudiante/vacantes' } })}
              onApply={() => handleApply(v)}
              onFavorite={() => handleFavorite(v)}
            />
          ))}
        </div>
      )}

      {success && <SuccessToast message={success} />}
      {error && <ErrorToast message={error} />}
    </div>
  );
};

export default Vacancies;
