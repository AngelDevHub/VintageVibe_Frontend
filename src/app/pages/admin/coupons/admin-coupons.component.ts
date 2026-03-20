import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Coupon } from '../../../core/models';

@Component({
  selector: 'app-admin-coupons',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-coupons.component.html',
  styleUrls: ['./admin-coupons.component.css']
})
export class AdminCouponsComponent implements OnInit {
  private adminService = inject(AdminService);
  coupons = signal<Coupon[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editId = signal<number | null>(null);
  deleteId = signal<number | null>(null);
  toast = signal(''); toastType = signal<'success'|'error'>('success');

  form: Partial<Coupon> = { code: '', discount: 0, percentage: true, active: true, minPurchaseAmount: 0, expirationDate: '' };

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminService.getAllCoupons().subscribe({ next: (c) => { this.coupons.set(c); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  openForm() { this.form = { code: '', discount: 0, percentage: true, active: true, minPurchaseAmount: 0, expirationDate: '' }; this.editId.set(null); this.showForm.set(true); }
  cancelForm() { this.showForm.set(false); this.editId.set(null); }

  editCoupon(c: Coupon) {
    this.form = { ...c };
    this.editId.set(c.id);
    this.showForm.set(true);
  }

  save() {
    if (!this.form.code) { this.showToast('El código es requerido', 'error'); return; }
    const id = this.editId();
    const obs = id ? this.adminService.updateCoupon(id, this.form) : this.adminService.createCoupon(this.form);
    obs.subscribe({
      next: (saved) => {
        if (id) this.coupons.update(list => list.map(c => c.id === id ? saved : c));
        else this.coupons.update(list => [...list, saved]);
        this.cancelForm();
        this.showToast(id ? 'Cupón actualizado' : 'Cupón creado');
      },
      error: () => this.showToast('Error al guardar cupón', 'error')
    });
  }

  confirmDelete(id: number) { this.deleteId.set(id); }

  deleteCoupon() {
    const id = this.deleteId();
    if (!id) return;
    this.adminService.deleteCoupon(id).subscribe({
      next: () => { this.coupons.update(list => list.filter(c => c.id !== id)); this.deleteId.set(null); this.showToast('Cupón eliminado'); },
      error: () => this.showToast('Error al eliminar', 'error')
    });
  }

  showToast(msg: string, type: 'success'|'error' = 'success') {
    this.toast.set(msg); this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
