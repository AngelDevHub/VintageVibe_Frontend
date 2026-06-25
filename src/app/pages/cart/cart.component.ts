import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, ButtonModule, ProgressSpinnerModule, TagModule, ToastModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  providers: [MessageService]
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  authService = inject(AuthService);

  cart = this.cartService.cart;
  isLoading = signal(true);

  ngOnInit() {
    this.cartService.getCart().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false)
    });
  }

  updateQty(itemId: number, qty: number) {
    if (qty < 1) return;
    
    const item = this.cart()?.items.find(i => i.id === itemId);
    if (item && qty > item.stock) {
      this.showToast('warn', 'Stock limitado', `Solo hay ${item.stock} unidades disponibles.`);
      return;
    }

    this.cartService.updateItem(itemId, qty).subscribe({
      error: () => {
        this.showToast('error', 'No se pudo actualizar', 'Intenta de nuevo en unos segundos.');
      }
    });
  }

  removeItem(itemId: number) {
    this.cartService.removeItem(itemId).subscribe({
      next: () => this.showToast('success', 'Producto eliminado', 'El artículo se quitó del carrito.'),
      error: () => this.showToast('error', 'No se pudo eliminar', 'Intenta de nuevo en unos segundos.')
    });
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  private showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 3200
    });
  }
}
