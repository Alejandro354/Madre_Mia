import React, { useEffect, useMemo, useState } from 'react';
import { Check, X, ChevronDown, MapPin, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resolveMediaUrl } from '../../utils/media';

const API_URL = '/practicaya';

const TABS = [
  { key: 'todas', label: 'Todas' },
  { key: 'Enviada', label: 'Nuevas' },
  { key: 'En revisión', label: 'En revisión' },
  { key: 'Aceptada', label: 'Aceptadas' },
  { key: 'Rechazada', label: 'Rechazadas' },
];

const STATE_STYLE = {
  'Enviada': { background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
  'En revisión': { background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' },
  'Aceptada': { background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
  'Rechazada': { background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
};

const getRandomColor = (id) => {
  const colors = ['#FFB800', '#638FE9', '#FF1837', '#7C3AED', '#10B981'];
  return colors[id % colors.length];
};

const CompanyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('todas');
  const [vacancyFilter, setVacancyFilter] = useState('');
  const [busyId, setBusyId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchApplications = () => {
    setLoading(true);
    fetch(`${API_URL}/api/company/applications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setApplications(data.applications || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vacancyOptions = useMemo(
    () => [...new Set(applications.map(a => a.cargo).filter(Boolean))].sort(),
    [applications]
  );

  const visible = useMemo(() => {
    return applications.filter(a => {
      if (tab !== 'todas' && a.estado !== tab) return false;
      if (vacancyFilter && a.cargo !== vacancyFilter) return false;
      return true;
    });
  }, [applications, tab, vacancyFilter]);

  const handleUpdateEstado = async (applicationId, estado) => {
    setBusyId(applicationId);
    try {
      const res = await fetch(`${API_URL}/api/company/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado })
      });
      if (res.ok) {
        setApplications(prev => prev.map(a => (a.id === applicationId ? { ...a, estado } : a)));
      } else {
        const data = await res.json();
        alert(data.msg || 'Error al actualizar el estado');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setBusyId(null);
    }
  };

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

      {vacancyOptions.length > 0 && (
        <div style={{ position: 'relative', width: 'fit-content' }}>
          <select
            value={vacancyFilter}
            onChange={(e) => setVacancyFilter(e.target.value)}
            style={{
              appearance: 'none', padding: '0.5rem 2rem 0.5rem 0.75rem', background: 'white',
              border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '14px',
              color: vacancyFilter ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">Todas las vacantes</option>
            {vacancyOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} color="var(--text-disabled)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      )}

      {loading ? (
        <p>Cargando postulaciones...</p>
      ) : applications.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Aún no has recibido postulaciones.</p>
        </div>
      ) : visible.length === 0 ? (
        <p>Ninguna postulación coincide con este filtro.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {visible.map((a) => {
            const s = a.student;
            if (!s) return null;
            const initials = (s.nombre || 'E').charAt(0).toUpperCase();

            return (
              <div
                key={a.id}
                className="card candidate-card"
                style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap', cursor: 'pointer' }}
                onClick={() => navigate(`/empresa/estudiantes/${s.user_id}`, { state: { from: '/empresa/postulaciones' } })}
              >
                {s.foto_url ? (
                  <img src={resolveMediaUrl(s.foto_url)} alt={s.nombre} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%', background: getRandomColor(s.user_id),
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.125rem', flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>{s.nombre}</h3>
                    <span style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', ...(STATE_STYLE[a.estado] || STATE_STYLE['Enviada']) }}>
                      {a.estado}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.3rem' }}>
                    Postuló a: {a.cargo}
                  </p>
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '12px', marginTop: '0.4rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <BookOpen size={13} /> {s.programa || 'Estudiante'} {s.semestre ? `· Semestre ${s.semestre}` : ''}
                    </span>
                    {s.ciudad && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} /> {s.ciudad}
                      </span>
                    )}
                    <span>Postulado el {a.fecha_postulacion}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    disabled={busyId === a.id || a.estado === 'Aceptada'}
                    onClick={() => handleUpdateEstado(a.id, 'Aceptada')}
                  >
                    <Check size={14} /> Aceptar
                  </button>
                  <button
                    className="btn-icon"
                    style={{ color: '#d03b3b' }}
                    title="Rechazar"
                    disabled={busyId === a.id || a.estado === 'Rechazada'}
                    onClick={() => handleUpdateEstado(a.id, 'Rechazada')}
                  >
                    <X size={16} />
                  </button>
                  {a.estado !== 'Enviada' && a.estado !== 'En revisión' && (
                    <button
                      className="btn"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}
                      disabled={busyId === a.id}
                      onClick={() => handleUpdateEstado(a.id, 'En revisión')}
                    >
                      Revertir
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompanyApplications;
