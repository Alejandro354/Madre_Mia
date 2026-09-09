import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark, MapPin, Mail, Phone, Calendar, Clock, Download, ExternalLink, GraduationCap, Briefcase } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { resolveMediaUrl } from '../../utils/media';

const BREADCRUMB_LABELS = {
  '/empresa/estudiantes': 'Candidatos',
  '/empresa/candidatos': 'Seleccionados',
  '/empresa/postulaciones': 'Postulaciones',
};

const StudentProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const breadcrumbLabel = BREADCRUMB_LABELS[location.state?.from] || 'Candidatos';

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/practicaya/api/company/students/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCandidate({
            ...data,
            name: data.nombre || 'Candidato',
            // Fallbacks for UI if missing en la BD
            role: data.rol || 'Estudiante',
            location: data.ubicacion || 'Ubicación no especificada',
            description: data.descripcion || 'Sin descripción.',
            skills: data.habilidades ? data.habilidades.split(',').map(s => s.trim()).filter(Boolean) : [],
            email: data.email || 'No especificado',
            phone: data.telefono || 'No especificado',
            educationLevel: data.semestre ? `Semestre ${data.semestre}` : 'Universitario',
            area: data.carrera || 'General',
            portfolio: (data.portfolios || []).map(item => ({
              id: item.id,
              type: item.tipo === 'archivo' ? 'file' : 'link',
              name: item.titulo,
              url: item.enlace_url || resolveMediaUrl(item.archivo_url)
            })),
            socialLinks: data.social_links || []
          });
        }
      } catch (err) {
        console.error("Error fetching candidate:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [id]);

  if (loading) return <p>Cargando perfil...</p>;
  if (!candidate) return <p>Candidato no encontrado.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Breadcrumb / Back Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'white',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <span style={{ fontSize: '14px' }}>
          {breadcrumbLabel} <span style={{ color: '#ccc', margin: '0 0.5rem' }}>/</span> <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{candidate.name}</span>
        </span>
      </div>

      <div className="two-col-layout" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Left Column - Main Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '2rem' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {candidate.foto_url ? (
                  <img
                    src={resolveMediaUrl(candidate.foto_url)}
                    alt={candidate.name}
                    style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    background: '#FFB800',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '2rem',
                    flexShrink: 0
                  }}>
                    {candidate.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {candidate.role}
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {candidate.name}
                  </p>
                  <p style={{ color: '#999', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <MapPin size={12} /> {candidate.location}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50px',
                  border: '1px solid var(--border-color)',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}>
                  <Bookmark size={20} />
                </button>
                <button className="btn btn-primary" style={{ padding: '0.6rem 1.75rem' }} onClick={() => navigate(`/empresa/chat?userId=${id}`)}>
                  Contactar
                </button>
              </div>
            </div>

            {/* Badges */}
            {(candidate.role || candidate.educationLevel) && (
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                {candidate.role && (
                  <span style={{ background: 'var(--bg-tag)', color: 'var(--color-primary)', padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    {candidate.role}
                  </span>
                )}
                <span style={{ background: 'var(--bg-tag)', color: 'var(--color-primary)', padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                  {candidate.educationLevel}
                </span>
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Descripción del perfil
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14px' }}>
                {candidate.description}
              </p>
            </div>

            {/* About the role logic adapted for candidate details */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                Detalles académicos
              </h3>

              <div className="grid-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '500', fontSize: '14px' }}>
                    <GraduationCap size={18} color="var(--text-secondary)" /> Semestre
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px', paddingLeft: '1.6rem' }}>{candidate.semestre || 'No especificado'}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '500', fontSize: '14px' }}>
                    <Briefcase size={18} color="var(--text-secondary)" /> Institución
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px', paddingLeft: '1.6rem' }}>{candidate.universidad || 'No especificada'}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '500', fontSize: '14px' }}>
                    <Clock size={18} color="var(--text-secondary)" /> Ciudad
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px', paddingLeft: '1.6rem' }}>{candidate.location}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '500', fontSize: '14px' }}>
                    <Calendar size={18} color="var(--text-secondary)" /> Fecha de nacimiento
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px', paddingLeft: '1.6rem' }}>{candidate.fecha_nacimiento || 'No especificada'}</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Skills y herramientas
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {candidate.skills.map(skill => (
                  <span key={skill} style={{
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    padding: '0.4rem 1rem',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column - Side Info */}
        <div className="two-col-side" style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1.5rem', flexShrink: 0 }}>
          
          {/* Contact Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Contacto del candidato
            </h3>
            
            <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '1rem', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.5rem'
              }}>
                <Mail size={20} color="var(--color-primary)" />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{candidate.email}</span>
              </div>
              
              <div style={{ 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px', 
                padding: '1rem', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.5rem'
              }}>
                <Phone size={20} color="var(--color-primary)" />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{candidate.phone}</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Lo que necesitas saber
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Nivel de estudios</span>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{candidate.educationLevel}</span>
              </div>
              <div style={{ width: '100%', height: '1px', background: 'var(--border-color)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Institución</span>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{candidate.universidad || 'No especificada'}</span>
              </div>
              <div style={{ width: '100%', height: '1px', background: 'var(--border-color)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Rol que busca</span>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{candidate.role}</span>
              </div>
            </div>
          </div>

          {/* Portfolio */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Portafolio y Enlaces
            </h3>

            {candidate.portfolio.length === 0 && candidate.socialLinks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Este candidato aún no ha agregado portafolio ni redes sociales.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {candidate.portfolio.map(item => (
                  <a key={`p-${item.id}`} href={item.url} target="_blank" rel="noreferrer" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                      {item.type === 'file' ? <Download size={16} color="var(--color-primary)" /> : <ExternalLink size={16} color="var(--color-primary)" />}
                      {item.name}
                    </div>
                  </a>
                ))}
                {candidate.socialLinks.map(link => (
                  <a key={`s-${link.id}`} href={link.url} target="_blank" rel="noreferrer" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', textTransform: 'capitalize' }}>
                      <ExternalLink size={16} color="var(--color-primary)" />
                      {link.red}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
