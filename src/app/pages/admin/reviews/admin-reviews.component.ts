import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { Review } from '../../../core/models';

@Component({
  selector: 'app-admin-reviews',
  imports: [CommonModule],
  templateUrl: './admin-reviews.component.html',
  styleUrls: ['./admin-reviews.component.css']
})
export class AdminReviewsComponent implements OnInit {
  private adminService = inject(AdminService);
  reviews = signal<Review[]>([]);
  loading = signal(true);
  page = signal(0); totalPages = signal(0); total = signal(0);
  deleteId = signal<number | null>(null);
  toast = signal(''); toastType = signal<'success'|'error'>('success');

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminService.getAllReviews(this.page(), 10).subscribe({
      next: (p) => { this.reviews.set(p.content); this.totalPages.set(p.totalPages); this.total.set(p.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  goPage(p: number) { this.page.set(p); this.load(); }
  confirmDelete(id: number) { this.deleteId.set(id); }

  deleteReview() {
    const id = this.deleteId();
    if (!id) return;
    this.adminService.deleteReview(id).subscribe({
      next: () => { this.reviews.update(l => l.filter(r => r.id !== id)); this.deleteId.set(null); this.showToast('Review eliminada'); },
      error: () => this.showToast('Error al eliminar', 'error')
    });
  }

  showToast(msg: string, type: 'success'|'error' = 'success') {
    this.toast.set(msg); this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
