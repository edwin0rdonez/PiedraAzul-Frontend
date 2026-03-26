export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: string;
  activo: boolean;
}