import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { Product, Category, PageResponse } from '../../core/models';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  featuredProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);

  ngOnInit() {
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

  getCategoryImage(categoryName: string): string {
    // Return an emoji or icon based on category name for visual appeal
    const lower = categoryName.toLowerCase();
    if (lower.includes('vestido')) return '👗';
    if (lower.includes('chaqueta') || lower.includes('abrigo')) return '🧥';
    if (lower.includes('pantalón') || lower.includes('jeans')) return '👖';
    if (lower.includes('accesorio') || lower.includes('joya')) return '💍';
    if (lower.includes('bolso')) return '👜';
    if (lower.includes('zapato')) return '👠';
    return '✨';
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
}
