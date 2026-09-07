import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, Bookmark, Check } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const VacanciesList = () => {
  const [vacancies, setVacancies] = useState([]);
  const [savingIds, setSavingIds] = useState(new Set());
  const [applyingIds, setApplyingIds] = useState(new Set());
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API_URL}/api/vacancies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVacancies(data);
        }
      })
      .catch(err => console.error('Error fetching vacancies:', err));
  }, [token]);

  const handleToggleSave = async (vacancyId, isSaved) => {
    if (savingIds.has(vacancyId)) return;
    setSavingIds(prev => new Set(prev).add(vacancyId));

    try {
      if (isSaved) {
        // Remove from saved
        const res = await fetch(`${API_URL}/api/student/saved_vacancies?vacancy_id=${vacancyId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setVacancies(prev => prev.map(v => v.id === vacancyId ? { ...v, saved: false } : v));
        }
      } else {
        // Save
        const res = await fetch(`${API_URL}/api/student/saved_vacancies`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ vacancy_id: vacancyId })
        });
        if (res.ok) {
          setVacancies(prev => prev.map(v => v.id === vacancyId ? { ...v, saved: true } : v));
        }
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(vacancyId);
        return next;
      });
    }
  };

  const handleApply = async (vacancyId) => {
    if (applyingIds.has(vacancyId)) return;
    setApplyingIds(prev => new Set(prev).add(vacancyId));

    try {
      const res = await fetch(`${API_URL}/api/student/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vacancy_id: vacancyId })
      });
      if (res.ok) {
        setVacancies(prev => prev.map(v => v.id === vacancyId ? { ...v, applied: true } : v));
      } else {
        const data = await res.json();
        alert(data.msg || 'Error al postularte');
      }
    } catch (err) {
      console.error('Error applying:', err);
      alert('Error de conexión');
    } finally {
      setApplyingIds(prev => {
        const next = new Set(prev);
        next.delete(vacancyId);
        return next;
      });
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-select">
          Todas las categorias <ChevronDown size={16} />
        </div>
        <div className="filter-select">
          Ubicación <ChevronDown size={16} />
        </div>
        <div className="filter-select">
          Tipo de empleado <ChevronDown size={16} />
        </div>
        <div className="filter-select">
          Fecha de publicación <ChevronDown size={16} />
        </div>
        <div style={{ flex: 1 }}></div>
        <div className="filter-select">
          Mas reciente <ChevronDown size={16} />
        </div>
      </div>

      {/* Grid of Vacancy Cards */}
      <div className="grid-cards">
        {vacancies.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '2rem', color: '#A0A4B8' }}>No hay vacantes disponibles en este momento.</p>
        ) : (
          vacancies.map((vacancy) => (
            <div key={vacancy.id} className="vacancy-card">
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {vacancy.logo_url ? (
                   <div className="company-logo-box" style={{ background: '#F8F9FB', border: '1px solid #E9EBF4' }}>
                     <img src={vacancy.logo_url.startsWith('http') ? vacancy.logo_url : `${API_URL}${vacancy.logo_url}`} alt={vacancy.company} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                   </div>
                ) : (
                  <div className="company-logo-box" style={{ background: '#2563EB' }}>
                    {vacancy.company ? vacancy.company.charAt(0).toUpperCase() : 'E'}
                  </div>
                )}
                
                <div>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{vacancy.title}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {vacancy.company}
                  </div>
                  <div style={{ color: '#A0A4B8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <MapPin size={12} /> {vacancy.location || 'Remoto'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <span className="tag">{vacancy.type1}</span>
                <span className="tag">{vacancy.type2}</span>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flex: 1 }}>
                {vacancy.description}
              </p>

              <div style={{ fontSize: '0.75rem', color: '#A0A4B8', marginTop: '1rem', marginBottom: '1.5rem' }}>
                Publicado el {vacancy.published}
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button 
                  className="btn-icon"
                  onClick={() => handleToggleSave(vacancy.id, vacancy.saved)}
                  disabled={savingIds.has(vacancy.id)}
                  style={{
                    color: vacancy.saved ? 'var(--color-primary)' : undefined,
                    opacity: savingIds.has(vacancy.id) ? 0.5 : 1
                  }}
                >
                  <Bookmark size={18} fill={vacancy.saved ? 'var(--color-primary)' : 'none'} />
                </button>
                
                {vacancy.applied ? (
                  <button className="btn btn-disabled" style={{ flex: 1, display: 'flex', gap: '0.5rem', color: '#888C9F', fontWeight: 600 }}>
                    <Check size={18} /> Postulado
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, opacity: applyingIds.has(vacancy.id) ? 0.7 : 1 }}
                    onClick={() => handleApply(vacancy.id)}
                    disabled={applyingIds.has(vacancy.id)}
                  >
                    {applyingIds.has(vacancy.id) ? 'Postulando...' : 'Postularme'}
                  </button>
                )}
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VacanciesList;
