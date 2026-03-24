import { Appointment, AppointmentStatus, AppointmentSummaryItem } from '../models/appointment.model';

export class AppointmentSummaryFactory {
  /*
   * PATRON FACTORY: centraliza la construcción de tarjetas de resumen
   * para desacoplar la vista de las reglas de agregación de estados.
   */
  static create(items: Appointment[]): AppointmentSummaryItem[] {
    const counts = items.reduce<Record<AppointmentStatus, number>>((acc, item) => {
      const status = item.estado ?? 'PENDIENTE';
      acc[status] += 1;
      return acc;
    }, {
      CONFIRMADA: 0,
      PENDIENTE: 0,
      CANCELADA: 0
    });

    return [
      { label: 'Confirmadas', total: counts.CONFIRMADA, tone: 'primary' },
      { label: 'Pendientes', total: counts.PENDIENTE, tone: 'warning' },
      { label: 'Canceladas', total: counts.CANCELADA, tone: 'neutral' }
    ];
  }
}
