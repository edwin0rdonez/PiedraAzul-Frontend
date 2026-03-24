import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { DAY_OPTIONS } from '../../../core/constants/day-options';
import { AuditLogEntry } from '../../../core/models/configuration.model';
import { Doctor, DoctorAvailability } from '../../../core/models/doctor.model';
import { ConfigurationApiService } from '../../../core/services/configuration-api.service';
import { DoctorApiService } from '../../../core/services/doctor-api.service';
import { calculateDailySlots, calculateWindowEndDate } from '../../../core/utils/slot-calculator.util';
import { timeRangeValidator } from '../../../shared/validators/custom-validators';

@Component({
  selector: 'app-availability-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './availability-config.component.html',
  styleUrls: ['./availability-config.component.css']
})
export class AvailabilityConfigComponent implements OnInit {
  readonly dayOptions = DAY_OPTIONS;
  readonly intervalOptions = [15, 20, 30, 45, 60];
  readonly form = this.formBuilder.group({
    ventanaSemanas: [4, [Validators.required, Validators.min(1), Validators.max(52)]],
    medicoId: ['', Validators.required],
    horaInicio: ['08:00', Validators.required],
    horaFin: ['12:00', Validators.required],
    intervaloMinutos: [15, [Validators.required, Validators.min(5)]],
    diasSemana: this.formBuilder.array([], Validators.required)
  }, {
    validators: timeRangeValidator('horaInicio', 'horaFin')
  });

  doctors: Doctor[] = [];
  savedAvailability: DoctorAvailability[] = [];
  auditLog: AuditLogEntry[] = [];
  previewSlotsPerDay = 0;
  message = '';
  errorMessage = '';
  showDialog = false;
  dialogMode: 'confirm' | 'result' = 'result';
  dialogVariant: 'success' | 'error' = 'success';
  dialogMessage = '';
  pendingAction: 'save-window' | 'save-availability' | 'cancel' | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly doctorApi: DoctorApiService,
    private readonly configurationApi: ConfigurationApiService
  ) {}

  ngOnInit(): void {
    this.doctorApi.list().subscribe((doctors) => {
      this.doctors = doctors;
    });

    this.configurationApi.listDoctorAvailability().subscribe((items) => {
      this.savedAvailability = items;
    });

    this.configurationApi.getAppointmentWindow().subscribe((weeks) => {
      this.form.controls.ventanaSemanas.setValue(weeks);
    });

    this.configurationApi.getAuditTrail().subscribe((items) => {
      this.auditLog = items;
    });

    this.updatePreview();
  }

  get daysArray(): FormArray {
    return this.form.controls.diasSemana;
  }

  toggleDay(day: string): void {
    const index = this.daysArray.value.indexOf(day);
    if (index >= 0) {
      this.daysArray.removeAt(index);
    } else {
      this.daysArray.push(this.formBuilder.control(day));
    }
    this.daysArray.markAsTouched();
  }

  isSelected(day: string): boolean {
    return this.daysArray.value.includes(day);
  }

  selectInterval(interval: number): void {
    this.form.controls.intervaloMinutos.setValue(interval);
    this.updatePreview();
  }

  updatePreview(): void {
    this.previewSlotsPerDay = calculateDailySlots({
      medicoId: Number(this.form.controls.medicoId.value || 0),
      diasSemana: this.daysArray.value,
      horaInicio: this.form.controls.horaInicio.value ?? '08:00',
      horaFin: this.form.controls.horaFin.value ?? '12:00',
      intervaloMinutos: Number(this.form.controls.intervaloMinutos.value || 0)
    });
  }

  get selectedDoctorName(): string {
    const doctor = this.doctors.find((item) => item.id === Number(this.form.controls.medicoId.value));
    return doctor ? `${doctor.nombres} ${doctor.apellidos}` : 'Profesional sin seleccionar';
  }

  get weeklySlots(): number {
    return this.previewSlotsPerDay * this.daysArray.length;
  }

  get appointmentWindowEnd(): string {
    return calculateWindowEndDate(new Date().toISOString().slice(0, 10), Number(this.form.controls.ventanaSemanas.value || 0));
  }

  auditClass(action: string): string {
    return action === 'Configuracion' ? 'audit-warning' : 'audit-success';
  }

  requestSaveSystemWindow(): void {
    if (this.form.controls.ventanaSemanas.invalid) {
      this.form.controls.ventanaSemanas.markAsTouched();
      this.openResultDialog('error', 'Falta informacion obligatoria para guardar la ventana de agendamiento.');
      return;
    }

    this.pendingAction = 'save-window';
    this.openConfirmDialog('Desea guardar la configuracion global del sistema?');
  }

  saveSystemWindow(): void {
    this.configurationApi.saveSystemConfiguration({
      ventanaSemanas: Number(this.form.controls.ventanaSemanas.value)
    }).subscribe({
      next: () => {
        this.message = 'Ventana de agendamiento actualizada.';
        this.openResultDialog('success', 'La configuracion global se guardo correctamente.');
      },
      error: () => {
        this.errorMessage = 'No fue posible guardar la ventana de agendamiento.';
        this.openResultDialog('error', 'No se pudo guardar la configuracion global.');
      }
    });
  }

  requestSaveAvailability(): void {
    this.message = '';
    this.errorMessage = '';

    if (this.form.invalid || this.daysArray.length === 0) {
      this.form.markAllAsTouched();
      this.daysArray.markAsTouched();
      this.openResultDialog('error', 'Falta informacion obligatoria para guardar la disponibilidad.');
      return;
    }

    this.pendingAction = 'save-availability';
    this.openConfirmDialog('Desea guardar los cambios de disponibilidad?');
  }

  saveAvailability(): void {
    this.message = '';
    this.errorMessage = '';

    const doctor = this.doctors.find((item) => item.id === Number(this.form.controls.medicoId.value));
    const payload: DoctorAvailability = {
      medicoId: Number(this.form.controls.medicoId.value),
      nombreMedico: doctor ? `${doctor.nombres} ${doctor.apellidos}` : undefined,
      diasSemana: this.daysArray.value,
      horaInicio: this.form.controls.horaInicio.value ?? '08:00',
      horaFin: this.form.controls.horaFin.value ?? '12:00',
      intervaloMinutos: Number(this.form.controls.intervaloMinutos.value)
    };

    this.configurationApi.saveDoctorAvailability(payload).subscribe({
      next: (saved) => {
        this.savedAvailability = [saved, ...this.savedAvailability.filter((item) => item.medicoId !== saved.medicoId)];
        this.configurationApi.getAuditTrail().subscribe((items) => {
          this.auditLog = items;
        });
        this.message = 'Disponibilidad guardada y auditada correctamente.';
        this.openResultDialog('success', 'La disponibilidad del medico se guardo correctamente.');
      },
      error: () => {
        this.errorMessage = 'No fue posible guardar la disponibilidad del medico.';
        this.openResultDialog('error', 'No se pudo guardar la disponibilidad del medico.');
      }
    });
  }

  requestCancel(): void {
    this.pendingAction = 'cancel';
    this.openConfirmDialog('Desea cancelar? Se perderan los cambios no guardados.');
  }

  confirmDialogAction(): void {
    const action = this.pendingAction;
    this.showDialog = false;
    this.pendingAction = null;

    if (action === 'save-window') {
      this.saveSystemWindow();
      return;
    }

    if (action === 'save-availability') {
      this.saveAvailability();
      return;
    }

    if (action === 'cancel') {
      const currentWindow = this.form.controls.ventanaSemanas.value ?? 4;
      this.form.reset({
        ventanaSemanas: currentWindow,
        medicoId: '',
        horaInicio: '08:00',
        horaFin: '12:00',
        intervaloMinutos: 15
      });
      this.daysArray.clear();
      this.updatePreview();
      this.openResultDialog('success', 'La accion de cancelar se realizo correctamente.');
    }
  }

  closeDialog(): void {
    this.showDialog = false;
    this.pendingAction = null;
  }

  private openConfirmDialog(message: string): void {
    this.dialogMode = 'confirm';
    this.dialogVariant = 'success';
    this.dialogMessage = message;
    this.showDialog = true;
  }

  private openResultDialog(variant: 'success' | 'error', message: string): void {
    this.dialogMode = 'result';
    this.dialogVariant = variant;
    this.dialogMessage = message;
    this.showDialog = true;
  }
}
