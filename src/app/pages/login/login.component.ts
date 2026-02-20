import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  rememberMe = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  onSubmit() {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor completa todos los campos');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login({ email: this.email(), password: this.password() }).subscribe({
      next: () => {
        // Cargar el carrito antes de navegar
        this.cartService.getCart().subscribe({
          next: () => {
            this.isLoading.set(false);
            this.router.navigate(['/']);
          },
          error: () => {
            this.isLoading.set(false);
            this.router.navigate(['/']); // Navegar aunque falle el carrito
          }
        });
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.status === 401 ? 'Credenciales incorrectas' : 'Error al iniciar sesión. Intenta de nuevo.'
        );
      }
    });
  }

  loginWithGoogle() {
    alert('Iniciar sesión con Google - Funcionalidad próximamente');
  }

  loginWithFacebook() {
    alert('Iniciar sesión con Facebook - Funcionalidad próximamente');
  }
}
