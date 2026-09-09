import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, MessageSquare, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resolveMediaUrl } from '../../utils/media';

const CANDIDATE_STATES = ['En proceso', 'Contactado', 'Entrevista', 'Contratado', 'Descartado'];

const ESTADO_STYLE = {
  'En proceso': { background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
  'Contactado': { background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' },
  'Entrevista': { background: 'rgba(56, 189, 248, 0.1)', color: '#0EA5E9' },
  'Contratado': { background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
  'Descartado': { background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
};

const SavedCandidates = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [selectedFilters, setSelectedFilters] = useState({
    perfil: '',
    habilidades: '',
    estado: ''
  });

  const fetchSavedCandidates = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/practicaya/api/company/saved_candidates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCandidates(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedCandidates();
  }, []);

  const handleRemoveCandidate = async (studentId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/practicaya/api/company/saved_candidates?student_id=${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSavedCandidates(); // Refresh list
      } else {
        const data = await res.json();
        alert(data.msg || 'Error al eliminar');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  const handleChangeEstado = async (studentId, estado) => {
    setUpdatingId(studentId);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/practicaya/api/company/saved_candidates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ student_id: studentId, estado })
      });
      if (res.ok) {
        setCandidates(prev => prev.map(c => (c.id === studentId ? { ...c, estado } : c)));
      } else {
        const data = await res.json();
        alert(data.msg || 'Error al actualizar el estado');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setUpdatingId(null);
    }
  };

  const getRandomColor = (id) => {
    const colors = ['#FFB800', '#638FE9', '#FF1837', '#7C3AED', '#10B981'];
    return colors[id % colors.length];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
      
      {/* Filters Row */}
      <div className="filters-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>

        <div className="filters-group" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <select
              className="filter-select"
              value={selectedFilters.perfil}
              onChange={(e) => setSelectedFilters({...selectedFilters, perfil: e.target.value})}
              style={{
                appearance: 'none',
                padding: '0.5rem 2rem 0.5rem 0.75rem',
                background: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '14px',
                color: selectedFilters.perfil ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                outline: 'none'
              }}
            >
              <option value="">Perfil profesional</option>
              <option value="desarrollo">Desarrollo</option>
              <option value="diseno">Diseño</option>
            </select>
            <ChevronDown size={14} color="var(--text-disabled)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <select
              className="filter-select"
              value={selectedFilters.habilidades}
              onChange={(e) => setSelectedFilters({...selectedFilters, habilidades: e.target.value})}
              style={{
                appearance: 'none',
                padding: '0.5rem 2rem 0.5rem 0.75rem',
                background: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '14px',
                color: selectedFilters.habilidades ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                outline: 'none'
              }}
            >
              <option value="">Habilidades</option>
              <option value="react">React</option>
              <option value="figma">Figma</option>
            </select>
            <ChevronDown size={14} color="var(--text-disabled)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <select
              className="filter-select"
              value={selectedFilters.estado}
              onChange={(e) => setSelectedFilters({...selectedFilters, estado: e.target.value})}
              style={{
                appearance: 'none',
                padding: '0.5rem 2rem 0.5rem 0.75rem',
                background: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '14px',
                color: selectedFilters.estado ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                outline: 'none'
              }}
            >
              <option value="">Estado</option>
              <option value="activo">Activo</option>
              <option value="proceso">En proceso</option>
            </select>
            <ChevronDown size={14} color="var(--text-disabled)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        <div className="filters-search" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          width: '280px'
        }}>
          <Search size={16} color="var(--text-disabled)" />
          <input
            type="text"
            placeholder="Buscar seleccionados..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: '0.85rem',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

      {/* Table Header */}
      <div className="saved-table-header" style={{
        display: 'grid',
        gridTemplateColumns: '3fr 1.5fr 1.5fr 1fr 1.5fr 1fr 1fr',
        gap: '1rem',
        padding: '1rem',
        background: '#F8F9FA',
        borderRadius: '8px',
        color: '#888',
        fontSize: '12px',
        fontWeight: '600',
        alignItems: 'center'
      }}>
        <div>Estudiante</div>
        <div>Programa</div>
        <div>Habilidades</div>
        <div style={{ textAlign: 'center' }}>Promedio</div>
        <div>Disponibilidad</div>
        <div>Estado</div>
        <div style={{ textAlign: 'right', paddingRight: '1rem' }}>Acciones</div>
      </div>

      {/* Table Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <p style={{ padding: '1rem' }}>Cargando...</p>
        ) : candidates.length === 0 ? (
          <p style={{ padding: '1rem' }}>No hay candidatos seleccionados aún.</p>
        ) : (
          candidates.map((candidate) => {
            const habilidadesList = candidate.habilidades ? candidate.habilidades.split(',').map(s=>s.trim()).filter(Boolean) : [];
            const tags = habilidadesList.slice(0, 2);
            const initials = candidate.nombre ? candidate.nombre.charAt(0).toUpperCase() : 'E';
            const color = getRandomColor(candidate.id);
            const estadoStyle = ESTADO_STYLE[candidate.estado] || ESTADO_STYLE['En proceso'];

            return (
              <div key={candidate.id} className="saved-table-row candidate-card" style={{
                display: 'grid',
                gridTemplateColumns: '3fr 1.5fr 1.5fr 1fr 1.5fr 1fr 1fr',
                gap: '1rem',
                padding: '1.25rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                alignItems: 'center',
                background: 'white',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/empresa/estudiantes/${candidate.id}`, { state: { from: '/empresa/candidatos' } })}
              >
                
                {/* Estudiante */}
                <div className="field-estudiante" style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                  {candidate.foto_url ? (
                    <img
                      src={resolveMediaUrl(candidate.foto_url)}
                      alt={candidate.nombre}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      flexShrink: 0
                    }}>
                      {initials}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.nombre}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{candidate.ubicacion || 'Ubicación'}</span>
                  </div>
                </div>

                {/* Programa */}
                <div className="field-programa" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="mobile-field-label">Programa</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', whiteSpace: 'pre-line', lineHeight: '1.2' }}>{candidate.carrera || 'Carrera N/A'}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '0.2rem' }}>{candidate.semestre || 'Semestre N/A'}</span>
                </div>

                {/* Habilidades */}
                <div className="field-habilidades" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="mobile-field-label" style={{ width: '100%' }}>Habilidades</span>
                  {tags.map(hab => (
                    <span key={hab} style={{ background: '#F3F4F6', color: 'var(--text-secondary)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500' }}>
                      {hab}
                    </span>
                  ))}
                  {habilidadesList.length > 2 && (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '500' }}>+{habilidadesList.length - 2}</span>
                  )}
                </div>

                {/* Promedio */}
                <div className="field-promedio" style={{ textAlign: 'center', color: '#10B981', fontWeight: 'bold', fontSize: '14px' }}>
                  <span className="mobile-field-label">Promedio</span>
                  {candidate.promedio || 'N/A'}
                </div>

                {/* Disponibilidad */}
                <div className="field-disponibilidad" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  <span className="mobile-field-label">Disponibilidad</span>
                  {candidate.disponibilidad || 'N/A'}
                </div>

                {/* Estado */}
                <div className="field-estado" onClick={(e) => e.stopPropagation()}>
                  <span className="mobile-field-label">Estado</span>
                  <select
                    value={candidate.estado || 'En proceso'}
                    disabled={updatingId === candidate.id}
                    onChange={(e) => handleChangeEstado(candidate.id, e.target.value)}
                    style={{
                      ...estadoStyle,
                      border: 'none',
                      padding: '0.35rem 0.6rem',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      cursor: updatingId === candidate.id ? 'wait' : 'pointer',
                      outline: 'none',
                    }}
                  >
                    {CANDIDATE_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Acciones */}
                <div className="field-acciones" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingRight: '1rem' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/empresa/chat?userId=${candidate.id}`);
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                  >
                    <MessageSquare size={18} />
                  </button>
                  <button 
                    onClick={(e) => handleRemoveCandidate(candidate.id, e)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      </div>
    </div>
  );
};

export default SavedCandidates;
