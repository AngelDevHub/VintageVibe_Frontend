import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {
  Coupon, DashboardStats, ProductCondition, Product, PageResponse,
  Order, Payment, PaymentMethod, Review, Brand, Category
} from '../models';

export interface AdminUser {
  id: number; email: string; firstName: string; lastName: string;
  role: { id: number; name: string }; isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;
  private bc = new BroadcastChannel('vintage_vibe_updates');

  /** Emit an update event to all other tabs */
  notifyUpdate() {
    this.bc.postMessage({ type: 'DATA_UPDATED' });
  }

  // ── Dashboard ──────────────────────────────
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.api}/admin/dashboard/stats`);
  }

  // ── Users ──────────────────────────────────
  getUsers(page = 0, size = 10, search = ''): Observable<PageResponse<AdminUser>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    return this.http.get<PageResponse<AdminUser>>(`${this.api}/admin/users`, { params });
  }
  changeUserRole(id: number, roleName: string): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.api}/admin/users/${id}/role?roleName=${roleName}`, {});
  }
  toggleUserActive(id: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.api}/admin/users/${id}/toggle-active`, {});
  }
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/users/${id}`);
  }

  // ── Products ───────────────────────────────
  getProducts(page = 0, size = 10, search = ''): Observable<PageResponse<Product>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('name', search);
    return this.http.get<PageResponse<Product>>(`${this.api}/products`, { params });
  }
  createProduct(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.api}/products`, data).pipe(
      tap(() => this.notifyUpdate())
    );
  }
  updateProduct(id: number, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.api}/products/${id}`, data).pipe(
      tap(() => this.notifyUpdate())
    );
  }
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/products/${id}`).pipe(
      tap(() => this.notifyUpdate())
    );
  }

  getOrders(page = 0, size = 10, status = ''): Observable<PageResponse<Order>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<PageResponse<Order>>(`${this.api}/orders/admin`, { params });
  }
  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.api}/orders/${id}/status?status=${status}`, {});
  }

  // ── Payments ───────────────────────────────
  getPayments(page = 0, size = 10): Observable<PageResponse<Payment>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Payment>>(`${this.api}/payments`, { params });
  }
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.api}/payment-methods`);
  }
  togglePaymentMethod(id: number): Observable<PaymentMethod> {
    return this.http.patch<PaymentMethod>(`${this.api}/payment-methods/${id}/toggle-active`, {});
  }

  // ── Coupons ────────────────────────────────
  getAllCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.api}/admin/coupons`);
  }
  createCoupon(coupon: Partial<Coupon>): Observable<Coupon> {
    return this.http.post<Coupon>(`${this.api}/admin/coupons`, coupon);
  }
  updateCoupon(id: number, coupon: Partial<Coupon>): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.api}/admin/coupons/${id}`, coupon);
  }
  deleteCoupon(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/coupons/${id}`);
  }

  // ── Reviews ────────────────────────────────
  getAllReviews(page = 0, size = 10): Observable<PageResponse<Review>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Review>>(`${this.api}/reviews/admin`, { params });
  }
  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/reviews/${id}`);
  }

  // ── Categories ─────────────────────────────
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.api}/categories`);
  }
  createCategory(data: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.api}/categories`, data).pipe(
      tap(() => this.notifyUpdate())
    );
  }
  updateCategory(id: number, data: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.api}/categories/${id}`, data).pipe(
      tap(() => this.notifyUpdate())
    );
  }
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/categories/${id}`).pipe(
      tap(() => this.notifyUpdate())
    );
  }

  // ── Brands ─────────────────────────────────
  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.api}/brands`);
  }
  createBrand(data: Partial<Brand>): Observable<Brand> {
    return this.http.post<Brand>(`${this.api}/brands`, data).pipe(
      tap(() => this.notifyUpdate())
    );
  }
  updateBrand(id: number, data: Partial<Brand>): Observable<Brand> {
    return this.http.put<Brand>(`${this.api}/brands/${id}`, data).pipe(
      tap(() => this.notifyUpdate())
    );
  }
  deleteBrand(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/brands/${id}`).pipe(
      tap(() => this.notifyUpdate())
    );
  }

  // ── Conditions ─────────────────────────────
  getAllConditions(): Observable<ProductCondition[]> {
    return this.http.get<ProductCondition[]>(`${this.api}/product-conditions`);
  }
  createCondition(data: Partial<ProductCondition>): Observable<ProductCondition> {
    return this.http.post<ProductCondition>(`${this.api}/product-conditions`, data).pipe(
      tap(() => this.notifyUpdate())
    );
  }
  updateCondition(id: number, data: Partial<ProductCondition>): Observable<ProductCondition> {
    return this.http.put<ProductCondition>(`${this.api}/product-conditions/${id}`, data).pipe(
      tap(() => this.notifyUpdate())
    );
  }
  deleteCondition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/product-conditions/${id}`).pipe(
      tap(() => this.notifyUpdate())
    );
  }
}
