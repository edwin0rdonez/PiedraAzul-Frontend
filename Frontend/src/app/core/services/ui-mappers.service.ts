import { Injectable } from '@angular/core';

import { Appointment, AppointmentStatus } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class UiMappersService {
  hydrateStatus(appointments: Appointment[]): Appointment[] {
    return appointments.map((item) => ({
      ...item,
      estado: this.resolveStatus(item)
    }));
  }

  private resolveStatus(item: Appointment): AppointmentStatus {
    if (item.origen === 'PACIENTE') {
      return 'CONFIRMADA';
    }

    return new Date(item.fechaHora).getMinutes() % 2 === 0 ? 'PENDIENTE' : 'CONFIRMADA';
  }
}
