import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Product, Category, Brand, ProductCondition } from '../../../core/models';

@Component({
  selector: 'app-admin-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  private adminService = inject(AdminService);
  products = signal<Product[]>([]);
  loading = signal(true);
  page = signal(0); totalPages = signal(0); total = signal(0);
  search = '';
  showForm = signal(false);
  editId = signal<number | null>(null);
  deleteId = signal<number | null>(null);
  toast = signal(''); toastType = signal<'success'|'error'>('success');

  categories: Category[] = [];
  brands: Brand[] = [];
  conditions: ProductCondition[] = [];

  form: Partial<Product & { categoryId: number; brandId: number; conditionId: number; price: number; stock: number }> = {};

  ngOnInit() {
    this.load();
    this.adminService.getCategories().subscribe({ next: c => this.categories = c });
    this.adminService.getBrands().subscribe({ next: b => this.brands = b });
    this.adminService.getAllConditions().subscribe({ next: c => this.conditions = c });
  }

  load() {
    this.loading.set(true);
    this.adminService.getProducts(this.page(), 10, this.search).subscribe({
      next: (p) => { this.products.set(p.content); this.totalPages.set(p.totalPages); this.total.set(p.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  goPage(p: number) { this.page.set(p); this.load(); }
  openForm() { this.form = {}; this.editId.set(null); this.showForm.set(true); }
  cancelForm() { this.showForm.set(false); this.editId.set(null); }

  editProduct(p: Product) {
    const stock = p.variants?.length ? p.variants.reduce((acc, v) => acc + (v.stock || 0), 0) : 0;
    const price = p.variants?.length ? p.variants[0].price : 0;
    this.form = { ...p, categoryId: p.categoryId, brandId: p.brandId, conditionId: p.conditionId, stock, price };
    this.editId.set(p.id);
    this.showForm.set(true);
  }

  save() {
    if (!this.form.name) { this.showToast('El nombre es requerido', 'error'); return; }
    
    // Inject stock into a default variant if none exist, or update the main one
    if (!this.form.variants || this.form.variants.length === 0) {
      this.form.variants = [{
        id: 0,
        sku: 'VINTAGE-' + Math.floor(Math.random() * 10000),
        size: 'U', color: 'N/A', material: 'N/A',
        price: this.form.price || 0,
        discountPrice: 0,
        stock: this.form.stock || 0
      }];
    } else if (this.form.variants.length > 0) {
      this.form.variants[0].stock = this.form.stock || 0;
      this.form.variants[0].price = this.form.price || 0;
    }

    const id = this.editId();
    const obs = id ? this.adminService.updateProduct(id, this.form) : this.adminService.createProduct(this.form);
    obs.subscribe({
      next: (saved) => {
        if (id) this.products.update(l => l.map(p => p.id === id ? saved : p));
        else this.load();
        this.cancelForm();
        this.showToast(id ? 'Producto actualizado' : 'Producto creado');
      },
      error: (err: any) => {
        if (err.status === 400 && err.error && typeof err.error === 'object') {
          // Display the first validation error field message
          const firstError = Object.values(err.error)[0] as string;
          this.showToast(firstError, 'error');
        } else {
          this.showToast(err.error?.message || 'Error interno al guardar', 'error');
        }
      }
    });
  }

  confirmDelete(id: number) { this.deleteId.set(id); }

  deleteProduct() {
    const id = this.deleteId();
    if (!id) return;
    this.adminService.deleteProduct(id).subscribe({
      next: () => { this.products.update(l => l.filter(p => p.id !== id)); this.deleteId.set(null); this.showToast('Producto eliminado'); },
      error: () => this.showToast('Error al eliminar', 'error')
    });
  }

  showToast(msg: string, type: 'success'|'error' = 'success') {
    this.toast.set(msg); this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
