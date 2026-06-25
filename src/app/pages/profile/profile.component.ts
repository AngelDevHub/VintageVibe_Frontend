import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { WebAuthnService } from '../../core/services/webauthn.service';
import { Order } from '../../core/models';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, ProgressSpinnerModule, TagModule, ToastModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [MessageService]
})
export class ProfileComponent implements OnInit {
  private orderService = inject(OrderService);
  private webAuthnService = inject(WebAuthnService);
  private messageService = inject(MessageService);
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

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const normalized = status.toUpperCase();
    if (normalized === 'PAID' || normalized === 'DELIVERED') return 'success';
    if (normalized === 'PENDING') return 'warn';
    if (normalized === 'SHIPPED') return 'info';
    if (normalized === 'CANCELLED') return 'danger';
    return 'secondary';
  }

  getStatusLabel(status: string): string {
    const normalized = status.toUpperCase();
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      PAID: 'Pagado',
      SHIPPED: 'En camino',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado'
    };

    return labels[normalized] || status;
  }

  registerPasskey() {
    this.webAuthnService.register().subscribe({
      next: () => {
        this.showToast('success', 'Passkey configurada', 'Ya puedes iniciar sesion con huella, rostro o desbloqueo del dispositivo.');
      },
      error: (err) => {
        console.error('Error al registrar passkey', err);
        this.showToast('error', 'No se pudo configurar', 'Verifica que tu navegador soporte WebAuthn y que tengas un metodo de desbloqueo activo.');
      }
    });
  }

  private showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 3500
    });
  }
}
