import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  readonly cartGoal = 3000;
  private cartService = inject(CartService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  authService = inject(AuthService);

  cart = this.cartService.cart;
  isLoading = signal(true);
  itemCount = computed(() => this.cart()?.items.length ?? 0);
  unitCount = computed(() => (this.cart()?.items ?? []).reduce((total, item) => total + item.quantity, 0));
  lowStockItems = computed(() => (this.cart()?.items ?? []).filter(item => item.stock <= 3));
  amountToGoal = computed(() => Math.max(0, this.cartGoal - (this.cart()?.total ?? 0)));
  goalProgress = computed(() => {
    const total = this.cart()?.total ?? 0;
    return Math.min(100, Math.round((total / this.cartGoal) * 100));
  });
  purchaseStage = computed(() => {
    const items = this.itemCount();
    const total = this.cart()?.total ?? 0;

    if (items === 0) {
      return {
        label: 'Listo para descubrir',
        detail: 'Agrega tus primeras piezas para empezar a armar tu pedido.'
      };
    }

    if (items === 1) {
      return {
        label: 'Look en construccion',
        detail: 'Ya elegiste una pieza. Puedes sumar otra para completar tu seleccion.'
      };
    }

    if (total >= this.cartGoal) {
      return {
        label: 'Pedido fuerte',
        detail: 'Tu carrito ya tiene una seleccion solida y esta listo para pasar a checkout.'
      };
    }

    return {
      label: 'Casi listo para cerrar',
      detail: 'Revisa tallas, stock y detalles finales antes de continuar con tu compra.'
    };
  });

  cartPulseMessage = computed(() => {
    const total = this.cart()?.total ?? 0;
    const lowStock = this.lowStockItems().length;

    if (lowStock > 0) {
      return `Hay ${lowStock} ${lowStock === 1 ? 'pieza con stock limitado' : 'piezas con stock limitado'} en tu carrito.`;
    }

    if (total >= this.cartGoal) {
      return 'Tu seleccion ya supera el ticket recomendado para cerrar una compra completa.';
    }

    return `Te faltan MXN ${this.amountToGoal().toLocaleString('es-MX')} para alcanzar un carrito de MXN ${this.cartGoal.toLocaleString('es-MX')}.`;
  });

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

  getStockMessage(stock: number, quantity: number): string {
    if (stock <= 1) {
      return 'Ultima unidad disponible.';
    }

    if (quantity >= stock) {
      return 'Ya tienes el maximo disponible en tu carrito.';
    }

    if (stock <= 3) {
      return `Quedan solo ${stock} unidades disponibles.`;
    }

    if (stock <= 6) {
      return 'Inventario moderado para esta variante.';
    }

    return 'Disponibilidad estable para esta variante.';
  }

  getStockTone(stock: number): 'success' | 'warn' | 'info' {
    if (stock <= 3) return 'warn';
    if (stock <= 6) return 'info';
    return 'success';
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
