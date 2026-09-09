import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'

/* ---------------------------- innovacion-social --------------------------- */
import { LanguageProvider } from './inno/context/LanguageContext.jsx'
import { AuthProvider as InnoAuthProvider } from './inno/context/AuthContext.jsx'
import ScrollFab from './inno/components/ui/ScrollFab.jsx'
import InnoHome from './inno/pages/Home.jsx'
import InnoNosotros from './inno/pages/Nosotros.jsx'
import InnoHistoria from './inno/pages/Historia.jsx'
import InnoBlog from './inno/pages/Blog.jsx'
import InnoBlogPost from './inno/pages/BlogPost.jsx'
import InnoAdmin from './inno/pages/Admin.jsx'

/* ------------------------------- PracticaYa ------------------------------- */
import PracticaYaLayout from './practicaya/layouts/MainLayout'
import ProtectedRoute from './practicaya/ProtectedRoute.jsx'
import PyaLogin from './practicaya/pages/auth/Login'
import PyaRegister from './practicaya/pages/auth/Register'
import CompanyDashboard from './practicaya/pages/company/Dashboard'
import CompanyStudentsList from './practicaya/pages/company/StudentsList'
import CompanyStudentProfile from './practicaya/pages/company/StudentProfile'
import CompanyProfile from './practicaya/pages/company/CompanyProfile'
import CompanySavedCandidates from './practicaya/pages/company/SavedCandidates'
import CompanyApplications from './practicaya/pages/company/Applications'
import CompanyVacancyApplicants from './practicaya/pages/company/VacancyApplicants'
import StudentProfilePage from './practicaya/pages/student/Profile'
import StudentVacancies from './practicaya/pages/student/Vacancies'
import StudentVacancyDetail from './practicaya/pages/student/VacancyDetail'
import StudentApplications from './practicaya/pages/student/Applications'
import StudentFavorites from './practicaya/pages/student/Favorites'
import PyaChat from './practicaya/pages/shared/Chat'

/* ------------------------------ Practicantes ------------------------------ */
import { AuthProvider as PracAuthProvider } from './practicantes/context/AuthContext'
import { ToastProvider } from './practicantes/context/ToastContext'
import RutaProtegida from './practicantes/components/RutaProtegida'
import PracLanding from './practicantes/pages/Landing'
import FrankLogin from './practicantes/pages/frank/Login'
import FrankDashboard from './practicantes/pages/frank/Dashboard'
import FrankNotasMasivo from './practicantes/pages/frank/NotasMasivo'
import FrankPracticanteShell from './practicantes/pages/frank/PracticanteShell'
import FrankPerfil from './practicantes/pages/frank/Perfil'
import FrankDocumentos from './practicantes/pages/frank/Documentos'
import FrankNotas from './practicantes/pages/frank/Notas'
import FrankObservaciones from './practicantes/pages/frank/Observaciones'
import FrankAvances from './practicantes/pages/frank/Avances'
import FrankHistorial from './practicantes/pages/frank/Historial'
import WilLogin from './practicantes/pages/wil/Login'
import WilShell from './practicantes/pages/wil/WilShell'
import WilPerfil from './practicantes/pages/wil/Perfil'
import WilPerfilEditar from './practicantes/pages/wil/PerfilEditar'
import WilDocumentos from './practicantes/pages/wil/Documentos'
import WilAvances from './practicantes/pages/wil/Avances'
import WilCalificaciones from './practicantes/pages/wil/Calificaciones'
import WilHistorial from './practicantes/pages/wil/Historial'

// Antes eran tres apps separadas y cada salto entre ellas recargaba la página,
// que siempre arrancaba arriba. Ahora la navegación es interna, así que hay que
// reponer ese comportamiento a mano.
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

// Cada sistema conserva sus propios estilos globales (tipografía, colores de
// texto, resets) colgados de la clase de su contenedor — ver src/styles/base.css.
function InnoWorld() {
  return (
    <LanguageProvider>
      <InnoAuthProvider>
        <div className="w-inno">
          <Outlet />
          <ScrollFab />
        </div>
      </InnoAuthProvider>
    </LanguageProvider>
  )
}

function PracticaYaWorld() {
  return (
    <div className="w-pya">
      <Outlet />
    </div>
  )
}

function PracticantesWorld() {
  return (
    <PracAuthProvider>
      <ToastProvider>
        <div className="w-prac">
          <Outlet />
        </div>
      </ToastProvider>
    </PracAuthProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<InnoWorld />}>
          <Route path="/" element={<InnoHome />} />
          <Route path="/nosotros" element={<InnoNosotros />} />
          <Route path="/historia" element={<InnoHistoria />} />
          <Route path="/blog" element={<InnoBlog />} />
          <Route path="/blog/:slug" element={<InnoBlogPost />} />
          <Route path="/admin" element={<InnoAdmin />} />
        </Route>

        <Route element={<PracticaYaWorld />}>
          <Route path="/login" element={<PyaLogin />} />
          <Route path="/register" element={<PyaRegister />} />

          <Route
            path="/empresa"
            element={
              <ProtectedRoute allowedRoles={['empresa']}>
                <PracticaYaLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CompanyDashboard />} />
            <Route path="estudiantes" element={<CompanyStudentsList />} />
            <Route path="estudiantes/:id" element={<CompanyStudentProfile />} />
            <Route path="perfil" element={<CompanyProfile />} />
            <Route path="candidatos" element={<CompanySavedCandidates />} />
            <Route path="postulaciones" element={<CompanyApplications />} />
            <Route path="vacantes/:id/postulantes" element={<CompanyVacancyApplicants />} />
            <Route path="chat" element={<PyaChat />} />
          </Route>

          <Route
            path="/estudiante"
            element={
              <ProtectedRoute allowedRoles={['estudiante']}>
                <PracticaYaLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="vacantes" replace />} />
            <Route path="vacantes" element={<StudentVacancies />} />
            <Route path="vacantes/:id" element={<StudentVacancyDetail />} />
            <Route path="postulaciones" element={<StudentApplications />} />
            <Route path="guardados" element={<StudentFavorites />} />
            <Route path="perfil" element={<StudentProfilePage />} />
            <Route path="chat" element={<PyaChat />} />
          </Route>
        </Route>

        <Route element={<PracticantesWorld />}>
          <Route path="/practicantes" element={<PracLanding />} />
          <Route path="/frank/login" element={<FrankLogin />} />
          <Route path="/wil/login" element={<WilLogin />} />

          <Route path="/frank" element={<RutaProtegida rol="frank" />}>
            <Route index element={<FrankDashboard />} />
            <Route path="notas-masivo" element={<FrankNotasMasivo />} />
            <Route path="practicantes/:pid" element={<FrankPracticanteShell />}>
              <Route path="perfil" element={<FrankPerfil />} />
              <Route path="documentos" element={<FrankDocumentos />} />
              <Route path="notas" element={<FrankNotas />} />
              <Route path="observaciones" element={<FrankObservaciones />} />
              <Route path="avances" element={<FrankAvances />} />
              <Route path="historial" element={<FrankHistorial />} />
            </Route>
          </Route>

          <Route path="/wil" element={<RutaProtegida rol="wil" />}>
            <Route element={<WilShell />}>
              <Route path="perfil" element={<WilPerfil />} />
              <Route path="perfil/editar" element={<WilPerfilEditar />} />
              <Route path="documentos" element={<WilDocumentos />} />
              <Route path="avances" element={<WilAvances />} />
              <Route path="calificaciones" element={<WilCalificaciones />} />
              <Route path="historial" element={<WilHistorial />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
