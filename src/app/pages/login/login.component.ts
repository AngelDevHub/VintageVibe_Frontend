import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  rememberMe = signal(false);
  isLoading = signal(false);
  
  constructor(private router: Router) {}
  
  onSubmit() {
    this.isLoading.set(true);
    // Simulamos una llamada API
    setTimeout(() => {
      this.isLoading.set(false);
      alert('¡Bienvenido a VintageVibe!');
      this.router.navigate(['/']);
    }, 1500);
  }
  
  loginWithGoogle() {
    alert('Iniciar sesión con Google - Funcionalidad próximamente');
  }
  
  loginWithFacebook() {
    alert('Iniciar sesión con Facebook - Funcionalidad próximamente');
  }
}
