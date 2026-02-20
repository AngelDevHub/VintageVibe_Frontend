import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Order } from '../../core/models';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private orderService = inject(OrderService);
  authService = inject(AuthService);

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  currentPage = signal(0);
  totalPages = signal(0);

  ngOnInit() {
    this.loadOrders(0);
  }

  loadOrders(page: number) {
    this.currentPage.set(page);
    this.isLoading.set(true);
    this.orderService.getMyOrders(page).subscribe({
      next: (response: any) => {
        this.orders.set(response.content || []);
        this.totalPages.set(response.totalPages || 0);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  }
}
