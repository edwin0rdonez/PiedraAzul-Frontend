import { UiMappersService } from './ui-mappers.service';

describe('UiMappersService', () => {
  it('marca como confirmadas las citas creadas por paciente', () => {
    const service = new UiMappersService();
    const [appointment] = service.hydrateStatus([{
      id: 1,
      pacienteId: 1,
      nombrePaciente: 'Ana',
      documentoPaciente: '1',
      celularPaciente: '300',
      medicoId: 2,
      nombreMedico: 'Dr. Gómez',
      fechaHora: '2026-03-24T08:00:00',
      origen: 'PACIENTE',
      creadoEn: '2026-03-24T07:00:00'
    }]);

    expect(appointment.estado).toBe('CONFIRMADA');
  });
});
