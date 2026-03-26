import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse } from '../../../core/models/login.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() switchToRegister = new EventEmitter<void>();
  
  correo: string = '';
  contrasena: string = '';
  mostrarContrasena: boolean = false;
  cargando: boolean = false;
  error: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onLogin(): void {
    const correoTrimmed = this.correo ? this.correo.trim() : '';
    
    if (!correoTrimmed || !this.contrasena) {
      this.error = 'Por favor ingresa tu usuario y contraseña';
      return;
    }

    this.cargando = true;
    this.error = '';

    const request: LoginRequest = {
      correo: correoTrimmed,
      contrasena: this.contrasena
    };

    this.http.post<any>(`${environment.apiBaseUrl}/sesion/login`, request).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.success && response.data) {
          const user: LoginResponse = response.data;
          if (user.activo) {
            this.guardarSesion(user);
            this.loginSuccess.emit();
          } else {
            this.error = 'Tu cuenta está inactiva. Contacta al administrador.';
          }
        } else {
          this.error = response.message || 'Credenciales incorrectas';
        }
      },
      error: (err) => {
        this.cargando = false;
        if (err.status === 401 || err.status === 400) {
          this.error = 'Usuario o contraseña incorrectos';
        } else {
          this.error = 'Error al conectar con el servidor. Intenta más tarde.';
        }
      }
    });
  }

  private guardarSesion(user: LoginResponse): void {
    const sessionData = {
      id: user.id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      correo: user.correo,
      rol: user.rol,
      activo: user.activo
    };
    localStorage.setItem('piedrazul_user', JSON.stringify(sessionData));
  }

  toggleMostrarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  onSubmit(): void {
    this.onLogin();
  }

  onSwitchToRegister(): void {
    this.switchToRegister.emit();
  }
}