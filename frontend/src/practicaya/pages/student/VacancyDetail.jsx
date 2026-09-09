import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Bookmark, MapPin, Calendar, Clock, Monitor, Sparkles } from 'lucide-react';
import { getVacancy } from '../../api/vacancies';
import { apply } from '../../api/applications';
import { addFavorite, removeFavorite } from '../../api/favorites';
import { tileColor, tileInitial } from '../../utils/tileColor';
import { splitItems, splitSentences } from '../../utils/text';
import SuccessToast from '../../components/SuccessToast';
import ErrorToast from '../../components/ErrorToast';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 500, color: 'var(--text-primary)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

const BREADCRUMB_LABELS = {
  '/estudiante/vacantes': 'Vacantes',
  '/estudiante/postulaciones': 'Mis postulaciones',
  '/estudiante/guardados': 'Guardados',
};

const VacancyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const breadcrumbLabel = BREADCRUMB_LABELS[location.state?.from] || 'Vacantes';
  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getVacancy(id)
      .then((res) => setVacancy(res.data.vacancy))
      .catch(() => setError('No se pudo cargar la vacante'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleFavorite() {
    try {
      if (vacancy.guardada) {
        await removeFavorite(vacancy.id);
        setSuccess('Vacante quitada de guardados');
      } else {
        await addFavorite(vacancy.id);
        setSuccess('Vacante guardada');
      }
      setVacancy({ ...vacancy, guardada: !vacancy.guardada });
      setTimeout(() => setSuccess(''), 1600);
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.');
      setTimeout(() => setError(''), 2600);
    }
  }

  async function handleApply() {
    setBusy(true);
    try {
      await apply(vacancy.id);
      setVacancy({ ...vacancy, aplicada: true });
      setSuccess('Postulación enviada con éxito');
      setTimeout(() => setSuccess(''), 1600);
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 409) {
        setVacancy({ ...vacancy, aplicada: true });
        setError('Ya te has postulado a esta vacante');
      } else if (data?.missing_section) {
        setError('Completa tu perfil antes de postularte');
      } else {
        setError(data?.msg || 'Ocurrió un error. Intenta de nuevo.');
      }
      setTimeout(() => setError(''), 2600);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p>Cargando vacante...</p>;
  if (!vacancy) return <p>Vacante no encontrada. <Link to="/estudiante/vacantes">Ver vacantes</Link></p>;

  const requisitos = splitSentences(vacancy.requisitos);
  const beneficios = splitItems(vacancy.beneficios);
  const skills = vacancy.skills || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
        <button onClick={() => navigate(-1)} className="btn-icon" style={{ width: '32px', height: '32px' }}>
          <ArrowLeft size={16} />
        </button>
        <span style={{ fontSize: '14px' }}>
          {breadcrumbLabel} <span style={{ color: '#ccc', margin: '0 0.5rem' }}>/</span>{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{vacancy.cargo}</span>
        </span>
      </div>

      <div className="two-col-layout" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {vacancy.logo_url ? (
                  <img src={vacancy.logo_url} alt={vacancy.empresa} style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }} />
                ) : (
                  <div className="company-logo-box" style={{ width: '64px', height: '64px', fontSize: '1.75rem', background: tileColor(vacancy.empresa) }}>
                    {tileInitial(vacancy.empresa)}
                  </div>
                )}
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{vacancy.cargo}</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>{vacancy.empresa}</p>
                  <p style={{ color: '#999', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <MapPin size={12} /> {vacancy.ubicacion}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={handleFavorite}
                  className="btn-icon"
                  title={vacancy.guardada ? 'Quitar de guardados' : 'Guardar'}
                  style={vacancy.guardada ? { color: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : undefined}
                >
                  <Bookmark size={20} fill={vacancy.guardada ? 'currentColor' : 'none'} />
                </button>
                <button
                  className={vacancy.aplicada ? 'btn btn-disabled' : 'btn btn-primary'}
                  style={{ padding: '0.6rem 1.75rem' }}
                  onClick={handleApply}
                  disabled={vacancy.aplicada || busy}
                >
                  {vacancy.aplicada ? 'Ya te has postulado' : busy ? 'Enviando...' : 'Postularme'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
              {vacancy.modalidad && <span className="tag">{vacancy.modalidad}</span>}
              {vacancy.tipo_contrato && <span className="tag">{vacancy.tipo_contrato}</span>}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>Descripción del cargo</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '14px' }}>{vacancy.descripcion}</p>
            </div>

            {requisitos.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>Requisitos</h3>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.8 }}>
                  {requisitos.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </div>
            )}

            <div style={{ marginBottom: skills.length ? '2rem' : 0 }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Sobre el rol</h3>
              <div className="grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px' }}>
                    <Clock size={18} color="var(--text-secondary)" /> Modalidad
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px', paddingLeft: '1.6rem' }}>{vacancy.modalidad || 'No especificada'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px' }}>
                    <Monitor size={18} color="var(--text-secondary)" /> Tipo de contrato
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px', paddingLeft: '1.6rem' }}>{vacancy.tipo_contrato || 'No especificado'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: 500, fontSize: '14px' }}>
                    <Calendar size={18} color="var(--text-secondary)" /> Fecha límite
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px', paddingLeft: '1.6rem' }}>{formatDate(vacancy.fecha_limite) || 'No especificada'}</span>
                </div>
              </div>
            </div>

            {skills.length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>Skills y herramientas</h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {skills.map((s) => (
                    <span key={s} style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '12px' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="two-col-side" style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem', flexShrink: 0 }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Lo que necesitas saber</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <InfoRow label="Experiencia" value={vacancy.experiencia} />
              <div style={{ width: '100%', height: '1px', background: 'var(--border-color)' }} />
              <InfoRow label="Nivel de estudios" value={vacancy.nivel_estudios} />
              <div style={{ width: '100%', height: '1px', background: 'var(--border-color)' }} />
              <InfoRow label="Área" value={vacancy.area} />
              <div style={{ width: '100%', height: '1px', background: 'var(--border-color)' }} />
              <InfoRow label="Industria" value={vacancy.industria} />
            </div>
          </div>

          {beneficios.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Beneficios</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {beneficios.map((b) => (
                  <span key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <Sparkles size={14} color="var(--color-primary)" /> {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {success && <SuccessToast message={success} />}
      {error && <ErrorToast message={error} />}
    </div>
  );
};

export default VacancyDetail;
