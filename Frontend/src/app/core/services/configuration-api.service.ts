import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { ApiResponse } from '../api/api-response.model';
import { AuditLogEntry, SystemConfigurationRequest } from '../models/configuration.model';
import { DoctorAvailability } from '../models/doctor.model';
import { AuditLogFactory } from '../factories/audit-log.factory';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfigurationApiService {
  private readonly auditLogs: AuditLogEntry[] = [
    {
      id: 'seed-1',
      actor: 'Roberto V.',
      action: 'Modificacion',
      timestamp: '10/03/2026 08:14',
      detail: 'Intervalo Dr. Ruiz: 30 min → 20 min'
    },
    {
      id: 'seed-2',
      actor: 'Roberto V.',
      action: 'Configuracion',
      timestamp: '08/03/2026 14:02',
      detail: 'Ventana agendamiento: 3 sem → 4 sem'
    }
  ];
  private cachedWindowWeeks = environment.defaultAppointmentWindowWeeks;

  constructor(private readonly http: HttpClient) {}

  listDoctorAvailability(): Observable<DoctorAvailability[]> {
    return this.http.get<ApiResponse<DoctorAvailability[]>>(`${environment.apiBaseUrl}/configuracion`).pipe(
      map((response) => response.data ?? [])
    );
  }

  saveDoctorAvailability(payload: DoctorAvailability, actor = 'admin.web'): Observable<DoctorAvailability> {
    return this.http.post<ApiResponse<DoctorAvailability>>(`${environment.apiBaseUrl}/configuracion/disponibilidad`, payload).pipe(
      map((response) => response.data),
      tap((saved) => {
        this.auditLogs.unshift(AuditLogFactory.availabilitySaved(actor, saved));
      })
    );
  }

  saveSystemConfiguration(payload: SystemConfigurationRequest): Observable<void> {
    return this.http.post<ApiResponse<null>>(`${environment.apiBaseUrl}/configuracion/sistema`, payload).pipe(
      tap(() => {
        this.cachedWindowWeeks = payload.ventanaSemanas;
        this.auditLogs.unshift(AuditLogFactory.windowSaved('admin.web', payload.ventanaSemanas));
      }),
      map(() => void 0)
    );
  }

  getAppointmentWindow(): Observable<number> {
    /*
     * El backend recibido expone POST /api/configuracion/sistema, pero no un GET
     * para consultar la ventana actual. Dejamos esta lectura desacoplada y lista
     * para conectarse cuando el endpoint exista, usando una caché local segura.
     */
    return of(this.cachedWindowWeeks);
  }

  getAuditTrail(): Observable<AuditLogEntry[]> {
    return of(this.auditLogs);
  }
}
