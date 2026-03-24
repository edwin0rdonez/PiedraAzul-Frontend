import { calculateDailySlots, calculateWindowEndDate } from './slot-calculator.util';

describe('slot-calculator.util', () => {
  it('calcula el número de citas posibles por día', () => {
    expect(calculateDailySlots({
      medicoId: 1,
      diasSemana: ['MONDAY'],
      horaInicio: '08:00',
      horaFin: '12:00',
      intervaloMinutos: 30
    })).toBe(8);
  });

  it('retorna cero cuando el rango horario es inválido', () => {
    expect(calculateDailySlots({
      medicoId: 1,
      diasSemana: ['MONDAY'],
      horaInicio: '12:00',
      horaFin: '08:00',
      intervaloMinutos: 30
    })).toBe(0);
  });

  it('calcula la fecha fin de la ventana de agendamiento', () => {
    expect(calculateWindowEndDate('2026-03-24', 2)).toBe('2026-04-07');
  });
});
