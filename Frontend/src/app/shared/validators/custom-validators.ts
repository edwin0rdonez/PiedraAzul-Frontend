import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function colombianCellphoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = `${control.value ?? ''}`.trim();
    if (!value) {
      return null;
    }

    return /^3\d{9}$/.test(value) ? null : {
      colombianCellphone: 'Ingrese un número celular colombiano válido (ej: 3001234567)'
    };
  };
}

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = `${control.value ?? ''}`;
    if (!value) {
      return null;
    }

    const valid = value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);
    return valid ? null : {
      strongPassword: 'La contraseña debe tener mínimo 8 caracteres, 1 mayúscula y 1 número'
    };
  };
}

export function passwordMatchValidator(passwordKey: string, confirmationKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordKey)?.value;
    const confirmation = control.get(confirmationKey)?.value;

    if (!password || !confirmation) {
      return null;
    }

    return password === confirmation ? null : { passwordMismatch: 'Las contraseñas no coinciden' };
  };
}

export function timeRangeValidator(startKey: string, endKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const start = control.get(startKey)?.value as string | undefined;
    const end = control.get(endKey)?.value as string | undefined;

    if (!start || !end) {
      return null;
    }

    return start < end ? null : { invalidTimeRange: 'La hora fin debe ser posterior a la hora inicio' };
  };
}
