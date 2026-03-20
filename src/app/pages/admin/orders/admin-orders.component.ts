import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  private adminService = inject(AdminService);
  orders = signal<Order[]>([]);
  loading = signal(true);
  page = signal(0); totalPages = signal(0); total = signal(0);
  statusFilter = '';
  toast = signal(''); toastType = signal<'success'|'error'>('success');

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminService.getOrders(this.page(), 10, this.statusFilter).subscribe({
      next: (p) => { this.orders.set(p.content); this.totalPages.set(p.totalPages); this.total.set(p.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  goPage(p: number) { this.page.set(p); this.load(); }

  changeStatus(id: number, event: Event) {
    const status = (event.target as HTMLSelectElement).value;
    this.adminService.updateOrderStatus(id, status).subscribe({
      next: (updated) => {
        this.orders.update(list => list.map(o => o.id === id ? updated : o));
        this.showToast('Estado actualizado');
      },
      error: () => this.showToast('Error al actualizar estado', 'error')
    });
  }

  showToast(msg: string, type: 'success'|'error' = 'success') {
    this.toast.set(msg); this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
