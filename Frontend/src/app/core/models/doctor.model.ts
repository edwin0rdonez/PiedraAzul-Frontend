export interface Doctor {
  id: number;
  nombres: string;
  apellidos: string;
  especialidad?: string;
  activo: boolean;
  fotoUrl?: string;
}

export interface DoctorAvailability {
  id?: number;
  medicoId: number;
  nombreMedico?: string;
  diasSemana: string[];
  horaInicio: string;
  horaFin: string;
  intervaloMinutos: number;
}

export interface TimeSlot {
  hora: string;
  disponible: boolean;
}
