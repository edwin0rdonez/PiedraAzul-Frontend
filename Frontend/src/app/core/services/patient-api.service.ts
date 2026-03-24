import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiResponse } from '../api/api-response.model';
import { Patient, PatientRequest } from '../models/patient.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PatientApiService {
  constructor(private readonly http: HttpClient) {}

  findByDocument(documentNumber: string): Observable<Patient | null> {
    return this.http.get<ApiResponse<Patient | null>>(`${environment.apiBaseUrl}/pacientes/documento/${documentNumber}`).pipe(
      map((response) => response.data ?? null)
    );
  }

  save(patient: PatientRequest): Observable<Patient> {
    return this.http.post<ApiResponse<Patient>>(`${environment.apiBaseUrl}/pacientes`, patient).pipe(
      map((response) => response.data)
    );
  }
}
