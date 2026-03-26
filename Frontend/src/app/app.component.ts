import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/components/header/header.component';
import { LoginComponent } from './features/authentication/login/login.component';
import { RegisterComponent } from './features/authentication/register/register.component';

interface UserSession {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: string;
  activo: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, HeaderComponent, LoginComponent, RegisterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  menuOpen = false;
  showLoginModal = false;
  showRegisterModal = false;

  constructor(private router: Router) {}

  openLoginModal(): void {
    this.showLoginModal = true;
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  openRegisterModal(): void {
    this.showRegisterModal = true;
  }

  closeRegisterModal(): void {
    this.showRegisterModal = false;
  }

  onLoginSuccess(): void {
    this.showLoginModal = false;
    this.router.navigate(['/inicio']);
  }

  onRegisterSuccess(): void {
    this.showRegisterModal = false;
    this.router.navigate(['/inicio']);
  }

  get isAuthRoute(): boolean {
    const url = window.location.pathname;
    return url === '/inicio' || url === '/login' || url === '/register';
  }

  private getUserFromStorage(): UserSession | null {
    const userStr = localStorage.getItem('piedrazul_user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as UserSession;
      } catch {
        return null;
      }
    }
    return null;
  }

  get isLoggedIn(): boolean {
    return this.getUserFromStorage() !== null;
  }

  get showSidebar(): boolean {
    return this.isLoggedIn;
  }

  get showHeader(): boolean {
    return true;
  }

  get brandName(): string {
    const user = this.getUserFromStorage();
    if (user) {
      const rol = user.rol.toUpperCase();
      if (rol === 'ADMIN' || rol === 'MEDICO') return 'Piedrazul Admin';
      if (rol === 'PACIENTE') return 'Piedrazul Paciente';
    }
    return 'Piedrazul Agenda';
  }

  get userLabel(): string {
    const user = this.getUserFromStorage();
    if (!user) return '';
    return `${user.nombres} ${user.apellidos}`;
  }

  get userInitials(): string {
    const user = this.getUserFromStorage();
    if (!user) return '';
    const nombres = user.nombres.split(' ').map(n => n.charAt(0).toUpperCase()).join('');
    const apellido = user.apellidos.split(' ')[0]?.charAt(0).toUpperCase() || '';
    return nombres + apellido;
  }

  get isAdmin(): boolean {
    const user = this.getUserFromStorage();
    if (!user) return false;
    const rol = user.rol.toUpperCase();
    return rol === 'ADMIN' || rol === 'MEDICO';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    localStorage.removeItem('piedrazul_user');
    localStorage.removeItem('piedrazul.patient.session');
    window.location.href = '/inicio';
  }
}