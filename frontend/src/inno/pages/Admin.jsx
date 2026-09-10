import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import CreateBlogModal from '../components/admin/CreateBlogModal.jsx'
import CreateCompanyModal from '../components/admin/CreateCompanyModal.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import ReportsPanel from '../components/admin/reports/ReportsPanel.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useBlogPosts } from '../hooks/useBlogPosts.js'
import './Admin.css'

function Admin() {
  const { isAuthenticated, token } = useAuth()
  const { posts, loading, refresh } = useBlogPosts()
  const [activeTab, setActiveTab] = useState('blog')
  const [createBlogOpen, setCreateBlogOpen] = useState(false)
  const [createCompanyOpen, setCreateCompanyOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [deletingPost, setDeletingPost] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleDelete = async () => {
    setDeleteError('')
    setDeleting(true)
    try {
      const res = await fetch(`/api/blog/${deletingPost.slug}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'No se pudo eliminar')
      }
      setDeletingPost(null)
      refresh()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className="admin-page">
          <div className="container admin-page__locked">
            <h1>Acceso restringido</h1>
            <p>Iniciá sesión como administrador para ver este panel.</p>
            <Link to="/" className="admin-page__back">← Volver al inicio</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="admin-page">
        <div className="container">
          <span className="admin-page__eyebrow">Panel de administración</span>
          <h1>Admin</h1>
          <p className="admin-page__subtitle">Gestioná el contenido del sitio.</p>

          <div className="admin-page__tabs">
            <button
              type="button"
              className={`admin-page__tab${activeTab === 'blog' ? ' admin-page__tab--active' : ''}`}
              onClick={() => setActiveTab('blog')}
            >
              Blog
            </button>
            <button
              type="button"
              className={`admin-page__tab${activeTab === 'reportes' ? ' admin-page__tab--active' : ''}`}
              onClick={() => setActiveTab('reportes')}
            >
              Reportes
            </button>
          </div>

          {activeTab === 'blog' ? (
            <>
              <div className="admin-page__grid">
                <button type="button" className="admin-page__card" onClick={() => setCreateBlogOpen(true)}>
                  <span className="admin-page__card-icon">+</span>
                  Crear blog
                </button>

                <button type="button" className="admin-page__card" onClick={() => setCreateCompanyOpen(true)}>
                  <span className="admin-page__card-icon">+</span>
                  Crear empresa
                </button>

                <button type="button" className="admin-page__card">
                  <span className="admin-page__card-icon">+</span>
                  Crear profesor
                </button>
              </div>

              <h2 className="admin-page__section-title">Tus publicaciones</h2>

              {loading ? (
                <p className="admin-page__empty">Cargando…</p>
              ) : posts.length === 0 ? (
                <p className="admin-page__empty">Todavía no publicaste ninguna historia desde este panel.</p>
              ) : (
                <div className="admin-page__table">
                  {posts.map((post) => (
                    <div key={post.slug} className="admin-page__row">
                      <img src={post.image} alt="" className="admin-page__row-thumb" />
                      <div className="admin-page__row-info">
                        <Link to={`/blog/${post.slug}`} className="admin-page__row-title">{post.title}</Link>
                        <span className="admin-page__row-meta">
                          {post.tag} · {post.date} · {post.views} vistas
                        </span>
                      </div>
                      <div className="admin-page__row-actions">
                        <button type="button" onClick={() => setEditingPost(post)}>Editar</button>
                        <button type="button" onClick={() => setDeletingPost(post)}>Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="admin-page__section-title">Reportes</h2>
              <ReportsPanel />
            </>
          )}
        </div>
      </main>
      <Footer />

      {createBlogOpen && (
        <CreateBlogModal
          onClose={() => setCreateBlogOpen(false)}
          onSaved={() => refresh()}
        />
      )}

      {createCompanyOpen && (
        <CreateCompanyModal onClose={() => setCreateCompanyOpen(false)} />
      )}

      {editingPost && (
        <CreateBlogModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={() => refresh()}
        />
      )}

      {deletingPost && (
        <ConfirmDialog
          title="Eliminar historia"
          message={`¿Seguro que querés eliminar "${deletingPost.title}"? Esta acción no se puede deshacer.`}
          error={deleteError}
          confirmLabel="Eliminar"
          danger
          loading={deleting}
          onCancel={() => {
            setDeletingPost(null)
            setDeleteError('')
          }}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}

export default Admin
