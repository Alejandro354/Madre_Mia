import { Link } from "react-router-dom";
import { useMiPerfil } from "./WilShell";

function Campo({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  return (
    <div>
      <dt className="field-label">{etiqueta}</dt>
      <dd className="text-sm font-medium">{valor}</dd>
    </div>
  );
}

export default function WilPerfil() {
  const { practicante: p } = useMiPerfil();
  return (
    <div className="panel">
      <h2 className="font-semibold mb-4">Mi perfil</h2>
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
      <Link to="/wil/perfil/editar" className="btn-primary">Editar perfil</Link>
    </div>
  );
}
