import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ReviewService } from '../../core/services/review.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, Review, ProductVariant } from '../../core/models';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(ProductService);
  private reviewService = inject(ReviewService);
  private cartService = inject(CartService);
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  product = signal<Product | null>(null);
  reviews = signal<Review[]>([]);
  selectedVariant = signal<ProductVariant | null>(null);
  selectedImage = signal<string | null>(null);
  quantity = signal(1);
  isLoading = signal(true);
  isAddingToCart = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  /** Average review rating (0-5) */
  avgRating = computed(() => {
    const list = this.reviews();
    if (!list.length) return 0;
    return list.reduce((sum, r) => sum + r.rating, 0) / list.length;
  });

  /** Discount percentage for the selected variant */
  discountPercent = computed(() => {
    const v = this.selectedVariant();
    if (!v?.discountPrice || v.discountPrice >= v.price) return 0;
    return Math.round((1 - v.discountPrice / v.price) * 100);
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(+id);
      }
    });
  }

  loadProduct(id: number) {
    this.isLoading.set(true);
    this.productService.getById(id).subscribe({
      next: (product: Product) => {
        this.product.set(product);
        this.isLoading.set(false);
        if (product.variants?.length > 0) {
          this.selectedVariant.set(product.variants[0]);
        }
        const primaryImg = product.images?.find((img: any) => img.isPrimary);
        this.selectedImage.set(primaryImg?.imageUrl || product.images?.[0]?.imageUrl || null);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });

    this.reviewService.getProductReviews(id).subscribe({
      next: (page: any) => this.reviews.set(page.content || []),
      error: () => {}
    });
  }

  selectVariant(variant: ProductVariant) {
    this.selectedVariant.set(variant);
    this.quantity.set(1);
  }

  increaseQty() {
    const max = this.selectedVariant()?.stock || 1;
    if (this.quantity() < max) {
      this.quantity.set(this.quantity() + 1);
    }
  }

  decreaseQty() {
    if (this.quantity() > 1) {
      this.quantity.set(this.quantity() - 1);
    }
  }

  addToCart() {
    const variant = this.selectedVariant();
    if (!variant) return;

    this.isAddingToCart.set(true);

    const currentCart = this.cartService.cart();
    const existingItem = currentCart?.items?.find(item => item.variantId === variant.id);
    const cartQty = existingItem ? existingItem.quantity : 0;

    if (this.quantity() + cartQty > variant.stock) {
      this.isAddingToCart.set(false);
      this.showToast(`No puedes añadir ${this.quantity()} más. Tienes ${cartQty} en el carrito y solo hay ${variant.stock} disponibles.`, 'error');
      return;
    }

    this.cartService.addItem(variant.id, this.quantity()).subscribe({
      next: () => {
        this.isAddingToCart.set(false);
        this.showToast('Producto añadido al carrito ✓', 'success');
      },
      error: () => {
        this.isAddingToCart.set(false);
        this.showToast('Error al añadir al carrito', 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 3000);
  }
}
