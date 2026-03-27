import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WebAuthnService } from '../../core/services/webauthn.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private webAuthnService = inject(WebAuthnService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  rememberMe = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.errorMessage.set('Por favor, completa correctamente todos los campos');
      Object.keys(form.controls).forEach(key => form.controls[key].markAsTouched());
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

  onWebAuthnLogin() {
    if (!this.email()) {
      this.errorMessage.set('Por favor, ingresa tu correo electrónico para usar biometría');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.webAuthnService.login(this.email()).subscribe({
      next: (response) => {
        // La respuesta del servidor debe incluir el token JWT
        // Debemos guardarlo en el AuthService (similar a como lo hace login normal)
        this.authService.setSession(response);
        
        this.cartService.getCart().subscribe({
          next: () => {
            this.isLoading.set(false);
            this.router.navigate(['/']);
          },
          error: () => {
            this.isLoading.set(false);
            this.router.navigate(['/']);
          }
        });
      },
      error: (err: any) => {
        this.isLoading.set(true); // Se pone en true para el efecto, pero lo cambiamos abajo
        this.isLoading.set(false);
        this.errorMessage.set('No se pudo autenticar con biometría. Usa tu contraseña.');
      }
    });
  }
}
