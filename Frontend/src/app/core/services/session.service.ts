import { Injectable } from '@angular/core';

import { Gender, PatientSession } from '../models/patient.model';
import { environment } from '../../../environments/environment';

const SESSION_STORAGE_KEY = 'piedrazul.patient.session';

@Injectable({ providedIn: 'root' })
export class SessionService {
  saveSession(sessionInput: {
    email: string;
    patientName: string;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    celular: string;
    genero: Gender;
  }): void {
    const expiresAt = new Date(Date.now() + (environment.sessionHours * 60 * 60 * 1000)).toISOString();
    const session: PatientSession = {
      ...sessionInput,
      expiresAt,
      verified: true
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  getSession(): PatientSession | null {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PatientSession;
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      this.clear();
      return null;
    }

    return parsed;
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  clear(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}
