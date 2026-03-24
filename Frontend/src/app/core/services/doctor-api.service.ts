import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiResponse } from '../api/api-response.model';
import { Doctor } from '../models/doctor.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DoctorApiService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Doctor[]> {
    return this.http.get<ApiResponse<Doctor[]>>(`${environment.apiBaseUrl}/medicos`).pipe(
      map((response) => response.data ?? [])
    );
  }
}
