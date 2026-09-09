import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, X, MapPin, BookOpen } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/media';

const API_URL = '/practicaya';

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

const VacancyApplicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchApplicants = () => {
    setLoading(true);
    fetch(`${API_URL}/api/company/vacancies/${id}/applications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setVacancy(data.vacancy);
        setApplications(data.applications || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplicants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
        <button onClick={() => navigate(-1)} className="btn-icon" style={{ width: '32px', height: '32px' }}>
          <ArrowLeft size={16} />
        </button>
        <span style={{ fontSize: '14px' }}>
          Mis Vacantes <span style={{ color: '#ccc', margin: '0 0.5rem' }}>/</span>{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {vacancy ? `Postulantes a ${vacancy.cargo}` : 'Postulantes'}
          </span>
        </span>
      </div>

      {loading ? (
        <p>Cargando postulantes...</p>
      ) : applications.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Aún no hay postulantes para esta vacante.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.map((a) => {
            const s = a.student;
            if (!s) return null;
            const initials = (s.nombre || 'E').charAt(0).toUpperCase();
            const habilidades = s.habilidades ? s.habilidades.split(',').map(h => h.trim()).filter(Boolean) : [];

            return (
              <div
                key={a.id}
                className="card candidate-card"
                style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap', cursor: 'pointer' }}
                onClick={() => navigate(`/empresa/estudiantes/${s.user_id}`, { state: { from: '/empresa/postulaciones' } })}
              >
                {s.foto_url ? (
                  <img
                    src={resolveMediaUrl(s.foto_url)}
                    alt={s.nombre}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
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
                  {habilidades.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                      {habilidades.slice(0, 4).map((h) => (
                        <span key={h} className="tag">{h}</span>
                      ))}
                    </div>
                  )}
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

export default VacancyApplicants;
