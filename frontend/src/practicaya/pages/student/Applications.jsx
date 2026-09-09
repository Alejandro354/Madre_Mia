import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Trash2 } from 'lucide-react';
import { deleteApplication, getApplications } from '../../api/applications';
import { tileColor, tileInitial } from '../../utils/tileColor';
import ConfirmModal from '../../components/ConfirmModal';
import SuccessToast from '../../components/SuccessToast';
import ErrorToast from '../../components/ErrorToast';

const TABS = [
  { key: 'todas', label: 'Todas' },
  { key: 'review', label: 'En revisión' },
  { key: 'accepted', label: 'Aceptadas' },
  { key: 'rejected', label: 'Rechazadas' },
];

function bucketOf(estado = '') {
  const e = estado.toLowerCase();
  if (e.startsWith('acepta')) return 'accepted';
  if (e.startsWith('rechaza')) return 'rejected';
  return 'review';
}

function estadoStyle(estado) {
  const bucket = bucketOf(estado);
  if (bucket === 'accepted') return { background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' };
  if (bucket === 'rejected') return { background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' };
  return { background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' };
}

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('todas');
  const [query, setQuery] = useState('');
  const [deleteItem, setDeleteItem] = useState(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getApplications()
      .then((res) => setApplications(res.data.applications))
      .catch(() => setError('No se pudieron cargar tus postulaciones'))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter((a) => {
      if (tab !== 'todas' && bucketOf(a.estado) !== tab) return false;
      if (q && !`${a.cargo} ${a.empresa}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [applications, tab, query]);

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteApplication(deleteItem.id);
      setApplications((prev) => prev.filter((a) => a.id !== deleteItem.id));
      setDeleteItem(null);
      setSuccess('Postulación eliminada');
      setTimeout(() => setSuccess(''), 1600);
    } catch (err) {
      setDeleteItem(null);
      setError(err.response?.data?.msg || 'Ocurrió un error. Intenta de nuevo.');
      setTimeout(() => setError(''), 2600);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
      <div className="tabs-container" style={{ marginBottom: 0 }}>
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filters-search" style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem',
        background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', width: '320px',
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

      {loading ? (
        <p>Cargando...</p>
      ) : applications.length === 0 ? (
        <p>Aún no te has postulado a ninguna vacante. <Link to="/estudiante/vacantes">Ver vacantes</Link></p>
      ) : visible.length === 0 ? (
        <p>Ninguna postulación coincide con este filtro.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {visible.map((a) => (
            <div
              key={a.id}
              className="card candidate-card"
              style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
              onClick={() => navigate(`/estudiante/vacantes/${a.vacancy_id}`, { state: { from: '/estudiante/postulaciones' } })}
            >
              {a.logo_url ? (
                <img src={a.logo_url} alt={a.empresa} style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div className="company-logo-box" style={{ width: '44px', height: '44px', fontSize: '1.1rem', background: tileColor(a.empresa), flexShrink: 0 }}>
                  {tileInitial(a.empresa)}
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{a.cargo}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {a.empresa} · Postulado el {a.fecha_postulacion}
                </p>
              </div>

              <span style={{ padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', ...estadoStyle(a.estado) }}>
                {a.estado}
              </span>

              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setDeleteItem(a)} className="btn-icon" title="Eliminar postulación">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => navigate(`/estudiante/vacantes/${a.vacancy_id}`, { state: { from: '/estudiante/postulaciones' } })} className="btn-icon" title="Ver vacante">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteItem && (
        <ConfirmModal
          title="Eliminar postulación"
          message={`¿Seguro que deseas eliminar tu postulación a "${deleteItem.cargo}" en ${deleteItem.empresa}? Podrás volver a postularte más adelante.`}
          confirmText={busy ? 'Eliminando...' : 'Eliminar'}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
        />
      )}

      {success && <SuccessToast message={success} />}
      {error && <ErrorToast message={error} />}
    </div>
  );
};

export default Applications;
