import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  @Output() registerSuccess = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();
  
  documentNumber: string = '';
  documentType: string = 'CC';
  firstName: string = '';
  lastName: string = '';
  phone: string = '';
  gender: string = '';
  birthDate: string = '';
  email: string = '';

  cargando: boolean = false;
  error: string = '';
  success: string = '';

  constructor(private http: HttpClient) {}

  onRegister(): void {
    this.error = '';
    this.success = '';

    if (!this.documentNumber || !this.firstName || !this.lastName || !this.phone || !this.email) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.cargando = true;

    const generoMap: { [key: string]: string } = {
      'M': 'HOMBRE',
      'F': 'MUJER',
      'OTRO': 'OTRO',
      'PND': 'OTRO'
    };

    const request = {
      numeroDocumento: this.documentNumber,
      nombres: this.firstName,
      apellidos: this.lastName,
      correo: this.email,
      contrasena: this.documentNumber,
      celular: this.phone,
      genero: generoMap[this.gender] || 'OTRO',
      fechaNacimiento: this.birthDate || null
    };

    this.http.post<any>(`${environment.apiBaseUrl}/pacientes`, request).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.success) {
          this.success = 'Registro exitoso. Ya puedes iniciar sesión.';
          setTimeout(() => {
            this.registerSuccess.emit();
          }, 1500);
        } else {
          this.error = response.message || 'Error al registrar';
        }
      },
      error: (err) => {
        this.cargando = false;
        this.error = err.error?.message || 'Error al conectar con el servidor';
      }
    });
  }

  onSwitchToLogin(): void {
    this.switchToLogin.emit();
  }
}
