import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiResponse } from '../api/api-response.model';
import { Appointment, AppointmentOrigin, AppointmentRequest } from '../models/appointment.model';
import { environment } from '../../../environments/environment';

export interface AppointmentCreationStrategy {
  create(request: AppointmentRequest): Observable<Appointment>;
}

@Injectable({ providedIn: 'root' })
export class AgendadorAppointmentStrategy implements AppointmentCreationStrategy {
  constructor(private readonly http: HttpClient) {}

  create(request: AppointmentRequest): Observable<Appointment> {
    return this.http.post<ApiResponse<Appointment>>(`${environment.apiBaseUrl}/citas/agendador`, request).pipe(
      map((response) => response.data)
    );
  }
}

@Injectable({ providedIn: 'root' })
export class PacienteAppointmentStrategy implements AppointmentCreationStrategy {
  constructor(private readonly http: HttpClient) {}

  create(request: AppointmentRequest): Observable<Appointment> {
    return this.http.post<ApiResponse<Appointment>>(`${environment.apiBaseUrl}/citas/paciente`, request).pipe(
      map((response) => response.data)
    );
  }
}

@Injectable({ providedIn: 'root' })
export class AppointmentStrategyResolver {
  /*
   * PATRON STRATEGY: selecciona el endpoint de creación según el origen
   * sin llenar el servicio principal de condicionales específicos.
   */
  constructor(
    private readonly agendadorStrategy: AgendadorAppointmentStrategy,
    private readonly pacienteStrategy: PacienteAppointmentStrategy
  ) {}

  resolve(origin: AppointmentOrigin): AppointmentCreationStrategy {
    return origin === 'PACIENTE' ? this.pacienteStrategy : this.agendadorStrategy;
  }
}
