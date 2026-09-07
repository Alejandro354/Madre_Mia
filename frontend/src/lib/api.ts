// El backend siempre corre en el puerto 5000. Usamos el MISMO hostname con el
// que se abrió la página (localhost, 127.0.0.1, o una IP de red) para que el
// navegador considere frontend y backend como "el mismo sitio" — si no,
// la cookie de sesión se guarda pero el navegador la bloquea en las
// siguientes peticiones (parece que el login funciona y luego te regresa
// solo al login).
export const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;

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
