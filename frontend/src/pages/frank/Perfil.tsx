import { usePracticante } from "./PracticanteShell";

function Campo({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  return (
    <div>
      <dt className="field-label">{etiqueta}</dt>
      <dd className="text-sm font-medium">{valor}</dd>
    </div>
  );
}

export default function FrankPerfil() {
  const { practicante: p } = usePracticante();
  return (
    <div className="panel">
      <h2 className="font-semibold mb-4">Datos del perfil</h2>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-lg mb-6">
        <Campo etiqueta="Nombres" valor={p.nombres} />
        <Campo etiqueta="Apellidos" valor={p.apellidos} />
        <Campo etiqueta="Tipo de documento" valor={p.tipo_documento} />
        <Campo etiqueta="Documento" valor={p.documento} />
        <Campo etiqueta="Teléfono" valor={p.telefono || "—"} />
        <Campo etiqueta="Correo" valor={p.email} />
        <Campo etiqueta="Cohorte" valor={p.cohorte} />
        <Campo etiqueta="Estado" valor={p.estado} />
      </dl>
      <p className="text-xs text-text-secondary bg-surface rounded-lg px-3 py-2">
        Estos datos los administra el propio practicante desde su portal (Practicantes). Aquí solo puedes consultarlos.
      </p>
    </div>
  );
}
