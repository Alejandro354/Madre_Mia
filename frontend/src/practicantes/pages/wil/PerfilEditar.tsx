import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPostForm, ApiError } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { useMiPerfil } from "./WilShell";

export default function WilPerfilEditar() {
  const { practicante: p, recargar } = useMiPerfil();
  const navigate = useNavigate();
  const { notificar } = useToast();

  const [tipos, setTipos] = useState<string[]>([]);
  const [nombres, setNombres] = useState(p.nombres);
  const [apellidos, setApellidos] = useState(p.apellidos);
  const [tipoDocumento, setTipoDocumento] = useState(p.tipo_documento);
  const [documento, setDocumento] = useState(p.documento);
  const [telefono, setTelefono] = useState(p.telefono || "");
  const [foto, setFoto] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    apiGet("/api/frank/tipos-documento").then(setTipos);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const form = new FormData();
    form.append("nombres", nombres);
    form.append("apellidos", apellidos);
    form.append("tipo_documento", tipoDocumento);
    form.append("documento", documento);
    form.append("telefono", telefono);
    if (foto) form.append("foto", foto);

    try {
      await apiPostForm("/api/wil/perfil", form, "PUT");
      notificar("Perfil actualizado correctamente.", "success");
      recargar();
      navigate("/wil/perfil");
    } catch (err) {
      notificar(err instanceof ApiError ? err.message : "No se pudo actualizar el perfil.", "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="panel max-w-xl">
      <h2 className="font-semibold mb-4">Editar mi perfil</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className="field-label block">Foto de perfil</label>
          <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setFoto(e.target.files?.[0] ?? null)} className="text-sm" />
          <p className="text-xs text-text-secondary mt-1">JPG, PNG o WEBP · Máximo 10 MB. Se recorta automáticamente para verse bien en tu perfil.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label block">Nombres</label>
            <input className="input-field" value={nombres} onChange={(e) => setNombres(e.target.value)} required />
          </div>
          <div>
            <label className="field-label block">Apellidos</label>
            <input className="input-field" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label block">Tipo de documento</label>
            <select className="input-field" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} required>
              {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label block">Documento</label>
            <input className="input-field" value={documento} onChange={(e) => setDocumento(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="field-label block">Teléfono</label>
          <input className="input-field" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>

        <div className="flex gap-3 mt-2">
          <button type="submit" disabled={enviando} className="pr-btn-primary">{enviando ? "Guardando…" : "Guardar cambios"}</button>
          <button type="button" onClick={() => navigate("/wil/perfil")} className="btn-ghost">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
