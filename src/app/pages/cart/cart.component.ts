import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);
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
    if (item && qty > item.stock) return; // Prevent exceeding stock

    this.cartService.updateItem(itemId, qty).subscribe({
      error: () => {
        // Revert or show error if needed
      }
    });
  }

  removeItem(itemId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto del carrito?')) {
      this.cartService.removeItem(itemId).subscribe();
    }
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
