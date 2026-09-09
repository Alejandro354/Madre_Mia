const ESTILOS: Record<string, string> = {
  Activo: "bg-green-50 text-green-700",
  "En pausa": "bg-orange-50 text-orange-700",
  Finalizado: "bg-surface text-text-secondary",
};

export default function EstadoPill({ estado }: { estado: string }) {
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${ESTILOS[estado] ?? "bg-surface text-text-secondary"}`}>
      {estado}
    </span>
  );
}
