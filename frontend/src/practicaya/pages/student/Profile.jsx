import React, { useEffect, useRef, useState } from 'react';
import {
  Camera, X, User as UserIcon, GraduationCap,
  Info, Link2, FileText, Upload, Pencil, Trash2, Plus,
} from 'lucide-react';
import { getProfile, saveProfile, uploadPhoto } from '../../api/profile';
import { createPortfolio, deletePortfolio, getPortfolio, updatePortfolio } from '../../api/portfolio';
import { extractErrors } from '../../api/client';
import { resolveMediaUrl } from '../../utils/media';
import ConfirmModal from '../../components/ConfirmModal';
import SuccessToast from '../../components/SuccessToast';
import ErrorToast from '../../components/ErrorToast';

const emptyForm = {
  nombre: '', rol: '', telefono: '', fecha_nacimiento: '', ciudad: '',
  institucion: '', programa: '', semestre: '', habilidades: '', descripcion: '',
  linkedin: '', github: '', instagram: '',
};

const PORTFOLIO_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_PORTFOLIO_SIZE = 10 * 1024 * 1024;

const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState('perfil');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [pfTitulo, setPfTitulo] = useState('');
  const [pfEnlace, setPfEnlace] = useState('');
  const [pfFile, setPfFile] = useState(null);
  const [pfError, setPfError] = useState('');
  const [savingPf, setSavingPf] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteWarning, setDeleteWarning] = useState('');
  const pfFileRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    getProfile()
      .then((res) => {
        const p = res.data;
        if (p && p.nombre !== undefined) {
          setForm({
            nombre: p.nombre || '',
            rol: p.rol || '',
            telefono: p.telefono || '',
            fecha_nacimiento: p.fecha_nacimiento || '',
            ciudad: p.ciudad || '',
            institucion: p.institucion || '',
            programa: p.programa || '',
            semestre: p.semestre || '',
            habilidades: p.habilidades || '',
            descripcion: p.descripcion || '',
            linkedin: p.linkedin || '',
            github: p.github || '',
            instagram: p.instagram || '',
          });
          setFotoUrl(p.foto_url || null);
        }
      })
      .catch(() => setErrorMsg('No se pudo cargar tu perfil'))
      .finally(() => setLoading(false));
  }, []);

  function fetchPortfolio() {
    setLoadingItems(true);
    getPortfolio()
      .then((res) => setItems(res.data.items))
      .catch(() => {})
      .finally(() => setLoadingItems(false));
  }

  useEffect(() => {
    fetchPortfolio();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveProfile(form);
      localStorage.setItem('userName', form.nombre);
      window.dispatchEvent(new Event('profileNameUpdated'));
      setIsEditModalOpen(false);
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 1600);
    } catch (err) {
      setErrorMsg(extractErrors(err).general || 'Error al guardar el perfil');
      setTimeout(() => setErrorMsg(''), 2600);
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const isImage = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
    if (!isImage || file.size > 5 * 1024 * 1024) {
      setErrorMsg('Formato no válido o archivo demasiado pesado. Usa JPG o PNG de máximo 5 MB');
      setTimeout(() => setErrorMsg(''), 2600);
      return;
    }

    try {
      const res = await uploadPhoto(file);
      setFotoUrl(res.data.foto_url);
      localStorage.setItem('userProfilePic', resolveMediaUrl(res.data.foto_url));
      window.dispatchEvent(new Event('profilePicUpdated'));
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 1200);
    } catch (err) {
      setErrorMsg(extractErrors(err).general || 'No se pudo actualizar la foto');
      setTimeout(() => setErrorMsg(''), 2600);
    }
  }

  function clearPfForm() {
    setPfTitulo('');
    setPfEnlace('');
    setPfFile(null);
    setPfError('');
    setEditingItem(null);
    if (pfFileRef.current) pfFileRef.current.value = '';
  }

  function openAddPortfolio() {
    clearPfForm();
    setIsPortfolioModalOpen(true);
  }

  function openEditPortfolio(item) {
    setEditingItem(item);
    setPfTitulo(item.titulo);
    setPfEnlace(item.enlace_url || '');
    setPfFile(null);
    setPfError('');
    setIsPortfolioModalOpen(true);
  }

  async function handleSavePortfolio(e) {
    e.preventDefault();
    setPfError('');

    if (!pfTitulo.trim()) {
      setPfError('El título es obligatorio');
      return;
    }
    if (!pfFile && !pfEnlace.trim()) {
      setPfError('Adjunta un archivo o ingresa un enlace');
      return;
    }
    if (pfFile && (!PORTFOLIO_TYPES.includes(pfFile.type) || pfFile.size > MAX_PORTFOLIO_SIZE)) {
      setPfError('Formato no soportado. Usa PDF, JPG o PNG de máximo 10 MB');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', pfTitulo.trim());
    if (pfFile) formData.append('file', pfFile);
    else formData.append('enlace', pfEnlace.trim());

    setSavingPf(true);
    try {
      if (editingItem) await updatePortfolio(editingItem.id, formData);
      else await createPortfolio(formData);
      setIsPortfolioModalOpen(false);
      clearPfForm();
      fetchPortfolio();
    } catch (err) {
      const errors = extractErrors(err);
      setPfError(errors.titulo || errors.file || errors.enlace || errors.general || 'Error al guardar');
    } finally {
      setSavingPf(false);
    }
  }

  async function handleDeletePortfolio(force) {
    try {
      await deletePortfolio(deleteItem.id, force);
      setDeleteItem(null);
      setDeleteWarning('');
      fetchPortfolio();
    } catch (err) {
      const payload = err.response?.data;
      if (err.response?.status === 409 && payload?.warning) {
        setDeleteWarning(payload.warning);
      } else {
        setDeleteItem(null);
        setDeleteWarning('');
        setErrorMsg(extractErrors(err).general || 'Error al eliminar');
        setTimeout(() => setErrorMsg(''), 2600);
      }
    }
  }

  if (loading) return <p>Cargando perfil...</p>;

  const resolvedFoto = resolveMediaUrl(fotoUrl);
  const socials = [
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'github', label: 'GitHub' },
    { key: 'instagram', label: 'Instagram' },
  ];

  return (
    <div>
      <div className="tabs-container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'perfil' ? 'active' : ''}`} onClick={() => setActiveTab('perfil')}>
            Mi Perfil
          </button>
          <button className={`tab ${activeTab === 'portafolio' ? 'active' : ''}`} onClick={() => setActiveTab('portafolio')}>
            Portafolio {items.length > 0 ? `(${items.length})` : ''}
          </button>
        </div>

        {activeTab === 'portafolio' && (
          <button
            onClick={openAddPortfolio}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem',
              background: 'var(--color-sidebar)', color: 'white', border: 'none', borderRadius: '50px',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Agregar elemento
          </button>
        )}
      </div>

      {activeTab === 'perfil' && (
        <div className="profile-layout">
          <div className="profile-sidebar">
            <div className="profile-card">
              {resolvedFoto ? (
                <img src={resolvedFoto} alt="Foto de perfil" className="avatar-large" />
              ) : (
                <div className="avatar-large" style={{ background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                  {(form.nombre || 'E').charAt(0).toUpperCase()}
                </div>
              )}
              <h2 style={{ fontSize: '1.15rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{form.nombre || 'Mi Perfil'}</h2>
              {form.rol && (
                <span style={{ display: 'inline-flex', background: 'var(--bg-tag)', color: 'var(--color-primary)', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {form.rol}
                </span>
              )}
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user.email}</p>

              <input ref={fileInputRef} type="file" accept="image/png, image/jpeg" style={{ display: 'none' }} onChange={handlePhotoChange} />
              <button className="btn" style={{ width: '100%', marginTop: '1rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => fileInputRef.current.click()}>
                <Camera size={16} /> Cambiar foto
              </button>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => setIsEditModalOpen(true)}>
                <Pencil size={16} /> Editar perfil
              </button>
            </div>
          </div>

          <div className="profile-content">
            <div className="info-block">
              <h3>Datos personales</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Correo electrónico</label>
                  <p>{user.email || '—'}</p>
                </div>
                <div className="info-item">
                  <label>Teléfono</label>
                  <p>{form.telefono || '—'}</p>
                </div>
                <div className="info-item">
                  <label>Fecha de nacimiento</label>
                  <p>{form.fecha_nacimiento || '—'}</p>
                </div>
                <div className="info-item">
                  <label>Ciudad</label>
                  <p>{form.ciudad || '—'}</p>
                </div>
              </div>
            </div>

            <div className="info-block">
              <h3>Datos académicos</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Institución</label>
                  <p>{form.institucion || '—'}</p>
                </div>
                <div className="info-item">
                  <label>Programa</label>
                  <p>{form.programa || '—'}</p>
                </div>
                <div className="info-item">
                  <label>Semestre</label>
                  <p>{form.semestre || '—'}</p>
                </div>
                <div className="info-item">
                  <label>Habilidades</label>
                  <p>{form.habilidades || '—'}</p>
                </div>
              </div>
            </div>

            <div className="info-block">
              <h3>Descripción</h3>
              {form.descripcion ? (
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{form.descripcion}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.6rem', padding: '1rem', border: '1.5px dashed var(--border-color)', borderRadius: '10px' }}>
                  <Info size={22} color="var(--text-disabled)" />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Aún no has agregado una descripción</p>
                </div>
              )}
            </div>

            <div className="info-block">
              <h3>Redes sociales</h3>
              {socials.map((s) => (
                <div key={s.key} className={`social-link ${form[s.key] ? 'connected' : ''}`}>
                  <Link2 size={16} />
                  {form[s.key] ? (
                    <a href={form[s.key].startsWith('http') ? form[s.key] : `https://${form[s.key]}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                      {s.label}
                    </a>
                  ) : (
                    <span>{s.label} (sin vincular)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'portafolio' && (
        <div style={{ marginTop: '0.5rem' }}>
          {loadingItems ? (
            <p>Cargando portafolio...</p>
          ) : items.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <FileText size={40} color="var(--text-disabled)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>Tu portafolio está vacío</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Agrega archivos o enlaces para mostrar tu trabajo a las empresas.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => (
                <div key={item.id} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="btn-icon" style={{ cursor: 'default' }}>
                    {item.tipo === 'archivo' ? <FileText size={18} /> : <Link2 size={18} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{item.titulo}</h4>
                      <span className="tag">{item.tipo === 'archivo' ? 'Archivo' : 'Enlace'}</span>
                    </div>
                    <a
                      href={item.enlace_url || resolveMediaUrl(item.archivo_url)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '12px', color: 'var(--color-primary)', wordBreak: 'break-all' }}
                    >
                      {item.enlace_url || 'Ver documento'}
                    </a>
                  </div>
                  <button className="btn-icon" onClick={() => openEditPortfolio(item)} title="Editar">
                    <Pencil size={16} />
                  </button>
                  <button className="btn-icon" onClick={() => { setDeleteItem(item); setDeleteWarning(''); }} title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Editar Perfil</h3>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form id="edit-student-profile-form" onSubmit={handleSaveProfile} className="modal-body">
              <div className="form-section">
                <div className="form-section-title"><UserIcon size={14} /> Información personal</div>
                <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Nombre completo</label>
                    <input type="text" name="nombre" className="form-input" value={form.nombre} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Rol que buscas</label>
                    <input type="text" name="rol" className="form-input" placeholder="Ej: Desarrollador Frontend" value={form.rol} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Teléfono</label>
                    <input type="text" name="telefono" className="form-input" value={form.telefono} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Fecha de nacimiento</label>
                    <input type="date" name="fecha_nacimiento" className="form-input" value={form.fecha_nacimiento} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                    <label>Ciudad</label>
                    <input type="text" name="ciudad" className="form-input" value={form.ciudad} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title"><GraduationCap size={14} /> Información académica</div>
                <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Institución</label>
                    <input type="text" name="institucion" className="form-input" value={form.institucion} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Programa</label>
                    <input type="text" name="programa" className="form-input" value={form.programa} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                    <label>Semestre</label>
                    <input type="text" name="semestre" className="form-input" value={form.semestre} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title"><Info size={14} /> Habilidades y descripción</div>
                <div className="form-group">
                  <label>Habilidades (separadas por coma)</label>
                  <input type="text" name="habilidades" className="form-input" placeholder="React, Python, SQL..." value={form.habilidades} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Descripción</label>
                  <textarea name="descripcion" className="form-textarea" rows={4} value={form.descripcion} onChange={handleChange} />
                </div>
              </div>

              <div className="form-section" style={{ marginBottom: '0.5rem' }}>
                <div className="form-section-title"><Link2 size={14} /> Redes sociales</div>
                <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>LinkedIn</label>
                    <input type="text" name="linkedin" className="form-input" placeholder="linkedin.com/in/..." value={form.linkedin} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>GitHub</label>
                    <input type="text" name="github" className="form-input" placeholder="github.com/..." value={form.github} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Instagram</label>
                    <input type="text" name="instagram" className="form-input" placeholder="instagram.com/..." value={form.instagram} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </form>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
              <button type="submit" form="edit-student-profile-form" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isPortfolioModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPortfolioModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? 'Editar elemento' : 'Agregar al portafolio'}</h3>
              <button className="modal-close" onClick={() => setIsPortfolioModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form id="portfolio-form" onSubmit={handleSavePortfolio} className="modal-body">
              {pfError && (
                <p style={{ color: 'var(--color-primary)', background: 'var(--bg-tag)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {pfError}
                </p>
              )}
              <div className="form-group">
                <label>Título</label>
                <input type="text" className="form-input" value={pfTitulo} onChange={(e) => setPfTitulo(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Enlace (Behance, Drive, GitHub...)</label>
                <input type="text" className="form-input" value={pfEnlace} onChange={(e) => setPfEnlace(e.target.value)} placeholder="https://..." />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>o adjunta un archivo</label>
                <button
                  type="button"
                  className="upload-zone"
                  style={{ width: '100%', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => pfFileRef.current?.click()}
                >
                  <Upload size={20} color="var(--text-disabled)" />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{pfFile ? pfFile.name : 'Seleccionar archivo'}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-disabled)' }}>PDF, JPG o PNG · máximo 10 MB</span>
                </button>
                <input ref={pfFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => setPfFile(e.target.files?.[0] || null)} />
              </div>
            </form>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setIsPortfolioModalOpen(false)}>Cancelar</button>
              <button type="submit" form="portfolio-form" className="btn btn-primary" disabled={savingPf}>
                {savingPf ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteItem && (
        <ConfirmModal
          title={deleteWarning ? 'Advertencia' : 'Eliminar documento'}
          message={deleteWarning || '¿Seguro que deseas eliminar este documento?'}
          confirmText={deleteWarning ? 'Eliminar de todos modos' : 'Eliminar'}
          onConfirm={() => handleDeletePortfolio(!!deleteWarning)}
          onCancel={() => { setDeleteItem(null); setDeleteWarning(''); }}
        />
      )}

      {showSavedToast && <SuccessToast message="Cambios guardados exitosamente" />}
      {errorMsg && <ErrorToast message={errorMsg} />}
    </div>
  );
};

export default StudentProfile;
