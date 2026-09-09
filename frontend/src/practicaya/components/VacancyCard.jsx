import React from 'react';
import { Bookmark, Check, MapPin } from 'lucide-react';
import { tileColor, tileInitial } from '../utils/tileColor';

function publishedLabel(value) {
  if (!value) return '';
  const published = new Date(value);
  if (Number.isNaN(published.getTime())) return value;

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((startOfDay(new Date()) - startOfDay(published)) / (24 * 60 * 60 * 1000));

  if (days <= 0) return 'Publicada hoy';
  if (days === 1) return 'Publicada ayer';
  if (days < 30) return `Publicada hace ${days} días`;
  return `Publicada el ${published.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}`;
}

const VacancyCard = ({ vacancy, busy, onOpen, onApply, onFavorite }) => {
  const { cargo, empresa, ubicacion, modalidad, tipo_contrato, descripcion, guardada, aplicada, logo_url } = vacancy;

  return (
    <div className="card vacancy-card" style={{ gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', cursor: 'pointer' }} onClick={onOpen}>
        {logo_url ? (
          <img src={logo_url} alt={empresa} style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div className="company-logo-box" style={{ background: tileColor(empresa), flexShrink: 0 }}>
            {tileInitial(empresa)}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>{cargo}</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>{empresa}</p>
          {ubicacion && (
            <p style={{ fontSize: '12px', color: '#999', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
              <MapPin size={12} /> {ubicacion}
            </p>
          )}
        </div>
      </div>

      {(modalidad || tipo_contrato) && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {modalidad && <span className="tag">{modalidad}</span>}
          {tipo_contrato && <span className="tag">{tipo_contrato}</span>}
        </div>
      )}

      {descripcion && (
        <p style={{
          fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {descripcion}
        </p>
      )}

      <span style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>{publishedLabel(vacancy.fecha_publicacion)}</span>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
        <button
          onClick={onFavorite}
          title={guardada ? 'Quitar de guardados' : 'Guardar'}
          className="btn-icon"
          style={guardada ? { color: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : undefined}
        >
          <Bookmark size={18} fill={guardada ? 'currentColor' : 'none'} />
        </button>

        {aplicada ? (
          <button className="btn btn-disabled" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }} disabled>
            <Check size={16} /> Postulado
          </button>
        ) : (
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onApply} disabled={busy}>
            {busy ? 'Enviando...' : 'Postularme'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VacancyCard;
