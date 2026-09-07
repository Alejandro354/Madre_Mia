import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, BookOpen, MapPin, Star, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentsList = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState(new Set());
  
  const [selectedFilters, setSelectedFilters] = useState({
    perfil: '',
    habilidades: '',
    ubicacion: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/students', {
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
    fetchStudents();
  }, []);

  const handleSaveCandidate = async (studentId, isSaved) => {
    if (savingIds.has(studentId)) return;

    setSavingIds(prev => new Set(prev).add(studentId));
    const token = localStorage.getItem('token');
    try {
      const url = isSaved 
        ? `http://localhost:5000/api/company/saved_candidates?student_id=${studentId}`
        : 'http://localhost:5000/api/company/saved_candidates';
        
      const options = {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      if (!isSaved) {
        options.body = JSON.stringify({ student_id: studentId });
      }

      const res = await fetch(url, options);

      if (res.ok) {
        // Update local state to reflect the change without refetching
        setCandidates(prev => prev.map(s => 
          s.id === studentId ? { ...s, is_saved: !isSaved } : s
        ));
      } else {
        const data = await res.json();
        alert(data.msg || 'Error al guardar');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
    }
  };

  const getRandomColor = (id) => {
    const colors = ['#FFB800', '#638FE9', '#FF1837', '#7C3AED', '#10B981'];
    return colors[id % colors.length];
  };

  // Build filter option lists from the real candidate data
  const carreraOptions = [...new Set(candidates.map(c => c.carrera).filter(Boolean))].sort();
  const ubicacionOptions = [...new Set(candidates.map(c => c.ubicacion).filter(Boolean))].sort();
  const habilidadOptions = [...new Set(
    candidates.flatMap(c => c.habilidades ? c.habilidades.split(',').map(h => h.trim()).filter(Boolean) : [])
  )].sort();

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = !searchQuery.trim() ||
      (candidate.nombre || '').toLowerCase().includes(searchQuery.trim().toLowerCase());
    const matchesPerfil = !selectedFilters.perfil || candidate.carrera === selectedFilters.perfil;
    const matchesUbicacion = !selectedFilters.ubicacion || candidate.ubicacion === selectedFilters.ubicacion;
    const matchesHabilidad = !selectedFilters.habilidades ||
      (candidate.habilidades || '').toLowerCase().includes(selectedFilters.habilidades.toLowerCase());
    return matchesSearch && matchesPerfil && matchesUbicacion && matchesHabilidad;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>

      {/* Filter Bar */}
      <div className="filters-row" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div className="filters-group" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { key: 'perfil', label: 'Perfil profesional', options: carreraOptions },
            { key: 'habilidades', label: 'Habilidades', options: habilidadOptions },
            { key: 'ubicacion', label: 'Ubicación', options: ubicacionOptions }
          ].map(({ key, label, options }) => (
            <div key={key} style={{ position: 'relative' }}>
              <select
                value={selectedFilters[key]}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, [key]: e.target.value }))}
                style={{
                  appearance: 'none',
                  padding: '0.5rem 2rem 0.5rem 0.75rem',
                  background: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: selectedFilters[key] ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  outline: 'none'
                }}
              >
                <option value="">{label}</option>
                {options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown size={14} color="var(--text-disabled)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          ))}
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
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {loading ? (
        <p>Cargando candidatos...</p>
      ) : candidates.length === 0 ? (
        <p>No hay estudiantes registrados por el momento.</p>
      ) : filteredCandidates.length === 0 ? (
        <p>Ningún candidato coincide con los filtros seleccionados.</p>
      ) : (
        /* Candidates Grid (up to 4 per row; cards keep a minimum size and wrap instead of shrinking) */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredCandidates.map((candidate) => {
            const habilidadesList = candidate.habilidades ? candidate.habilidades.split(',').map(s=>s.trim()).filter(Boolean) : [];
            const tags = habilidadesList.slice(0, 2); // Show only first 2 tags
            const initials = candidate.nombre ? candidate.nombre.charAt(0).toUpperCase() : 'E';
            const color = getRandomColor(candidate.id);

            return (
              <div key={candidate.id} className="card candidate-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.125rem'
                    }}>
                      {initials}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.1rem' }}>
                        {candidate.nombre} {candidate.apellidos}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {candidate.carrera || 'Estudiante'}
                      </p>
                      {candidate.ubicacion && (
                        <p style={{ fontSize: '0.75rem', color: '#999', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                          <MapPin size={12} />
                          {candidate.ubicacion}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <input
                    type="checkbox"
                    title="Seleccionar"
                    checked={candidate.is_saved || false}
                    disabled={savingIds.has(candidate.id)}
                    onChange={() => {
                      handleSaveCandidate(candidate.id, candidate.is_saved);
                    }}
                    style={{
                      width: '15px',
                      height: '15px',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: savingIds.has(candidate.id) ? 'wait' : 'pointer',
                      accentColor: 'var(--color-primary)',
                      opacity: savingIds.has(candidate.id) ? 0.5 : 1
                    }}
                  />
                </div>

                {/* Info List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    <BookOpen size={14} color="#999" />
                    <span>{candidate.semestre || 'Semestre N/A'} - {candidate.universidad || 'Universidad'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    <MapPin size={14} color="#999" />
                    <span>{candidate.ubicacion || 'Ubicación'} - {candidate.disponibilidad || 'Disponibilidad'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    <Star size={14} color="#999" />
                    <span>Promedio: {candidate.promedio || 'N/A'}</span>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {tags.map((tag, idx) => (
                    <span key={idx} style={{
                      background: 'var(--bg-tag)',
                      color: 'var(--color-primary)',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {tag}
                    </span>
                  ))}
                  {habilidadesList.length > 2 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>
                      +{habilidadesList.length - 2}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {candidate.estado || 'Activo'}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => navigate(`/empresa/chat?userId=${candidate.id}`)}
                      style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.6rem',
                      background: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '50px',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)'
                    }}>
                      <MessageSquare size={20} />
                    </button>
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1, padding: '0.6rem' }}
                      onClick={() => navigate(`/empresa/estudiantes/${candidate.id}`)}
                    >
                      Ver perfil
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentsList;
