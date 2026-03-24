import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Appointment, AppointmentSummaryItem } from '../../../core/models/appointment.model';
import { Doctor } from '../../../core/models/doctor.model';
import { AppointmentSummaryFactory } from '../../../core/factories/appointment-summary.factory';
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { DoctorApiService } from '../../../core/services/doctor-api.service';
import { UiMappersService } from '../../../core/services/ui-mappers.service';
import { formatDateLabel, toHourLabel } from '../../../core/utils/date-time.utils';

@Component({
  selector: 'app-appointment-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-search.component.html',
  styleUrls: ['./appointment-search.component.css']
})
export class AppointmentSearchComponent implements OnInit {
  readonly searchForm = this.formBuilder.group({
    medicoId: ['', Validators.required],
    fecha: ['', Validators.required]
  });

  doctors: Doctor[] = [];
  appointments: Appointment[] = [];
  summary: AppointmentSummaryItem[] = [];
  isLoading = false;
  searchExecuted = false;
  errorMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly appointmentApi: AppointmentApiService,
    private readonly doctorApi: DoctorApiService,
    private readonly uiMappers: UiMappersService
  ) {}

  ngOnInit(): void {
    this.doctorApi.list().subscribe((doctors) => {
      this.doctors = doctors;
    });
  }

  search(): void {
    this.searchExecuted = true;
    this.errorMessage = '';
    this.appointments = [];
    this.summary = [];

    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const medicoId = Number(this.searchForm.value.medicoId);
    const fecha = this.searchForm.value.fecha ?? '';
    this.isLoading = true;

    this.appointmentApi.searchByDoctorAndDate(medicoId, fecha).subscribe({
      next: (appointments) => {
        this.appointments = this.uiMappers.hydrateStatus(appointments);
        this.summary = AppointmentSummaryFactory.create(this.appointments);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No fue posible consultar las citas. Verifica la conexión con la API.';
        this.isLoading = false;
      }
    });
  }

  get selectedDateLabel(): string {
    const fecha = this.searchForm.value.fecha;
    return fecha ? formatDateLabel(fecha) : '';
  }

  hourLabel(dateTime: string): string {
    return toHourLabel(dateTime);
  }

  getMetricValue(label: string): number {
    return this.summary.find((item) => item.label === label)?.total ?? 0;
  }

  statusClass(status?: string): string {
    switch (status) {
      case 'CONFIRMADA':
        return 'status-confirmed';
      case 'CANCELADA':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  trackByAppointment(_: number, appointment: Appointment): number {
    return appointment.id;
  }
}
