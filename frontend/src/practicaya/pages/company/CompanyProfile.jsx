import React, { useState, useRef, useEffect } from 'react';
import { Edit, MapPin, Mail, Camera, X, Plus, Trash2, Briefcase, Users, Building2, Layers, Globe, Info, Calendar, Link2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SuccessToast from '../../components/SuccessToast';
import ErrorToast from '../../components/ErrorToast';
import { resizeImageToDataUrl } from '../../utils/resizeImage';
import { validateImageFile } from '../../utils/validateImage';

const emptyVacancyForm = {
  cargo: '', descripcion: '', requisitos: '', beneficios: '', ubicacion: '',
  modalidad: 'Presencial', tipo_contrato: 'Tiempo completo'
};

const API_URL = '/practicaya';

const CompanyProfileView = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('perfil'); // 'perfil' | 'vacantes'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showPhotoSuccess, setShowPhotoSuccess] = useState(false);
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState('');
  const [photoError, setPhotoError] = useState('');

  // State for profile picture (logo)
  const [profilePic, setProfilePic] = useState(localStorage.getItem('userProfilePic') || 'https://ui-avatars.com/api/?name=Tech+Solutions&background=random');
  const fileInputRef = useRef(null);

  // State for cover banner
  const [bannerPic, setBannerPic] = useState('');
  const bannerInputRef = useRef(null);

  // State for company data
  const [profileData, setProfileData] = useState({
    nombre: 'Tech Solutions S.A.',
    industria: '',
    ubicacion: 'Medellín, Colombia',
    email: 'empresa@practicompu.com',
    descripcion: '',
    sitio_web: '',
    tamano_empresa: '',
    anio_fundacion: '',
    linkedin: '',
    instagram: ''
  });

  // State for vacancy management
  const [vacancies, setVacancies] = useState([]);
  const [loadingVacancies, setLoadingVacancies] = useState(true);
  const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);
  const [savingVacancy, setSavingVacancy] = useState(false);
  const [vacancyForm, setVacancyForm] = useState(emptyVacancyForm);
  const [editingVacancyId, setEditingVacancyId] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // Load profile data on mount
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/company/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setProfileData({
        nombre: data.nombre_empresa || 'Tech Solutions S.A.',
        industria: data.industria || '',
        ubicacion: data.ubicacion || 'Medellín, Colombia',
        email: user.email || 'empresa@practicompu.com',
        descripcion: data.descripcion || '',
        sitio_web: data.sitio_web || '',
        tamano_empresa: data.tamano_empresa || '',
        anio_fundacion: data.anio_fundacion || '',
        linkedin: data.linkedin || '',
        instagram: data.instagram || ''
      });
      if (data.logo_url) {
        setProfilePic(data.logo_url);
        localStorage.setItem('userProfilePic', data.logo_url);
        window.dispatchEvent(new Event('profilePicUpdated'));
      }
      if (data.banner_url) {
        setBannerPic(data.banner_url);
      }
    })
    .catch(err => console.error(err));
  }, [token, user.email]);

  // Load vacancies on mount
  const fetchVacancies = () => {
    if (!token) return;
    setLoadingVacancies(true);
    fetch(`${API_URL}/api/company/vacancies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setVacancies(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingVacancies(false));
  };

  useEffect(() => {
    fetchVacancies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Handle Profile Picture Upload
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      e.target.value = '';
      setPhotoError(validationError);
      setTimeout(() => setPhotoError(''), 2600);
      return;
    }

    try {
      const base64data = await resizeImageToDataUrl(file, 300, 300);
      setProfilePic(base64data);
      localStorage.setItem('userProfilePic', base64data);
      window.dispatchEvent(new Event('profilePicUpdated'));

      // Save to backend
      await fetch(`${API_URL}/api/company/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ logo_url: base64data })
      });
      setPhotoSuccessMsg('Logo actualizado exitosamente');
      setShowPhotoSuccess(true);
      setTimeout(() => setShowPhotoSuccess(false), 1000);
    } catch (err) {
      console.error("Error saving logo", err);
    }
  };

  // Handle Banner Upload
  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      e.target.value = '';
      setPhotoError(validationError);
      setTimeout(() => setPhotoError(''), 2600);
      return;
    }

    try {
      const base64data = await resizeImageToDataUrl(file, 960, 300);
      setBannerPic(base64data);

      await fetch(`${API_URL}/api/company/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ banner_url: base64data })
      });
      setPhotoSuccessMsg('Banner actualizado exitosamente');
      setShowPhotoSuccess(true);
      setTimeout(() => setShowPhotoSuccess(false), 1000);
    } catch (err) {
      console.error("Error saving banner", err);
    }
  };

  // Handle Modal form
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/company/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre_empresa: profileData.nombre,
          descripcion: profileData.descripcion,
          ubicacion: profileData.ubicacion,
          sitio_web: profileData.sitio_web,
          industria: profileData.industria,
          tamano_empresa: profileData.tamano_empresa,
          anio_fundacion: profileData.anio_fundacion,
          linkedin: profileData.linkedin,
          instagram: profileData.instagram
        })
      });
      if (response.ok) {
        setIsEditModalOpen(false);
        window.dispatchEvent(new Event('profileNameUpdated'));
        localStorage.setItem('userName', profileData.nombre);
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 1000);
      } else {
        const errData = await response.json();
        console.error('Error al guardar el perfil:', errData);
        alert(`Error al guardar: ${errData.msg || response.statusText}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error de red al guardar el perfil');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleVacancyInputChange = (e) => {
    const { name, value } = e.target;
    setVacancyForm(prev => ({ ...prev, [name]: value }));
  };

  const openCreateVacancy = () => {
    setEditingVacancyId(null);
    setVacancyForm(emptyVacancyForm);
    setIsVacancyModalOpen(true);
  };

  const openEditVacancy = (v) => {
    setEditingVacancyId(v.id);
    setVacancyForm({
      cargo: v.cargo || '',
      descripcion: v.descripcion || '',
      requisitos: v.requisitos || '',
      beneficios: v.beneficios || '',
      ubicacion: v.ubicacion || '',
      modalidad: v.modalidad || 'Presencial',
      tipo_contrato: v.tipo_contrato || 'Tiempo completo'
    });
    setIsVacancyModalOpen(true);
  };

  const handleSaveVacancy = async (e) => {
    e.preventDefault();
    setSavingVacancy(true);
    try {
      const url = editingVacancyId
        ? `${API_URL}/api/company/vacancies/${editingVacancyId}`
        : `${API_URL}/api/company/vacancies`;
      const res = await fetch(url, {
        method: editingVacancyId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vacancyForm)
      });
      if (res.ok) {
        setIsVacancyModalOpen(false);
        setEditingVacancyId(null);
        setVacancyForm(emptyVacancyForm);
        fetchVacancies();
      } else {
        const errData = await res.json();
        alert(`Error al guardar la vacante: ${errData.msg || res.statusText}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error de red al guardar la vacante');
    } finally {
      setSavingVacancy(false);
    }
  };

  const handleDeleteVacancy = async (vacancyId, cargo) => {
    if (!window.confirm(`¿Seguro que quieres eliminar la vacante "${cargo}"? Esto también eliminará las postulaciones asociadas.`)) return;
    try {
      const res = await fetch(`${API_URL}/api/company/vacancies/${vacancyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setVacancies(prev => prev.filter(v => v.id !== vacancyId));
      } else {
        alert('Error al eliminar la vacante');
      }
    } catch (error) {
      console.error(error);
      alert('Error de red al eliminar la vacante');
    }
  };

  return (
    <div>
      {/* Tabs Header */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            Perfil de la Empresa
          </button>
          <button
            className={`tab ${activeTab === 'vacantes' ? 'active' : ''}`}
            onClick={() => setActiveTab('vacantes')}
          >
            Mis Vacantes {vacancies.length > 0 ? `(${vacancies.length})` : ''}
          </button>
        </div>

        {activeTab === 'vacantes' && (
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              background: 'var(--color-sidebar)',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            onClick={openCreateVacancy}
          >
            <Plus size={14} />
            Crear vacante
          </button>
        )}
      </div>

      {activeTab === 'perfil' && (
        <div className="two-col-layout" style={{ display: 'flex', gap: '2rem', marginTop: '0.75rem' }}>

          {/* Left Column: Profile Card */}
          <div className="two-col-side" style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>

              {/* Cover Banner */}
              <div style={{
                position: 'relative',
                height: '80px',
                background: bannerPic
                  ? `url(${bannerPic}) center / cover no-repeat`
                  : 'linear-gradient(90deg, var(--color-primary) 0%, #ff5e62 100%)'
              }}>
                <button
                  onClick={() => bannerInputRef.current.click()}
                  title="Cambiar banner"
                  style={{
                    position: 'absolute',
                    top: '0.6rem',
                    right: '0.6rem',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'rgba(0, 0, 0, 0.45)',
                    backdropFilter: 'blur(2px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.8)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                >
                  <Camera size={14} />
                </button>
                <input
                  type="file"
                  ref={bannerInputRef}
                  onChange={handleBannerChange}
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg"
                />
              </div>

              <div style={{ padding: '0 1.5rem 1.25rem', position: 'relative', marginTop: '-36px' }}>

                {/* Profile Picture */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.75rem' }}>
                  <img
                    src={profilePic}
                    alt="Company Logo"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      border: '4px solid white',
                      objectFit: 'cover',
                      background: 'white'
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      border: '2px solid white',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Camera size={14} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePicChange}
                    style={{ display: 'none' }}
                    accept="image/png, image/jpeg"
                  />
                </div>

                {/* Basic Info */}
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {profileData.nombre}
                </h2>
                {profileData.industria ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'var(--bg-tag)',
                    color: 'var(--color-primary)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    <Layers size={12} />
                    {profileData.industria}
                  </span>
                ) : (
                  <p style={{ color: 'var(--text-disabled)', fontSize: '12px', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                    Sin industria especificada
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <MapPin size={16} />
                    <span>{profileData.ubicacion}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <Mail size={16} />
                    <span>{profileData.email}</span>
                  </div>
                </div>

                {(profileData.linkedin || profileData.instagram) && (
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem' }}>
                    {profileData.linkedin && (
                      <a
                        href={profileData.linkedin.startsWith('http') ? profileData.linkedin : `https://${profileData.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="LinkedIn"
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '1px solid var(--border-color)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
                          fontSize: '12px', fontWeight: '800'
                        }}
                      >
                        in
                      </a>
                    )}
                    {profileData.instagram && (
                      <a
                        href={profileData.instagram.startsWith('http') ? profileData.instagram : `https://${profileData.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Instagram"
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '1px solid var(--border-color)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
                          fontSize: '11px', fontWeight: '800'
                        }}
                      >
                        IG
                      </a>
                    )}
                  </div>
                )}

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit size={16} />
                  Editar perfil
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: About Info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.6rem', color: 'var(--text-primary)' }}>
                Sobre la empresa
              </h3>
              {profileData.descripcion ? (
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                  {profileData.descripcion}
                </p>
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                  gap: '0.6rem', padding: '1rem',
                  border: '1.5px dashed var(--border-color)', borderRadius: '10px'
                }}>
                  <FileText size={24} color="var(--text-disabled)" />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Aún no has agregado una descripción de tu empresa
                  </p>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      background: 'transparent', border: 'none', color: 'var(--color-primary)',
                      fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    <Edit size={14} /> Agregar descripción
                  </button>
                </div>
              )}

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '1rem 0' }} />

              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                Detalles de la empresa
              </h3>
              <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px' }}>
                    <Layers size={16} color="var(--text-secondary)" /> Industria
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px', paddingLeft: '1.5rem' }}>
                    {profileData.industria || 'No especificada'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px' }}>
                    <Users size={16} color="var(--text-secondary)" /> Tamaño de la empresa
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px', paddingLeft: '1.5rem' }}>
                    {profileData.tamano_empresa || 'No especificado'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px' }}>
                    <Calendar size={16} color="var(--text-secondary)" /> Año de fundación
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px', paddingLeft: '1.5rem' }}>
                    {profileData.anio_fundacion || 'No especificado'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px' }}>
                    <Globe size={16} color="var(--text-secondary)" /> Sitio web
                  </div>
                  {profileData.sitio_web ? (
                    <a
                      href={profileData.sitio_web.startsWith('http') ? profileData.sitio_web : `https://${profileData.sitio_web}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-primary)', fontSize: '14px', paddingLeft: '1.5rem', fontWeight: '500' }}
                    >
                      {profileData.sitio_web}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px', paddingLeft: '1.5rem' }}>No especificado</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vacantes' && (
        <div style={{ marginTop: '1.5rem' }}>
          {loadingVacancies ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Cargando vacantes...</p>
          ) : vacancies.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <Briefcase size={40} color="var(--text-disabled)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>Aún no has publicado vacantes</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Creá tu primera vacante para que los estudiantes puedan postularse.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {vacancies.map(v => (
                <div key={v.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>{v.cargo}</h3>
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
                      {v.ubicacion && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={14} /> {v.ubicacion}
                        </span>
                      )}
                      <button
                        onClick={() => navigate(`/empresa/vacantes/${v.id}/postulantes`)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none',
                          border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-primary)',
                          fontWeight: 600, fontSize: '0.8rem',
                        }}
                      >
                        <Users size={14} /> {v.postulaciones_count} postulación{v.postulaciones_count !== 1 ? 'es' : ''}
                      </button>
                      <span>Publicada el {v.fecha_publicacion}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <span className="tag">{v.modalidad}</span>
                      <span className="tag">{v.tipo_contrato}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                      {v.descripcion}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      onClick={() => openEditVacancy(v)}
                      title="Editar vacante"
                      className="btn-icon"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteVacancy(v.id, v.cargo)}
                      title="Eliminar vacante"
                      className="btn-icon"
                      style={{ color: '#d03b3b' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>

            <div className="modal-header">
              <h3 className="modal-title">Editar Perfil de Empresa</h3>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form id="edit-company-profile-form" onSubmit={handleSaveProfile} className="modal-body">

              {/* Avatar / Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={profilePic}
                    alt="Company Logo"
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--bg-secondary)',
                      background: 'white'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      border: '2px solid white',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Camera size={13} />
                  </button>
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>Logo de la empresa</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Haz clic en el ícono de cámara para cambiarlo</p>
                </div>
              </div>

              {/* Section: Información general */}
              <div className="form-section">
                <div className="form-section-title">
                  <Building2 size={14} />
                  Información general
                </div>
                <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Nombre de la Empresa</label>
                    <div className="input-icon-group">
                      <input
                        type="text"
                        name="nombre"
                        className="form-input"
                        value={profileData.nombre}
                        onChange={handleInputChange}
                      />
                      <Building2 size={16} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Industria</label>
                    <div className="input-icon-group">
                      <input
                        type="text"
                        name="industria"
                        className="form-input"
                        placeholder="Ej: Desarrollo de Software"
                        value={profileData.industria}
                        onChange={handleInputChange}
                      />
                      <Layers size={16} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Tamaño de la empresa</label>
                    <div className="input-icon-group">
                      <select
                        name="tamano_empresa"
                        className="form-input"
                        value={profileData.tamano_empresa}
                        onChange={handleInputChange}
                        style={{ background: 'white' }}
                      >
                        <option value="">Selecciona un rango</option>
                        <option value="1-10 empleados">1-10 empleados</option>
                        <option value="11-50 empleados">11-50 empleados</option>
                        <option value="51-200 empleados">51-200 empleados</option>
                        <option value="201-500 empleados">201-500 empleados</option>
                        <option value="500+ empleados">500+ empleados</option>
                      </select>
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Año de fundación</label>
                    <div className="input-icon-group">
                      <input
                        type="number"
                        name="anio_fundacion"
                        className="form-input"
                        placeholder="Ej: 2015"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={profileData.anio_fundacion}
                        onChange={handleInputChange}
                      />
                      <Calendar size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Contacto y ubicación */}
              <div className="form-section">
                <div className="form-section-title">
                  <MapPin size={14} />
                  Contacto y ubicación
                </div>
                <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Ubicación</label>
                    <div className="input-icon-group">
                      <input
                        type="text"
                        name="ubicacion"
                        className="form-input"
                        value={profileData.ubicacion}
                        onChange={handleInputChange}
                      />
                      <MapPin size={16} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Correo electrónico</label>
                    <div className="input-icon-group">
                      <input
                        type="email"
                        name="email"
                        className="form-input"
                        value={profileData.email}
                        onChange={handleInputChange}
                      />
                      <Mail size={16} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                    <label>Sitio web</label>
                    <div className="input-icon-group">
                      <input
                        type="text"
                        name="sitio_web"
                        className="form-input"
                        placeholder="https://tuempresa.com"
                        value={profileData.sitio_web || ''}
                        onChange={handleInputChange}
                      />
                      <Globe size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Redes sociales */}
              <div className="form-section">
                <div className="form-section-title">
                  <Link2 size={14} />
                  Redes sociales
                </div>
                <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>LinkedIn</label>
                    <div className="input-icon-group">
                      <input
                        type="text"
                        name="linkedin"
                        className="form-input"
                        placeholder="linkedin.com/company/..."
                        value={profileData.linkedin || ''}
                        onChange={handleInputChange}
                      />
                      <Link2 size={16} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Instagram</label>
                    <div className="input-icon-group">
                      <input
                        type="text"
                        name="instagram"
                        className="form-input"
                        placeholder="instagram.com/..."
                        value={profileData.instagram || ''}
                        onChange={handleInputChange}
                      />
                      <Link2 size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Descripción */}
              <div className="form-section" style={{ marginBottom: '0.5rem' }}>
                <div className="form-section-title">
                  <Info size={14} />
                  Sobre la empresa
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Descripción de la Empresa</label>
                  <textarea
                    name="descripcion"
                    className="form-textarea"
                    value={profileData.descripcion}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={350}
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-disabled)', textAlign: 'right', marginTop: '0.35rem' }}>
                    {profileData.descripcion.length}/350 caracteres
                  </p>
                </div>
              </div>

            </form>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" form="edit-company-profile-form" className="btn btn-primary">
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Vacancy Modal */}
      {isVacancyModalOpen && (
        <div className="modal-overlay" onClick={() => setIsVacancyModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>

            <div className="modal-header">
              <h3 className="modal-title">{editingVacancyId ? 'Editar Vacante' : 'Crear Vacante'}</h3>
              <button className="modal-close" onClick={() => setIsVacancyModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form id="create-vacancy-form" onSubmit={handleSaveVacancy} className="modal-body">

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Cargo</label>
                <input
                  type="text"
                  name="cargo"
                  value={vacancyForm.cargo}
                  onChange={handleVacancyInputChange}
                  placeholder="Ej: Diseñador UX/UI, Desarrollador Backend..."
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Ubicación</label>
                <input
                  type="text"
                  name="ubicacion"
                  value={vacancyForm.ubicacion}
                  onChange={handleVacancyInputChange}
                  placeholder="Ej: Medellín, Colombia / Remoto"
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Modalidad</label>
                  <select
                    name="modalidad"
                    value={vacancyForm.modalidad}
                    onChange={handleVacancyInputChange}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none', background: 'white' }}
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Remoto">Remoto</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Tipo de contrato</label>
                  <select
                    name="tipo_contrato"
                    value={vacancyForm.tipo_contrato}
                    onChange={handleVacancyInputChange}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none', background: 'white' }}
                  >
                    <option value="Tiempo completo">Tiempo completo</option>
                    <option value="Medio tiempo">Medio tiempo</option>
                    <option value="Práctica">Práctica</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Descripción</label>
                <textarea
                  name="descripcion"
                  value={vacancyForm.descripcion}
                  onChange={handleVacancyInputChange}
                  rows={3}
                  required
                  placeholder="¿Qué hará la persona en esta práctica?"
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Requisitos</label>
                <textarea
                  name="requisitos"
                  value={vacancyForm.requisitos}
                  onChange={handleVacancyInputChange}
                  rows={3}
                  required
                  placeholder="¿Qué necesita saber o tener el candidato?"
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Beneficios (opcional)</label>
                <textarea
                  name="beneficios"
                  value={vacancyForm.beneficios}
                  onChange={handleVacancyInputChange}
                  rows={2}
                  placeholder="Ej: Auxilio de transporte, horario flexible..."
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                />
              </div>

            </form>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setIsVacancyModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" form="create-vacancy-form" className="btn btn-primary" disabled={savingVacancy}>
                {savingVacancy ? 'Guardando...' : editingVacancyId ? 'Guardar cambios' : 'Publicar vacante'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSavedToast && <SuccessToast message="Perfil guardado exitosamente" />}
      {showPhotoSuccess && <SuccessToast message={photoSuccessMsg} />}
      {photoError && <ErrorToast message={photoError} />}
    </div>
  );
};

export default CompanyProfileView;
