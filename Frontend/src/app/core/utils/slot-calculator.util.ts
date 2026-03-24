import { DoctorAvailability } from '../models/doctor.model';

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return (hours * 60) + minutes;
}

export function calculateDailySlots(availability: DoctorAvailability): number {
  const start = timeToMinutes(availability.horaInicio);
  const end = timeToMinutes(availability.horaFin);
  const duration = end - start;

  if (duration <= 0 || availability.intervaloMinutos <= 0) {
    return 0;
  }

  return Math.floor(duration / availability.intervaloMinutos);
}

export function calculateWindowEndDate(startDate: string, weeks: number): string {
  const date = new Date(`${startDate}T00:00:00`);
  date.setDate(date.getDate() + (weeks * 7));
  return date.toISOString().slice(0, 10);
}
