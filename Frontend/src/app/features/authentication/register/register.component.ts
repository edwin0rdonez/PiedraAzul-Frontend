import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
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

  onRegister(): void {
    const userData = {
      documentNumber: this.documentNumber,
      documentType: this.documentType,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      gender: this.gender,
      birthDate: this.birthDate,
      email: this.email,
      password: this.documentNumber
    };

    console.log('Register attempt:', userData);
    
    alert('Funcionalidad de registro en desarrollo. El número de documento (' + this.documentNumber + ') se usará como contraseña.');
    
    this.registerSuccess.emit();
  }

  onSwitchToLogin(): void {
    this.switchToLogin.emit();
  }
}
