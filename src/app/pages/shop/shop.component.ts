import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop',
  imports: [CommonModule],
  template: `
    <div class="shop-page">
      <div class="container">
        <h1>Tienda - Próximamente</h1>
        <p>Esta página está en construcción</p>
      </div>
    </div>
  `,
  styles: [`
    .shop-page {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--spacing-4xl);
    }
    
    h1 {
      color: var(--color-primary);
    }
  `]
})
export class ShopComponent {}
