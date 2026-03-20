import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Category, Brand, ProductCondition } from '../../../core/models';

type DelTarget = { type: 'cat'|'brand'|'cond'; id: number } | null;

@Component({
  selector: 'app-admin-catalog',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-catalog.component.html',
  styleUrls: ['./admin-catalog.component.css']
})
export class AdminCatalogComponent implements OnInit {
  private adminService = inject(AdminService);
  activeTab = signal<'categories'|'brands'|'conditions'>('categories');

  // Categories
  categories = signal<Category[]>([]);
  catForm = signal(false);
  catEditId = signal<number | null>(null);
  catData: Partial<Category> = {};

  // Brands
  brands = signal<Brand[]>([]);
  brandForm = signal(false);
  brandEditId = signal<number | null>(null);
  brandData: Partial<Brand> = {};

  // Conditions
  conditions = signal<ProductCondition[]>([]);
  condForm = signal(false);
  condEditId = signal<number | null>(null);
  condData: Partial<ProductCondition> = {};

  deleteTarget = signal<DelTarget>(null);
  toast = signal(''); toastType = signal<'success'|'error'>('success');

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.adminService.getCategories().subscribe({ next: c => this.categories.set(c) });
    this.adminService.getBrands().subscribe({ next: b => this.brands.set(b) });
    this.adminService.getAllConditions().subscribe({ next: c => this.conditions.set(c) });
  }

  // ── Categories ──
  openCatForm() { this.catData = {}; this.catEditId.set(null); this.catForm.set(true); }
  editCat(c: Category) { this.catData = { ...c }; this.catEditId.set(c.id); this.catForm.set(true); }
  saveCat() {
    const id = this.catEditId();
    const obs = id ? this.adminService.updateCategory(id, this.catData) : this.adminService.createCategory(this.catData);
    obs.subscribe({ next: (s) => { this.loadAll(); this.catForm.set(false); this.showToast(id ? 'Categoría actualizada' : 'Categoría creada'); }, error: () => this.showToast('Error', 'error') });
  }

  // ── Brands ──
  openBrandForm() { this.brandData = {}; this.brandEditId.set(null); this.brandForm.set(true); }
  editBrand(b: Brand) { this.brandData = { ...b }; this.brandEditId.set(b.id); this.brandForm.set(true); }
  saveBrand() {
    const id = this.brandEditId();
    const obs = id ? this.adminService.updateBrand(id, this.brandData) : this.adminService.createBrand(this.brandData);
    obs.subscribe({ next: () => { this.loadAll(); this.brandForm.set(false); this.showToast(id ? 'Marca actualizada' : 'Marca creada'); }, error: () => this.showToast('Error', 'error') });
  }

  // ── Conditions ──
  openCondForm() { this.condData = {}; this.condEditId.set(null); this.condForm.set(true); }
  editCond(c: ProductCondition) { this.condData = { ...c }; this.condEditId.set(c.id); this.condForm.set(true); }
  saveCond() {
    const id = this.condEditId();
    const obs = id ? this.adminService.updateCondition(id, this.condData) : this.adminService.createCondition(this.condData);
    obs.subscribe({ next: () => { this.loadAll(); this.condForm.set(false); this.showToast(id ? 'Condición actualizada' : 'Condición creada'); }, error: () => this.showToast('Error', 'error') });
  }

  // ── Delete ──
  confirmDel(type: 'cat'|'brand'|'cond', id: number) { this.deleteTarget.set({ type, id }); }
  doDelete() {
    const t = this.deleteTarget();
    if (!t) return;
    const obs = t.type === 'cat' ? this.adminService.deleteCategory(t.id) :
                t.type === 'brand' ? this.adminService.deleteBrand(t.id) :
                this.adminService.deleteCondition(t.id);
    obs.subscribe({ next: () => { this.loadAll(); this.deleteTarget.set(null); this.showToast('Eliminado'); }, error: () => this.showToast('Error al eliminar', 'error') });
  }

  showToast(msg: string, type: 'success'|'error' = 'success') {
    this.toast.set(msg); this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
