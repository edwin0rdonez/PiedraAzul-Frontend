import { AppointmentSummaryFactory } from './appointment-summary.factory';

describe('AppointmentSummaryFactory', () => {
  it('resume correctamente las citas por estado', () => {
    const summary = AppointmentSummaryFactory.create([
      { id: 1, pacienteId: 1, nombrePaciente: 'Ana', documentoPaciente: '1', celularPaciente: '300', medicoId: 1, nombreMedico: 'Doc', fechaHora: '2026-03-24T08:00:00', origen: 'PACIENTE', creadoEn: '2026-03-24T07:00:00', estado: 'CONFIRMADA' },
      { id: 2, pacienteId: 2, nombrePaciente: 'Luis', documentoPaciente: '2', celularPaciente: '301', medicoId: 1, nombreMedico: 'Doc', fechaHora: '2026-03-24T09:00:00', origen: 'AGENDADOR', creadoEn: '2026-03-24T07:10:00', estado: 'PENDIENTE' },
      { id: 3, pacienteId: 3, nombrePaciente: 'Sara', documentoPaciente: '3', celularPaciente: '302', medicoId: 1, nombreMedico: 'Doc', fechaHora: '2026-03-24T10:00:00', origen: 'AGENDADOR', creadoEn: '2026-03-24T07:20:00', estado: 'CANCELADA' }
    ]);

    expect(summary[0].total).toBe(1);
    expect(summary[1].total).toBe(1);
    expect(summary[2].total).toBe(1);
  });
});
