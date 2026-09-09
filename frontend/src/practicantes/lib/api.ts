// Ruta relativa a propósito: el navegador la resuelve contra el origen de la
// página, así que frontend y backend son literalmente el mismo sitio y la
// cookie de sesión viaja sin problemas. El proxy de Vite reenvía /practicantes/api
// al gateway, que sirve este backend bajo ese prefijo.
export const API_BASE = '/practicantes';

export class ApiError extends Error {
  status: number;
  rolActivo?: string;
  constructor(message: string, status: number, rolActivo?: string) {
    super(message);
    this.status = status;
    this.rolActivo = rolActivo;
  }
}

async function manejarRespuesta(res: Response) {
  let cuerpo: any = null;
  try {
    cuerpo = await res.json();
  } catch {
    /* respuesta sin cuerpo JSON (ej. DELETE 204) */
  }
  if (!res.ok) {
    const mensaje = cuerpo?.error || `Error ${res.status}`;
    // Sesión inválida o vencida (ej. backend reiniciado, cookie de una BD anterior):
    // avisamos globalmente para que la app vuelva al login en vez de quedar muda.
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent("sesion-invalida"));
    }
    throw new ApiError(mensaje, res.status, cuerpo?.rol_activo);
  }
  return cuerpo;
}

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  return manejarRespuesta(res);
}

export async function apiPost(path: string, body?: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return manejarRespuesta(res);
}

export async function apiPostForm(path: string, formData: FormData, method: string = "POST") {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    body: formData,
  });
  return manejarRespuesta(res);
}

export async function apiPut(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { method: "PUT", credentials: "include" });
  return manejarRespuesta(res);
}

export async function apiDelete(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE", credentials: "include" });
  return manejarRespuesta(res);
}

export function urlArchivo(path: string) {
  return `${API_BASE}${path}`;
}
