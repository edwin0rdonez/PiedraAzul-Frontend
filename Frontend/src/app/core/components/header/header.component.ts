import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() isLoggedIn = false;
  @Input() userLabel = '';
  @Input() userInitials = '';

  @Output() toggleMenuClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();
  @Output() loginClick = new EventEmitter<void>();
  @Output() registerClick = new EventEmitter<void>();

  onToggleMenu(): void {
    this.toggleMenuClick.emit();
  }

  onLogout(): void {
    this.logoutClick.emit();
  }

  onLogin(): void {
    this.loginClick.emit();
  }

  onRegister(): void {
    this.registerClick.emit();
  }
}