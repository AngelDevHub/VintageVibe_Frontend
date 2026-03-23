import { Component, OnInit, inject, signal, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, Category, PageResponse } from '../../core/models';

@Component({
  selector: 'app-shop',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private zone = inject(NgZone);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  selectedCategory = signal('');
  sortBy = signal('');
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  private searchTimeout: any;
  private bc = new BroadcastChannel('vintage_vibe_updates');

  ngOnInit() {
    // Escuchar actualizaciones inter-pestañas
    this.bc.onmessage = (event) => {
      if (event.data?.type === 'DATA_UPDATED') {
        this.zone.run(() => {
          this.loadProducts();
        });
      }
    };

    this.categoryService.getAll().subscribe((cats: Category[]) => this.categories.set(cats));

    this.route.queryParams.subscribe((params: any) => {
      if (params['search']) {
        this.searchTerm.set(params['search']);
      }
      if (params['categoryId']) {
        this.selectedCategory.set(params['categoryId']);
      }
      this.loadProducts();
    });
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getAll({
      page: this.currentPage(),
      size: 12,
      name: this.searchTerm() || undefined,
      categoryId: this.selectedCategory() ? +this.selectedCategory() : undefined,
      brandId: undefined, // Add brand filter support if needed in UI
      conditionId: undefined, // Add condition filter support if needed in UI
      sort: this.sortBy() || undefined
    }).subscribe({
      next: (response: PageResponse<Product>) => {
        this.products.set(response.content);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showToast('Error al cargar productos', 'error');
      }
    });
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(0);
      this.loadProducts();
    }, 400);
  }

  onCategoryChange(categoryId: string) {
    this.selectedCategory.set(categoryId);
    this.currentPage.set(0);
    this.loadProducts();
  }

  onSortChange(sort: string) {
    this.sortBy.set(sort);
    this.currentPage.set(0);
    this.loadProducts();
  }

  changePage(page: number) {
    this.currentPage.set(page);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedCategory.set('');
    this.sortBy.set('');
    this.currentPage.set(0);
    this.router.navigate(['/shop']);
    this.loadProducts();
  }

  getPrimaryImage(product: Product): string | null {
    const primary = product.images?.find((img: any) => img.isPrimary);
    return primary?.imageUrl || product.images?.[0]?.imageUrl || null;
  }

  getMinPrice(product: Product): number | null {
    if (!product.variants?.length) return null;
    return Math.min(...product.variants.map((v: any) => v.discountPrice || v.price));
  }

  addToCart(product: Product) {
    const firstVariant = product.variants?.[0];
    if (!firstVariant) {
      this.showToast('Este producto no tiene variantes disponibles', 'error');
      return;
    }

    // Check local stock first
    if (firstVariant.stock <= 0) {
      this.showToast('Este producto está agotado', 'error');
      return;
    }

    // Check if adding this item exceeds stock based on current cart
    const currentCart = this.cartService.cart();
    const existingItem = currentCart?.items?.find(item => item.variantId === firstVariant.id);
    const boxQty = existingItem ? existingItem.quantity : 0;

    if (boxQty + 1 > firstVariant.stock) {
      this.showToast(`No puedes añadir más. Solo hay ${firstVariant.stock} disponibles.`, 'error');
      return;
    }

    this.cartService.addItem(firstVariant.id, 1).subscribe({
      next: () => this.showToast(`"${product.name}" añadido al carrito ✓`, 'success'),
      error: () => this.showToast('Error al añadir al carrito', 'error')
    });
  }

  /** Returns an array of page indices for the paginator (max 7 shown) */
  pageArray(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 7;
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i);
    }
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(0, current - half);
    const end = Math.min(total - 1, start + maxVisible - 1);
    start = Math.max(0, end - maxVisible + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }
}
