import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  menuOpen = false;

  constructor(public readonly router: Router) {}

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  get isPatientRoute(): boolean {
    return this.router.url.startsWith('/paciente');
  }

  get brandName(): string {
    if (this.isAdminRoute) {
      return 'Piedrazul Admin';
    }
    if (this.isPatientRoute) {
      return 'Piedrazul Paciente';
    }
    return 'Piedrazul Agenda';
  }

  get userLabel(): string {
    if (this.isAdminRoute) {
      return 'Admin Roberto V.';
    }
    if (this.isPatientRoute) {
      return 'Paciente Web';
    }
    return 'Agendador: Laura M.';
  }

  get userInitials(): string {
    if (this.isAdminRoute) {
      return 'RV';
    }
    if (this.isPatientRoute) {
      return 'PW';
    }
    return 'LM';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
