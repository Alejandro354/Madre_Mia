import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

export default function RutaProtegida({ rol }: { rol: "frank" | "wil" }) {
  const { sesion, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <div className="flex h-screen items-center justify-center text-text-secondary text-sm">Cargando…</div>;
  }

  if (sesion.rol !== rol) {
    const destino = sesion.rol === "frank" ? "/frank" : sesion.rol === "wil" ? "/wil/perfil" : `/${rol}/login`;
    return <Navigate to={destino} replace state={{ from: location }} />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 px-10 py-10 max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
}
