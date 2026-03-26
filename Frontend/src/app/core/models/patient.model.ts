export type Gender = 'HOMBRE' | 'MUJER' | 'OTRO';

export interface Patient {
  id: number;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  celular: string;
  genero: Gender;
  fechaNacimiento?: string | null;
  correo?: string | null;
}

export interface PatientRequest {
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  celular: string;
  genero: Gender;
  fechaNacimiento?: string | null;
  correo?: string | null;
  contrasena?: string;
}

export interface PatientRegistration extends PatientRequest {
  password: string;
  passwordConfirmation: string;
}

export interface PatientSession {
  email: string;
  patientName: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  celular: string;
  genero: Gender;
  expiresAt: string;
  verified: boolean;
}
