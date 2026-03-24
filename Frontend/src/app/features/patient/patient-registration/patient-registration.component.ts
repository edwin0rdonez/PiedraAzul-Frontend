import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { GENDER_OPTIONS } from '../../../core/constants/day-options';
import { PatientApiService } from '../../../core/services/patient-api.service';
import { SessionService } from '../../../core/services/session.service';
import { getPasswordStrength } from '../../../core/utils/password.utils';
import {
  colombianCellphoneValidator,
  passwordMatchValidator,
  strongPasswordValidator
} from '../../../shared/validators/custom-validators';

@Component({
  selector: 'app-patient-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './patient-registration.component.html',
  styleUrls: ['./patient-registration.component.css']
})
export class PatientRegistrationComponent {
  readonly genderOptions = GENDER_OPTIONS;
  readonly form = this.formBuilder.group({
    numeroDocumento: ['', Validators.required],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    celular: ['', [Validators.required, colombianCellphoneValidator()]],
    genero: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, strongPasswordValidator()]],
    passwordConfirmation: ['', Validators.required]
  }, {
    validators: passwordMatchValidator('password', 'passwordConfirmation')
  });

  message = '';
  errorMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly patientApi: PatientApiService,
    private readonly sessionService: SessionService,
    private readonly router: Router
  ) {}

  get passwordStrengthLabel(): string {
    return getPasswordStrength(this.form.controls.password.value ?? '').label;
  }

  submit(): void {
    this.message = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.patientApi.save({
      numeroDocumento: value.numeroDocumento ?? '',
      nombres: value.nombres ?? '',
      apellidos: value.apellidos ?? '',
      celular: value.celular ?? '',
      genero: (value.genero ?? 'OTRO') as 'HOMBRE' | 'MUJER' | 'OTRO',
      correo: value.correo ?? '',
      fechaNacimiento: null
    }).subscribe({
      next: () => {
        this.sessionService.saveSession({
          email: value.correo ?? '',
          patientName: `${value.nombres} ${value.apellidos}`,
          numeroDocumento: value.numeroDocumento ?? '',
          nombres: value.nombres ?? '',
          apellidos: value.apellidos ?? '',
          celular: value.celular ?? '',
          genero: (value.genero ?? 'OTRO') as 'HOMBRE' | 'MUJER' | 'OTRO'
        });
        this.message = 'Cuenta registrada. ';
        void this.router.navigateByUrl('/paciente/portal');
      },
      error: () => {
        this.errorMessage = 'No se pudo registrar la cuenta. Si el correo ya existe, sugiere iniciar sesión.';
      }
    });
  }
}
