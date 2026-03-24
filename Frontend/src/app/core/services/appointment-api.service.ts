import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ApiResponse } from '../api/api-response.model';
import { Appointment, AppointmentOrigin, AppointmentRequest } from '../models/appointment.model';
import { DoctorAvailability, TimeSlot } from '../models/doctor.model';
import { ConfigurationApiService } from './configuration-api.service';
import { AppointmentStrategyResolver } from '../strategies/appointment-creation.strategy';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly strategyResolver: AppointmentStrategyResolver,
    private readonly configurationApi: ConfigurationApiService
  ) {}

  searchByDoctorAndDate(medicoId: number, fecha: string): Observable<Appointment[]> {
    const params = new HttpParams()
      .set('medicoId', medicoId)
      .set('fecha', fecha);

    return this.http.get<ApiResponse<Appointment[]>>(`${environment.apiBaseUrl}/citas`, { params }).pipe(
      map((response) => (response.data ?? []).slice().sort((left, right) => left.fechaHora.localeCompare(right.fechaHora)))
    );
  }

  getAvailableSlots(medicoId: number, fecha: string): Observable<TimeSlot[]> {
    const params = new HttpParams().set('fecha', fecha);

    return this.http.get<ApiResponse<TimeSlot[]>>(`${environment.apiBaseUrl}/citas/franjas/${medicoId}`, { params }).pipe(
      map((response) => (response.data ?? []).filter((slot) => slot.disponible)),
      switchMap((slots) => {
        if (slots.length > 0) {
          return of(slots.map((slot) => ({
            ...slot,
            hora: this.normalizeTime(slot.hora)
          })));
        }

        return this.buildFallbackSlots(medicoId, fecha);
      }),
      catchError(() => this.buildFallbackSlots(medicoId, fecha))
    );
  }

  create(request: AppointmentRequest, origin: AppointmentOrigin): Observable<Appointment> {
    return this.strategyResolver.resolve(origin).create(request);
  }

  private buildFallbackSlots(medicoId: number, fecha: string): Observable<TimeSlot[]> {
    return this.configurationApi.listDoctorAvailability().pipe(
      switchMap((items) => {
        const availability = items.find((item) => item.medicoId === medicoId);
        if (!availability || !this.matchesSelectedDay(availability, fecha)) {
          return of([]);
        }

        return this.searchByDoctorAndDate(medicoId, fecha).pipe(
          map((appointments) => {
            const occupiedHours = new Set(appointments.map((appointment) => this.normalizeTime(appointment.fechaHora.split('T')[1] ?? '')));
            return this.generateSlots(availability, occupiedHours);
          }),
          catchError(() => of(this.generateSlots(availability, new Set<string>())))
        );
      }),
      catchError(() => of([]))
    );
  }

  private generateSlots(availability: DoctorAvailability, occupiedHours: Set<string>): TimeSlot[] {
    const slots: TimeSlot[] = [];
    let currentMinutes = this.timeToMinutes(this.normalizeTime(availability.horaInicio));
    const endMinutes = this.timeToMinutes(this.normalizeTime(availability.horaFin));

    while (currentMinutes < endMinutes) {
      const formatted = this.minutesToTime(currentMinutes);
      if (!occupiedHours.has(formatted)) {
        slots.push({
          hora: formatted,
          disponible: true
        });
      }
      currentMinutes += availability.intervaloMinutos;
    }

    return slots;
  }

  private matchesSelectedDay(availability: DoctorAvailability, fecha: string): boolean {
    const dayName = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][new Date(`${fecha}T00:00:00`).getDay()];
    return availability.diasSemana.includes(dayName);
  }

  private normalizeTime(value: string): string {
    return value.slice(0, 5);
  }

  private timeToMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map(Number);
    return (hours * 60) + minutes;
  }

  private minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
