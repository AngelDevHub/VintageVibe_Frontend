import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { Payment, PaymentMethod } from '../../../core/models';

@Component({
  selector: 'app-admin-payments',
  imports: [CommonModule],
  templateUrl: './admin-payments.component.html',
  styleUrls: ['./admin-payments.component.css']
})
export class AdminPaymentsComponent implements OnInit {
  private adminService = inject(AdminService);
  payments = signal<Payment[]>([]);
  methods = signal<(PaymentMethod & { isActive?: boolean })[]>([]);
  loading = signal(true);
  page = signal(0); totalPages = signal(0);
  toast = signal(''); toastType = signal<'success'|'error'>('success');

  ngOnInit() { this.load(); this.loadMethods(); }

  load() {
    this.loading.set(true);
    this.adminService.getPayments(this.page(), 10).subscribe({
      next: (p) => { this.payments.set(p.content); this.totalPages.set(p.totalPages); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadMethods() {
    this.adminService.getPaymentMethods().subscribe({ next: (m) => this.methods.set(m) });
  }

  goPage(p: number) { this.page.set(p); this.load(); }

  toggleMethod(pm: PaymentMethod & { isActive?: boolean }) {
    this.adminService.togglePaymentMethod(pm.id).subscribe({
      next: (updated) => {
        this.methods.update(list => list.map(m => m.id === updated.id ? updated as any : m));
        this.showToast(`Método ${updated.name} ${(updated as any).isActive ? 'activado' : 'desactivado'}`);
      },
      error: () => this.showToast('Error al actualizar', 'error')
    });
  }

  showToast(msg: string, type: 'success'|'error' = 'success') {
    this.toast.set(msg); this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
