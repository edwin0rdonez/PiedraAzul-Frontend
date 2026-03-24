import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { Appointment } from '../../../core/models/appointment.model';
import { Doctor, TimeSlot } from '../../../core/models/doctor.model';
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { ConfigurationApiService } from '../../../core/services/configuration-api.service';
import { DoctorApiService } from '../../../core/services/doctor-api.service';
import { SessionService } from '../../../core/services/session.service';
import { BookingWizardStore } from '../../../core/state/booking-wizard.store';
import { calculateWindowEndDate } from '../../../core/utils/slot-calculator.util';

@Component({
  selector: 'app-patient-portal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-portal.component.html',
  styleUrls: ['./patient-portal.component.css']
})
export class PatientPortalComponent implements OnInit {
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  specialties: string[] = [];
  selectedSpecialty = '';
  availableSlots: TimeSlot[] = [];
  confirmation: Appointment | null = null;
  sessionName = '';
  minDate = new Date().toISOString().slice(0, 10);
  maxDate = this.minDate;

  readonly steps = [
    { index: 1, title: '1. Médico' },
    { index: 2, title: '2. Fecha y hora' },
    { index: 3, title: '3. Confirmación' }
  ] as const;

  constructor(
    public readonly wizardStore: BookingWizardStore,
    private readonly doctorApi: DoctorApiService,
    private readonly appointmentApi: AppointmentApiService,
    private readonly configurationApi: ConfigurationApiService,
    private readonly sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.sessionName = this.sessionService.getSession()?.patientName ?? 'Paciente';
    this.doctorApi.list().subscribe((doctors) => {
      this.doctors = doctors;
      this.filteredDoctors = doctors;
      this.specialties = Array.from(new Set(doctors.map((doctor) => doctor.especialidad || 'General')));
    });

    this.configurationApi.getAppointmentWindow().subscribe((weeks) => {
      this.maxDate = calculateWindowEndDate(this.minDate, weeks);
    });
  }

  filterBySpecialty(value: string): void {
    this.selectedSpecialty = value;
    this.filteredDoctors = value
      ? this.doctors.filter((doctor) => (doctor.especialidad || 'General') === value)
      : this.doctors;
  }

  selectDoctor(doctor: Doctor): void {
    this.wizardStore.update({
      step: 2,
      selectedDoctor: doctor,
      selectedDate: null,
      selectedSlot: null
    });
    this.availableSlots = [];
  }

  loadSlots(date: string): void {
    const doctor = this.wizardStore.snapshot.selectedDoctor;
    if (!doctor) {
      return;
    }

    this.wizardStore.update({
      selectedDate: date,
      selectedSlot: null
    });

    this.appointmentApi.getAvailableSlots(doctor.id, date).subscribe((slots) => {
      this.availableSlots = slots;
    });
  }

  selectSlot(slot: TimeSlot): void {
    this.wizardStore.update({
      selectedSlot: slot,
      step: 3
    });
  }

  confirmAppointment(): void {
    const snapshot = this.wizardStore.snapshot;
    const session = this.sessionService.getSession();
    if (!snapshot.selectedDoctor || !snapshot.selectedDate || !snapshot.selectedSlot || !session) {
      return;
    }

    this.appointmentApi.create({
      paciente: {
        numeroDocumento: session.numeroDocumento,
        nombres: session.nombres,
        apellidos: session.apellidos,
        celular: session.celular,
        genero: session.genero,
        correo: session.email,
        fechaNacimiento: null
      },
      medicoId: snapshot.selectedDoctor.id,
      fechaHora: `${snapshot.selectedDate}T${snapshot.selectedSlot.hora}:00`
    }, 'PACIENTE').subscribe({
      next: (appointment) => {
        this.confirmation = appointment;
      },
      error: () => {
        this.confirmation = null;
      }
    });
  }

  backToDoctorSelection(): void {
    this.wizardStore.update({ step: 1, selectedDoctor: null, selectedDate: null, selectedSlot: null });
    this.availableSlots = [];
    this.confirmation = null;
  }
}
