# Reserva de Citas Médicas Piedrazul SPA

Single Page Application en Angular organizada por capas para el sprint funcional de:

- HU-01 Consulta de citas por médico y fecha
- HU-02 Creación de cita desde WhatsApp
- HU-03a Registro del paciente
- HU-03b Portal de autoagendamiento en 3 pasos
- HU-04a Configuración de ventana de agendamiento
- HU-04b Configuración de disponibilidad médica

## Arquitectura

La estructura sigue una separación tipo Clean Architecture / frontend por capas:

```text
src/
  app/
    core/
      api/            -> contratos REST y wrappers
      constants/      -> catálogos reutilizables
      factories/      -> Factory para resúmenes y auditoría
      guards/         -> control de sesión
      models/         -> entidades e interfaces de dominio
      services/       -> lógica de negocio y acceso a la API
      state/          -> Observer store para el wizard del paciente
      strategies/     -> Strategy para creación de citas por origen
      utils/          -> reglas puras de fechas, slots y contraseñas
    features/
      agendador/
      admin/
      patient/
    shared/
      validators/     -> validaciones reusables de formularios
```

## Integración REST

El frontend consume estos endpoints del backend Spring Boot recibido:

- `GET /api/medicos`
- `GET /api/citas?medicoId={id}&fecha=YYYY-MM-DD`
- `GET /api/citas/franjas/{medicoId}?fecha=YYYY-MM-DD`
- `POST /api/citas/agendador`
- `POST /api/citas/paciente`
- `GET /api/pacientes/documento/{numero}`
- `POST /api/pacientes`
- `GET /api/configuracion`
- `POST /api/configuracion/disponibilidad`
- `POST /api/configuracion/sistema`



## Patrones aplicados

- Observer: [booking-wizard.store.ts] usa `BehaviorSubject` para publicar cambios del flujo de agendamiento.
- Strategy: [appointment-creation.strategy.ts] decide el endpoint según el origen de la cita.
- Factory: [appointment-summary.factory.ts] y [audit-log.factory.ts] encapsulan construcción de resúmenes y auditoría.

Cada patrón está documentado con comentarios técnicos directamente en el código.






