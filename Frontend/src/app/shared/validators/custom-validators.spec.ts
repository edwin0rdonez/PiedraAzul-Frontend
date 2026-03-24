import { FormControl, FormGroup } from '@angular/forms';

import {
  colombianCellphoneValidator,
  passwordMatchValidator,
  strongPasswordValidator,
  timeRangeValidator
} from './custom-validators';

describe('custom validators', () => {
  it('valida celulares colombianos', () => {
    const control = new FormControl('3001234567', colombianCellphoneValidator());
    expect(control.errors).toBeNull();

    control.setValue('2001234567');
    expect(control.errors?.['colombianCellphone']).toBeTruthy();
  });

  it('valida fortaleza de contraseña', () => {
    const control = new FormControl('Seguro123', strongPasswordValidator());
    expect(control.errors).toBeNull();

    control.setValue('seguro');
    expect(control.errors?.['strongPassword']).toBeTruthy();
  });

  it('valida coincidencia de contraseñas', () => {
    const group = new FormGroup({
      password: new FormControl('Seguro123'),
      passwordConfirmation: new FormControl('Seguro123')
    }, { validators: passwordMatchValidator('password', 'passwordConfirmation') });

    expect(group.errors).toBeNull();
    group.get('passwordConfirmation')?.setValue('Otro1234');
    expect(group.errors?.['passwordMismatch']).toBeTruthy();
  });

  it('valida rango horario correcto', () => {
    const group = new FormGroup({
      horaInicio: new FormControl('08:00'),
      horaFin: new FormControl('09:00')
    }, { validators: timeRangeValidator('horaInicio', 'horaFin') });

    expect(group.errors).toBeNull();
    group.get('horaFin')?.setValue('07:00');
    expect(group.errors?.['invalidTimeRange']).toBeTruthy();
  });
});
