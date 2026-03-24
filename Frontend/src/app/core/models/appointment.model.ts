import { PatientRequest } from './patient.model';

export type AppointmentOrigin = 'AGENDADOR' | 'PACIENTE';
export type AppointmentStatus = 'CONFIRMADA' | 'PENDIENTE' | 'CANCELADA';

export interface Appointment {
  id: number;
  pacienteId: number;
  nombrePaciente: string;
  documentoPaciente: string;
  celularPaciente: string;
  medicoId: number;
  nombreMedico: string;
  fechaHora: string;
  origen: AppointmentOrigin;
  creadoEn: string;
  estado?: AppointmentStatus;
}

export interface AppointmentRequest {
  paciente: PatientRequest;
  medicoId: number;
  fechaHora: string;
}

export interface AppointmentSearchFilters {
  medicoId: number | null;
  fecha: string;
}

export interface AppointmentSummaryItem {
  label: string;
  total: number;
  tone: 'primary' | 'warning' | 'neutral';
}
