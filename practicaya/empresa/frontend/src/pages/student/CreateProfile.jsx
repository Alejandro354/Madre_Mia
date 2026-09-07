import React, { useState, useRef, useEffect } from 'react';
import { Edit, MapPin, Mail, Upload, File as FileIcon, Trash2, Camera, X } from 'lucide-react';
import { validateImageFile } from '../../utils/validateImage';
import SuccessToast from '../../components/SuccessToast';
import ErrorToast from '../../components/ErrorToast';

const API_URL = 'http://localhost:5000';

const StudentProfileView = () => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // State for profile picture
  const [profilePic, setProfilePic] = useState(localStorage.getItem('userProfilePic') || 'https://randomuser.me/api/portraits/men/32.jpg');
  const fileInputRef = useRef(null);
  const [showPhotoSuccess, setShowPhotoSuccess] = useState(false);
  const [photoError, setPhotoError] = useState('');

  // State for portfolio files
  const [portfolioFiles, setPortfolioFiles] = useState([
    { id: 1, name: 'Rediseño App EAFIT.pdf', type: 'PDF', date: '21 de jun de 2026' }
  ]);
  const portfolioInputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // State for profile data
  const [profileData, setProfileData] = useState({
    nombre: '',
    rol: '',
    ubicacion: '',
    email: user.email || '',
    fechaNacimiento: '',
    telefono: '',
    ciudad: '',
    institucion: '',
    programa: '',
    semestre: '',
    descripcion: '',
    habilidades: '',
    linkedin: '',
    instagram: ''
  });

  // Load data on mount
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/student/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProfileData({
          nombre: data.nombre || '',
          rol: data.rol || '',
          ubicacion: data.ciudad || '',
          email: user.email || '',
          fechaNacimiento: data.fecha_nacimiento || '',
          telefono: data.telefono || '',
          ciudad: data.ciudad || '',
          institucion: data.institucion || '',
          programa: data.programa || '',
          semestre: data.semestre || '',
          descripcion: data.descripcion || '',
          habilidades: data.habilidades || '',
          linkedin: data.linkedin || '',
          instagram: data.instagram || ''
        });
        if (data.foto_url) {
          setProfilePic(data.foto_url);
          localStorage.setItem('userProfilePic', data.foto_url);
          window.dispatchEvent(new Event('profilePicUpdated'));
        }
      })
      .catch(err => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Handle Profile Picture Upload
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      e.target.value = '';
      setPhotoError(validationError);
      setTimeout(() => setPhotoError(''), 2600);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result;
      setProfilePic(base64data);
      localStorage.setItem('userProfilePic', base64data);
      window.dispatchEvent(new Event('profilePicUpdated'));

      try {
        await fetch(`${API_URL}/api/student/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ foto_url: base64data })
        });
        setShowPhotoSuccess(true);
        setTimeout(() => setShowPhotoSuccess(false), 1000);
      } catch (err) {
        console.error("Error saving photo", err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Portfolio File Upload
  const handlePortfolioUpload = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processPortfolioFiles(files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processPortfolioFiles(files);
    }
  };

  const processPortfolioFiles = (files) => {
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const newFiles = Array.from(files).filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return validExtensions.includes(ext);
    }).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type.includes('pdf') ? 'PDF' : 'Imagen',
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    }));

    if (newFiles.length > 0) {
      setPortfolioFiles(prev => [...prev, ...newFiles]);
    } else {
      alert("Formato de archivo no válido. Solo PDF, JPG, PNG.");
    }
  };

  const removePortfolioFile = (id) => {
    setPortfolioFiles(prev => prev.filter(f => f.id !== id));
  };

  // Handle Modal form
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/student/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: profileData.nombre,
          rol: profileData.rol,
          telefono: profileData.telefono,
          fecha_nacimiento: profileData.fechaNacimiento,
          ciudad: profileData.ciudad,
          institucion: profileData.institucion,
          programa: profileData.programa,
          semestre: profileData.semestre,
          descripcion: profileData.descripcion,
          habilidades: profileData.habilidades,
          linkedin: profileData.linkedin,
          instagram: profileData.instagram
        })
      });
      if (res.ok) {
        setProfileData(prev => ({ ...prev, ubicacion: prev.ciudad }));
        localStorage.setItem('userName', profileData.nombre);
        window.dispatchEvent(new Event('profileNameUpdated'));
        setIsEditModalOpen(false);
      } else {
        const errData = await res.json();
        alert(`Error al guardar: ${errData.msg || res.statusText}`);
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

  return (
    <div>
      {/* Tabs Header */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            Perfil
          </button>
          <button 
            className={`tab ${activeTab === 'portafolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portafolio')}
          >
            Portafolio
          </button>
        </div>
        
        {activeTab === 'perfil' ? (
          <button 
            className="btn btn-secondary" 
            style={{ display: 'flex', gap: '0.5rem', background: '#333', color: 'white', border: 'none' }}
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit size={16} /> Editar perfil
          </button>
        ) : (
          <button className="btn btn-primary">
            Guardar cambios
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="profile-layout">
        
        {/* Left Sidebar (Always visible) */}
        <div className="profile-sidebar">
          <div className="profile-card">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img 
                src={profilePic} 
                alt={profileData.nombre} 
                className="avatar-large"
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                style={{ position: 'absolute', bottom: '1rem', right: '0', background: '#333', color: 'white', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', zIndex: 10 }}
              >
                <Camera size={14} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleProfilePicChange} 
                accept="image/png, image/jpeg, image/jpg" 
                style={{ display: 'none' }} 
              />
            </div>
            
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{profileData.nombre}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>{profileData.rol}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} /> {profileData.ubicacion}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} /> {profileData.email}
              </div>
            </div>
          </div>

          <div className="info-block">
            <h3>Redes sociales</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className={`social-link ${profileData.linkedin ? 'connected' : ''}`}>
                <div style={{ width: 24, height: 24, background: profileData.linkedin ? '#FDECEF' : '#F4F5FA', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: profileData.linkedin ? '#FF1837' : '#A0A4B8', fontWeight: 'bold', fontSize: '12px' }}>L</div>
                {profileData.linkedin ? 'LinkedIn' : 'Sin vincular'}
              </div>
              <div className={`social-link ${profileData.instagram ? 'connected' : ''}`}>
                <div style={{ width: 24, height: 24, background: profileData.instagram ? '#FDECEF' : '#F4F5FA', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: profileData.instagram ? '#FF1837' : '#A0A4B8', fontWeight: 'bold', fontSize: '12px' }}>I</div>
                {profileData.instagram ? 'Instagram' : 'Sin vincular'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="profile-content">
          
          {activeTab === 'perfil' && (
            <>
              {/* Datos personales */}
              <div className="info-block">
                <h3>Datos personales</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Nombre completo</label>
                    <p>{profileData.nombre}</p>
                  </div>
                  <div className="info-item">
                    <label>Fecha de nacimiento</label>
                    <p>{profileData.fechaNacimiento}</p>
                  </div>
                  <div className="info-item">
                    <label>Telefono</label>
                    <p>{profileData.telefono}</p>
                  </div>
                  <div className="info-item">
                    <label>Correo electronico</label>
                    <p>{profileData.email}</p>
                  </div>
                  <div className="info-item">
                    <label>Ciudad</label>
                    <p>{profileData.ciudad}</p>
                  </div>
                </div>
              </div>

              {/* Datos académicos */}
              <div className="info-block">
                <h3>Datos académicos</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Institución educativa</label>
                    <p>{profileData.institucion}</p>
                  </div>
                  <div className="info-item">
                    <label>Programa academico</label>
                    <p>{profileData.programa}</p>
                  </div>
                  <div className="info-item">
                    <label>Semestre</label>
                    <p>{profileData.semestre}</p>
                  </div>
                </div>
              </div>

              {/* Descripción profesional */}
              <div className="info-block">
                <h3>Descripción profecional</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {profileData.descripcion}
                </p>
              </div>

              {/* Habilidades */}
              <div className="info-block">
                <h3>Habilidades</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {profileData.habilidades.trim() ? (
                    profileData.habilidades.split(',').map((skill, index) => (
                      skill.trim() && <span key={index} className="tag">{skill.trim()}</span>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Aún no has agregado habilidades.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'portafolio' && (
            <>
              <div className="info-block">
                <h3 style={{ marginBottom: '1rem' }}>Agregar elemento</h3>
                
                <div className="portfolio-add-row" style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
                  {/* File Upload Zone */}
                  <div
                    className="upload-zone"
                    style={{ flex: '1 1 260px' }}
                    onClick={() => portfolioInputRef.current.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <div style={{ width: 40, height: 40, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <Upload size={18} color="var(--text-secondary)" />
                    </div>
                    <p style={{ fontWeight: '500', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Arrastra tu archivo aquí</p>
                    <p style={{ fontSize: '0.75rem', color: '#A0A4B8', marginBottom: '0.5rem' }}>o haz clic para seleccionarlo desde tu computadora.</p>
                    <p style={{ fontSize: '0.75rem', color: '#A0A4B8', fontWeight: '500' }}>PDF, JPG, PNG</p>
                    
                    <input 
                      type="file" 
                      ref={portfolioInputRef} 
                      onChange={handlePortfolioUpload} 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      multiple
                      style={{ display: 'none' }} 
                    />
                  </div>
                  
                  {/* External Link Input */}
                  <div className="portfolio-link-card" style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem' }}>Agregar enlace externo</h4>
                    <input 
                      type="text" 
                      placeholder="https://behance.net/mi-perfil" 
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem', outline: 'none' }} 
                    />
                    <button className="btn btn-secondary" style={{ width: '100%', background: '#333', color: 'white', border: 'none' }}>
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* Uploaded Files List */}
              {portfolioFiles.map(file => (
                <div key={file.id} className="info-block" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 48, height: 48, background: '#FDECEF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF1837' }}>
                    <FileIcon size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{file.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{file.type} · {file.date}</p>
                  </div>
                  <button 
                    onClick={() => removePortfolioFile(file.id)}
                    style={{ background: '#F4F5FA', border: 'none', width: 32, height: 32, borderRadius: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0A4B8', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Perfil</h2>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form id="student-edit-profile-form" onSubmit={handleSaveProfile} className="modal-body">
              <div className="info-grid">
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input type="text" className="form-input" name="nombre" value={profileData.nombre} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Rol principal</label>
                  <input type="text" className="form-input" name="rol" value={profileData.rol} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Fecha de nacimiento</label>
                  <input type="date" className="form-input" name="fechaNacimiento" value={profileData.fechaNacimiento} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="text" className="form-input" name="telefono" value={profileData.telefono} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Ciudad</label>
                  <input type="text" className="form-input" name="ciudad" value={profileData.ciudad} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Institución educativa</label>
                  <input type="text" className="form-input" name="institucion" value={profileData.institucion} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Programa académico</label>
                  <input type="text" className="form-input" name="programa" value={profileData.programa} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Semestre</label>
                  <input type="number" className="form-input" name="semestre" value={profileData.semestre} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción profesional</label>
                <textarea className="form-textarea" name="descripcion" value={profileData.descripcion} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>Habilidades (separadas por coma)</label>
                <input type="text" className="form-input" name="habilidades" value={profileData.habilidades} onChange={handleInputChange} placeholder="Ej. Figma, React, Python" />
              </div>

              <div className="info-grid">
                <div className="form-group">
                  <label>Enlace de LinkedIn</label>
                  <input type="url" className="form-input" name="linkedin" value={profileData.linkedin} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="form-group">
                  <label>Enlace de Instagram</label>
                  <input type="url" className="form-input" name="instagram" value={profileData.instagram} onChange={handleInputChange} placeholder="https://instagram.com/..." />
                </div>
              </div>

            </form>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
              <button type="submit" form="student-edit-profile-form" className="btn btn-primary">Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {showPhotoSuccess && <SuccessToast message="Foto actualizada exitosamente" />}
      {photoError && <ErrorToast message={photoError} />}
    </div>
  );
};

export default StudentProfileView;
