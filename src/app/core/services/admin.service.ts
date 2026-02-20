import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Coupon, DashboardStats, ProductCondition } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  // Dashboard
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/admin/dashboard/stats`);
  }

  // Coupons
  getAllCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${environment.apiUrl}/admin/coupons`);
  }

  createCoupon(coupon: Partial<Coupon>): Observable<Coupon> {
    return this.http.post<Coupon>(`${environment.apiUrl}/admin/coupons`, coupon);
  }

  updateCoupon(id: number, coupon: Partial<Coupon>): Observable<Coupon> {
    return this.http.put<Coupon>(`${environment.apiUrl}/admin/coupons/${id}`, coupon);
  }

  deleteCoupon(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/coupons/${id}`);
  }

  // Product Conditions
  getAllConditions(): Observable<ProductCondition[]> {
    return this.http.get<ProductCondition[]>(`${environment.apiUrl}/conditions`);
  }

  createCondition(condition: Partial<ProductCondition>): Observable<ProductCondition> {
    return this.http.post<ProductCondition>(`${environment.apiUrl}/conditions`, condition);
  }

  updateCondition(id: number, condition: Partial<ProductCondition>): Observable<ProductCondition> {
    return this.http.put<ProductCondition>(`${environment.apiUrl}/conditions/${id}`, condition);
  }

  deleteCondition(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/conditions/${id}`);
  }
}
