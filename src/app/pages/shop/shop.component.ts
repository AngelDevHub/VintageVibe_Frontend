import { Component, OnInit, OnDestroy, inject, signal, computed, NgZone, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import Fuse from 'fuse.js';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, Category, PageResponse } from '../../core/models';
import { forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-shop',
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule, TagModule, ToastModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css'],
  providers: [MessageService]
})
export class ShopComponent implements OnInit {
  private readonly pageSize = 12;
  private readonly catalogBatchSize = 100;
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private zone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  private messageService = inject(MessageService);

  products = signal<Product[]>([]);
  allProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  selectedCategory = signal('');
  sortBy = signal('');
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  categoryOptions = computed(() => this.categories().map((cat) => ({ label: cat.name, value: String(cat.id) })));
  searchExperienceText = computed(() => this.searchTerm().trim()
    ? `Buscando "${this.searchTerm().trim()}" con coincidencia flexible en nombre, descripcion, categoria y marca.`
    : 'Busca con coincidencia flexible por nombre, descripcion, categoria o marca desde un solo campo.');
  sortOptions = [
    { label: 'Nombre A-Z', value: 'name,asc' },
    { label: 'Nombre Z-A', value: 'name,desc' },
    { label: 'Mas recientes', value: 'createdAt,desc' }
  ];

  private searchTimeout: any;
  private bc: BroadcastChannel | null = null;

  ngOnInit() {
    // Escuchar actualizaciones inter-pestañas
    if (isPlatformBrowser(this.platformId)) {
      this.bc = new BroadcastChannel('vintage_vibe_updates');
      this.bc.onmessage = (event) => {
        if (event.data?.type === 'DATA_UPDATED') {
          this.zone.run(() => {
            this.loadCatalog();
          });
        }
      };
    }

    this.categoryService.getAll().subscribe((cats: Category[]) => this.categories.set(cats));

    this.route.queryParams.subscribe((params: any) => {
      this.searchTerm.set(params['search'] || '');
      this.selectedCategory.set(params['categoryId'] || '');
      this.currentPage.set(0);

      if (this.allProducts().length > 0) {
        this.applyFilters();
      }
    });

    this.loadCatalog();
  }

  loadCatalog() {
    this.isLoading.set(true);
    this.fetchAllProducts().subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.currentPage.set(0);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showToast('Error al cargar productos', 'error');
      }
    });
  }

  private fetchAllProducts() {
    return this.productService.getAll({
      page: 0,
      size: this.catalogBatchSize,
      sort: 'createdAt,desc'
    }).pipe(
      switchMap((firstPage: PageResponse<Product>) => {
        if (firstPage.totalPages <= 1) {
          return of(firstPage.content);
        }

        const remainingRequests = Array.from(
          { length: firstPage.totalPages - 1 },
          (_, index) => this.productService.getAll({
            page: index + 1,
            size: this.catalogBatchSize,
            sort: 'createdAt,desc'
          })
        );

        return forkJoin(remainingRequests).pipe(
          map((pages: PageResponse<Product>[]) => [
            ...firstPage.content,
            ...pages.flatMap(page => page.content)
          ])
        );
      })
    );
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(0);
      this.applyFilters();
    }, 400);
  }

  onCategoryChange(categoryId: string) {
    this.selectedCategory.set(categoryId);
    this.currentPage.set(0);
    this.applyFilters();
  }

  onSortChange(sort: string) {
    this.sortBy.set(sort);
    this.currentPage.set(0);
    this.applyFilters();
  }

  changePage(page: number) {
    this.currentPage.set(page);
    this.applyFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedCategory.set('');
    this.sortBy.set('');
    this.currentPage.set(0);
    this.router.navigate(['/shop']);
    this.applyFilters();
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

  private applyFilters() {
    let filtered = [...this.allProducts()];

    if (this.selectedCategory()) {
      filtered = filtered.filter(product => String(product.categoryId) === this.selectedCategory());
    }

    const term = this.searchTerm().trim();
    if (term) {
      const fuse = new Fuse(filtered, {
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
        keys: [
          { name: 'name', weight: 0.42 },
          { name: 'description', weight: 0.26 },
          { name: 'brandName', weight: 0.14 },
          { name: 'categoryName', weight: 0.1 },
          { name: 'conditionName', weight: 0.04 },
          { name: 'variants.size', weight: 0.02 },
          { name: 'variants.color', weight: 0.02 }
        ]
      });

      filtered = fuse.search(term).map(result => result.item);
    }

    filtered = this.sortProducts(filtered, this.sortBy());

    const total = filtered.length;
    const maxPage = total > 0 ? Math.ceil(total / this.pageSize) - 1 : 0;
    if (this.currentPage() > maxPage) {
      this.currentPage.set(maxPage);
    }

    const start = this.currentPage() * this.pageSize;
    const end = start + this.pageSize;

    this.totalElements.set(total);
    this.totalPages.set(total > 0 ? Math.ceil(total / this.pageSize) : 0);
    this.products.set(filtered.slice(start, end));
  }

  private sortProducts(products: Product[], sort: string): Product[] {
    const sorted = [...products];

    switch (sort) {
      case 'name,asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name,desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'createdAt,desc':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default:
        return sorted;
    }
  }

  showToast(message: string, type: 'success' | 'error') {
    this.messageService.add({
      severity: type,
      summary: type === 'success' ? 'Listo' : 'Atencion',
      detail: message,
      life: 3200
    });
  }

  ngOnDestroy() {
    if (this.bc) {
      this.bc.close();
    }
  }
}
