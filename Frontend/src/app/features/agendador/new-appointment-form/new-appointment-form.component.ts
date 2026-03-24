import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { GENDER_OPTIONS } from '../../../core/constants/day-options';
import { Appointment } from '../../../core/models/appointment.model';
import { Doctor, TimeSlot } from '../../../core/models/doctor.model';
import { Patient } from '../../../core/models/patient.model';
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { DoctorApiService } from '../../../core/services/doctor-api.service';
import { PatientApiService } from '../../../core/services/patient-api.service';
import { combineDateAndTime, toHourLabel } from '../../../core/utils/date-time.utils';
import { colombianCellphoneValidator } from '../../../shared/validators/custom-validators';

@Component({
  selector: 'app-new-appointment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-appointment-form.component.html',
  styleUrls: ['./new-appointment-form.component.css']
})
export class NewAppointmentFormComponent implements OnInit {
  readonly genderOptions = GENDER_OPTIONS;
  readonly form = this.formBuilder.group({
    numeroDocumento: ['', Validators.required],
    nombres: ['', Validators.required],
    celular: ['', [Validators.required, colombianCellphoneValidator()]],
    genero: ['', Validators.required],
    fechaNacimiento: [''],
    correo: ['', Validators.email],
    medicoId: ['', Validators.required],
    fecha: ['', Validators.required],
    hora: ['', Validators.required]
  });

  doctors: Doctor[] = [];
  availableSlots: TimeSlot[] = [];
  selectedAppointment: Appointment | null = null;
  dialogMessage = '';
  dialogVariant: 'success' | 'error' = 'success';
  dialogMode: 'confirm' | 'result' = 'result';
  pendingAction: 'save' | 'cancel' | null = null;
  showDialog = false;
  patientLookupMessage = '';
  submitMessage = '';
  errorMessage = '';
  slotMessage = 'Selecciona medico y fecha para cargar las horas disponibles.';
  isLoadingSlots = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly appointmentApi: AppointmentApiService,
    private readonly doctorApi: DoctorApiService,
    private readonly patientApi: PatientApiService
  ) {}

  ngOnInit(): void {
    this.doctorApi.list().subscribe((doctors) => {
      this.doctors = doctors;
    });
  }

  lookupPatient(): void {
    const documentNumber = this.form.controls.numeroDocumento.value?.trim();
    if (!documentNumber) {
      return;
    }

    this.patientApi.findByDocument(documentNumber).subscribe((patient) => {
      if (!patient) {
        this.patientLookupMessage = '';
        return;
      }

      this.fillPatient(patient);
      this.patientLookupMessage = 'Paciente encontrado. Puedes ajustar sus datos antes de guardar.';
    });
  }

  loadSlots(): void {
    const medicoId = Number(this.form.controls.medicoId.value);
    const fecha = this.form.controls.fecha.value;
    this.errorMessage = '';

    if (!medicoId || !fecha) {
      this.availableSlots = [];
      this.slotMessage = 'Selecciona medico y fecha para cargar las horas disponibles.';
      return;
    }

    this.isLoadingSlots = true;
    this.form.controls.hora.setValue('');

    this.appointmentApi.getAvailableSlots(medicoId, fecha).subscribe({
      next: (slots) => {
        this.availableSlots = slots;
        this.slotMessage = slots.length > 0
          ? 'Selecciona una hora disponible.'
          : 'No hay franjas disponibles para este medico en la fecha seleccionada.';
        this.isLoadingSlots = false;
      },
      error: () => {
        this.errorMessage = 'No fue posible consultar las franjas disponibles.';
        this.slotMessage = 'No fue posible cargar las horas disponibles.';
        this.isLoadingSlots = false;
      }
    });
  }

  selectSlot(slot: TimeSlot): void {
    this.form.controls.hora.setValue(slot.hora);
    this.slotMessage = `Hora seleccionada: ${slot.hora}`;
  }

  selectGender(gender: string): void {
    this.form.controls.genero.setValue(gender);
  }

  isSelectedGender(gender: string): boolean {
    return this.form.controls.genero.value === gender;
  }

  requestSave(): void {
    this.submitMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialogMode = 'result';
      this.dialogVariant = 'error';
      this.dialogMessage = 'Falta informacion obligatoria por completar.';
      this.showDialog = true;
      return;
    }

    this.pendingAction = 'save';
    this.dialogMode = 'confirm';
    this.dialogVariant = 'success';
    this.dialogMessage = 'Desea guardar la cita con la informacion diligenciada?';
    this.showDialog = true;
  }

  submit(): void {
    this.submitMessage = '';
    this.errorMessage = '';

    const value = this.form.getRawValue();
    const fullName = this.splitFullName(value.nombres ?? '');
    this.appointmentApi.create({
      paciente: {
        numeroDocumento: value.numeroDocumento ?? '',
        nombres: fullName.nombres,
        apellidos: fullName.apellidos,
        celular: value.celular ?? '',
        genero: (value.genero ?? 'OTRO') as 'HOMBRE' | 'MUJER' | 'OTRO',
        fechaNacimiento: value.fechaNacimiento || null,
        correo: value.correo || null
      },
      medicoId: Number(value.medicoId),
      fechaHora: combineDateAndTime(value.fecha ?? '', value.hora ?? '')
    }, 'AGENDADOR').subscribe({
      next: (appointment) => {
        this.selectedAppointment = appointment;
        this.availableSlots = this.availableSlots.filter((slot) => slot.hora !== (value.hora ?? ''));
        this.form.controls.hora.setValue('');
        this.slotMessage = 'La hora reservada ya no esta disponible.';
        this.submitMessage = 'Cita creada exitosamente. Puedes registrar otra cita sin recargar la página.';
        this.dialogMode = 'result';
        this.dialogVariant = 'success';
        this.dialogMessage = 'La cita se creo exitosamente.';
        this.pendingAction = null;
        this.showDialog = true;
      },
      error: () => {
        this.errorMessage = 'No fue posible crear la cita. Verifica disponibilidad y datos requeridos.';
        this.dialogMode = 'result';
        this.dialogVariant = 'error';
        this.dialogMessage = 'No se pudo crear la cita. Revisa los datos e intenta nuevamente.';
        this.pendingAction = null;
        this.showDialog = true;
      }
    });
  }

  resetForm(): void {
    this.form.reset();
    this.availableSlots = [];
    this.selectedAppointment = null;
    this.patientLookupMessage = '';
    this.submitMessage = '';
    this.errorMessage = '';
    this.slotMessage = 'Selecciona medico y fecha para cargar las horas disponibles.';
  }

  requestCancel(): void {
    this.pendingAction = 'cancel';
    this.dialogMode = 'confirm';
    this.dialogVariant = 'error';
    this.dialogMessage = 'Desea cancelar? Se perdera la informacion diligenciada.';
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.pendingAction = null;
  }

  confirmDialogAction(): void {
    if (this.pendingAction === 'save') {
      this.showDialog = false;
      this.pendingAction = null;
      this.submit();
      return;
    }

    if (this.pendingAction === 'cancel') {
      this.resetForm();
      this.dialogMode = 'result';
      this.dialogVariant = 'success';
      this.dialogMessage = 'La accion de cancelar se realizo correctamente.';
      this.pendingAction = null;
      return;
    }
  }

  hourLabel(dateTime: string): string {
    return toHourLabel(dateTime);
  }

  get selectedDoctorName(): string {
    const doctor = this.doctors.find((item) => item.id === Number(this.form.controls.medicoId.value));
    return doctor ? `${doctor.nombres} ${doctor.apellidos} - ${doctor.especialidad || 'Especialidad general'}` : 'Sin seleccionar';
  }

  private fillPatient(patient: Patient): void {
    this.form.patchValue({
      nombres: `${patient.nombres} ${patient.apellidos}`.trim(),
      celular: patient.celular,
      genero: patient.genero,
      fechaNacimiento: patient.fechaNacimiento ?? '',
      correo: patient.correo ?? ''
    });
  }

  private splitFullName(fullName: string): { nombres: string; apellidos: string } {
    const parts = fullName.trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);

    if (parts.length <= 1) {
      return {
        nombres: fullName.trim(),
        apellidos: 'Piedrazul'
      };
    }

    return {
      nombres: parts.slice(0, -1).join(' '),
      apellidos: parts.slice(-1).join(' ')
    };
  }
}
