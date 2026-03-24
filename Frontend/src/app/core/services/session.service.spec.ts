import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    localStorage.clear();
    service = new SessionService();
  });

  it('guarda una sesión persistente por 24 horas', () => {
    service.saveSession({
      email: 'paciente@correo.com',
      patientName: 'Ana Pérez',
      numeroDocumento: '123',
      nombres: 'Ana',
      apellidos: 'Pérez',
      celular: '3001234567',
      genero: 'MUJER'
    });
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getSession()?.email).toBe('paciente@correo.com');
  });

  it('elimina la sesión expirada', () => {
    localStorage.setItem('piedrazul.patient.session', JSON.stringify({
      email: 'test@correo.com',
      patientName: 'Test',
      numeroDocumento: '123',
      nombres: 'Test',
      apellidos: 'User',
      celular: '3001234567',
      genero: 'OTRO',
      expiresAt: '2026-03-20T00:00:00.000Z',
      verified: true
    }));

    expect(service.getSession()).toBeNull();
    expect(localStorage.getItem('piedrazul.patient.session')).toBeNull();
  });
});
