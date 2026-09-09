import { urlArchivo } from "../lib/api";

const TAMANOS = {
  sm: "h-9 w-9 text-xs",
  md: "h-14 w-14 text-base",
  lg: "h-[120px] w-[120px] text-3xl",
};

export default function Avatar({
  foto,
  nombres,
  apellidos,
  tamano = "sm",
  onClick,
}: {
  foto: string | null;
  nombres: string;
  apellidos: string;
  tamano?: keyof typeof TAMANOS;
  onClick?: () => void;
}) {
  const iniciales = `${nombres[0] ?? ""}${apellidos[0] ?? ""}`;
  const clases = `shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-primary-light text-primary font-display font-semibold ${TAMANOS[tamano]}`;

  if (foto) {
    return (
      <div
        className={clases + (onClick ? " cursor-zoom-in relative group" : "")}
        onClick={onClick}
      >
        <img src={urlArchivo(`/api/media/perfiles/${foto}`)} alt="" className="h-full w-full object-cover" />
        {onClick && (
          <span className="absolute inset-0 hidden items-center justify-center bg-black/35 text-white group-hover:flex">
            🔍
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={clases}>
      <span>{iniciales}</span>
    </div>
  );
}
