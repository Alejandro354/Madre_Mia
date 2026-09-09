export type Rol = "frank" | "wil" | null;

export interface Sesion {
  rol: Rol;
  nombre?: string;
  id?: number;
}

export interface Practicante {
  id: number;
  nombres: string;
  apellidos: string;
  tipo_documento: string;
  documento: string;
  email: string;
  telefono: string | null;
  foto: string | null;
  cohorte: string;
  estado: string;
}

export interface Documento {
  id: number;
  practicante_id: number;
  nombre_original: string;
  nombre_archivo: string;
  tipo: string;
  tamano_kb: number;
  creado_en: string;
}

export interface Nota {
  id: number;
  practicante_id: number;
  criterio: string;
  periodo: string;
  valor: number;
  creado_en: string;
}

export interface Observacion {
  id: number;
  practicante_id: number;
  texto: string;
  autor: string;
  creado_en: string;
}

export interface Avance {
  id: number;
  practicante_id: number;
  descripcion: string;
  nombre_original: string;
  nombre_archivo: string;
  tipo: string;
  creado_en: string;
}

export interface EventoHistorial {
  id: number;
  practicante_id: number;
  evento: string;
  descripcion: string;
  creado_en: string;
}
