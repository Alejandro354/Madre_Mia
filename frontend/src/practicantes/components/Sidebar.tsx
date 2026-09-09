import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  FileText,
  ClipboardList,
  FolderUp,
  History,
  User,
  GraduationCap,
  LogOut,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

interface Item {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

const itemsFrank: Item[] = [
  { to: "/frank", label: "Practicantes", icon: LayoutGrid, end: true },
  { to: "/frank/notas-masivo", label: "Carga Masiva de Seguimiento", icon: ClipboardList },
];

const itemsPracticante: Item[] = [
  { to: "/wil/perfil", label: "Perfil", icon: User },
  { to: "/wil/documentos", label: "Documentos", icon: FileText },
  { to: "/wil/avances", label: "Cargar avances", icon: FolderUp },
  { to: "/wil/calificaciones", label: "Seguimiento", icon: ClipboardList },
  { to: "/wil/historial", label: "Historial", icon: History },
];

export default function Sidebar() {
  const { sesion, logoutFrank, logoutWil } = useAuth();
  const { notificar } = useToast();
  const navigate = useNavigate();

  async function salir() {
    if (sesion.rol === "frank") await logoutFrank();
    if (sesion.rol === "wil") await logoutWil();
    notificar("Sesión cerrada.", "success");
    navigate("/practicantes");
  }

  const items = sesion.rol === "frank" ? itemsFrank : sesion.rol === "wil" ? itemsPracticante : [];

  return (
    <aside className="w-64 shrink-0 bg-sidebar text-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Zap size={16} className="text-white" fill="white" />
        </span>
        <span className="font-display font-bold text-[15px]">Tablero Practicantes</span>
      </div>

      {sesion.rol && (
        <div className="px-6 pb-2">
          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs">
            {sesion.rol === "frank" ? <User size={14} /> : <GraduationCap size={14} />}
            <span className="truncate">
              {sesion.rol === "frank" ? `Admin: ${sesion.nombre}` : `Practicante: ${sesion.nombre}`}
            </span>
          </div>
        </div>
      )}

      <nav className="flex-1 px-4 py-2 flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition " +
              (isActive ? "bg-primary text-white font-medium" : "text-white/75 hover:bg-white/10 hover:text-white")
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {sesion.rol && (
        <div className="px-4 pb-6">
          <button
            onClick={salir}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/75 hover:bg-white/10 hover:text-white transition"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      )}

      {!sesion.rol && (
        <div className="px-4 pb-6 flex flex-col gap-2">
          <NavLink to="/frank/login" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/75 hover:bg-white/10 hover:text-white transition">
            <User size={18} /> Panel Administrador
          </NavLink>
          <NavLink to="/wil/login" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/75 hover:bg-white/10 hover:text-white transition">
            <GraduationCap size={18} /> Portal Practicantes
          </NavLink>
        </div>
      )}
    </aside>
  );
}
