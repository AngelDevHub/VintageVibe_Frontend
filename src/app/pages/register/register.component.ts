import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  acceptTerms = signal(false);
  isLoading = signal(false);
  
  constructor(private router: Router) {}
  
  onSubmit() {
    if (this.password() !== this.confirmPassword()) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (!this.acceptTerms()) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }
    
    this.isLoading.set(true);
    // Simulamos una llamada API
    setTimeout(() => {
      this.isLoading.set(false);
      alert('¡Cuenta creada exitosamente!');
      this.router.navigate(['/login']);
    }, 1500);
  }
}
