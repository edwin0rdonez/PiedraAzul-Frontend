import { AuditLogEntry } from '../models/configuration.model';
import { DoctorAvailability } from '../models/doctor.model';

export class AuditLogFactory {
  /*
   * PATRON FACTORY: encapsula la creacion de eventos de auditoria para
   * mantener un formato consistente sin propagar detalles por la UI.
   */
  static availabilitySaved(actor: string, availability: DoctorAvailability): AuditLogEntry {
    return {
      id: `${availability.medicoId}-${Date.now()}`,
      actor,
      action: 'Modificacion',
      timestamp: new Date().toISOString(),
      detail: `${availability.nombreMedico ?? `Medico ${availability.medicoId}`} · ${availability.intervaloMinutos} min · ${availability.horaInicio} - ${availability.horaFin}`
    };
  }

  static windowSaved(actor: string, weeks: number): AuditLogEntry {
    return {
      id: `window-${Date.now()}`,
      actor,
      action: 'Configuracion',
      timestamp: new Date().toISOString(),
      detail: `Ventana de agendamiento configurada a ${weeks} semanas`
    };
  }
}
