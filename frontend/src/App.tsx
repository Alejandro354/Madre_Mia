import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import RutaProtegida from "./components/RutaProtegida";

import Landing from "./pages/Landing";
import FrankLogin from "./pages/frank/Login";
import WilLogin from "./pages/wil/Login";

import FrankDashboard from "./pages/frank/Dashboard";
import FrankNotasMasivo from "./pages/frank/NotasMasivo";
import FrankPracticanteShell from "./pages/frank/PracticanteShell";
import FrankPerfil from "./pages/frank/Perfil";
import FrankDocumentos from "./pages/frank/Documentos";
import FrankNotas from "./pages/frank/Notas";
import FrankObservaciones from "./pages/frank/Observaciones";
import FrankAvances from "./pages/frank/Avances";
import FrankHistorial from "./pages/frank/Historial";

import WilShell from "./pages/wil/WilShell";
import WilPerfil from "./pages/wil/Perfil";
import WilPerfilEditar from "./pages/wil/PerfilEditar";
import WilDocumentos from "./pages/wil/Documentos";
import WilAvances from "./pages/wil/Avances";
import WilCalificaciones from "./pages/wil/Calificaciones";
import WilHistorial from "./pages/wil/Historial";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
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
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
