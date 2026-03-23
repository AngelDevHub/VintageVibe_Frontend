import { Component, OnInit, inject, signal, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product, Category, PageResponse } from '../../core/models';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private zone = inject(NgZone);

  featuredProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  newsletterEmail = signal('');
  newsletterStatus = signal<'idle' | 'success' | 'error' | 'loading'>('idle');
  private bc = new BroadcastChannel('vintage_vibe_updates');

  ngOnInit() {
    this.bc.onmessage = (event) => {
      if (event.data?.type === 'DATA_UPDATED') {
        this.zone.run(() => {
          this.loadData();
        });
      }
    };
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    // Load featured products (newest)
    this.productService.getAll({ page: 0, size: 4, sort: 'createdAt,desc' }).subscribe({
      next: (response: PageResponse<Product>) => {
        this.featuredProducts.set(response.content);
      }
    });

    // Load categories
    this.categoryService.getAll().subscribe({
      next: (cats: Category[]) => {
        this.categories.set(cats);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getProductImage(product: Product): string {
    const primary = product.images?.find(img => img.isPrimary);
    return primary?.imageUrl || product.images?.[0]?.imageUrl || 'assets/images/placeholder.png';
  }

  getProductPrice(product: Product): number {
    if (product.variants?.length > 0) {
      return product.variants[0].discountPrice || product.variants[0].price;
    }
    return 0;
  }

  subscribeNewsletter(email: string): void {
    if (!email || !this.isValidEmail(email)) {
      this.newsletterStatus.set('error');
      return;
    }
    this.newsletterStatus.set('loading');
    // Simulated subscription — replace with real API call when newsletter service is available
    setTimeout(() => {
      this.newsletterStatus.set('success');
      this.newsletterEmail.set('');
      setTimeout(() => this.newsletterStatus.set('idle'), 4000);
    }, 800);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
