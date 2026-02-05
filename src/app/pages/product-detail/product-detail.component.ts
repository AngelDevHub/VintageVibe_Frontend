import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  template: `
    <div class="product-detail-page">
      <div class="container">
        <h1>Detalle del Producto - Próximamente</h1>
        <p>Esta página está en construcción</p>
      </div>
    </div>
  `,
  styles: [`
    .product-detail-page {
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
export class ProductDetailComponent {}
