import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="app-wrapper">
      @if (!isAdminRoute) {
        <app-navbar></app-navbar>
      }
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      @if (!isAdminRoute) {
        <app-footer></app-footer>
      }
    </div>
  `,
  styles: [`
    .app-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .main-content {
      flex: 1;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'VintageVibe';
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.cartService.getCart().subscribe();
    }
  }
}
