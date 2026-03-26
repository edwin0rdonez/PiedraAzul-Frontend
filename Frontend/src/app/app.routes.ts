import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { AvailabilityConfigComponent } from './features/admin/availability-config/availability-config.component';
import { AppointmentSearchComponent } from './features/agendador/appointment-search/appointment-search.component';
import { NewAppointmentFormComponent } from './features/agendador/new-appointment-form/new-appointment-form.component';
import { PatientPortalComponent } from './features/patient/patient-portal/patient-portal.component';
import { PatientRegistrationComponent } from './features/patient/patient-registration/patient-registration.component';
import { DashboardComponent } from './features/agendador/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: 'inicio', component: DashboardComponent },
  { path: 'agendador/consulta', component: AppointmentSearchComponent, canActivate: [authGuard] },
  { path: 'agendador/nuevaCita', component: NewAppointmentFormComponent, canActivate: [authGuard] },
  { path: 'paciente/registro', component: PatientRegistrationComponent },
  { path: 'paciente/portal', component: PatientPortalComponent, canActivate: [authGuard] },
  { path: 'admin/disponibilidad', component: AvailabilityConfigComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'inicio' }
];
