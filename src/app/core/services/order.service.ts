import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Order, CheckoutRequest, PageResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/orders`;

  checkout(request: CheckoutRequest): Observable<Order> {
    return this.http.post<Order>(`${this.base}/checkout`, request);
  }

  getMyOrders(page = 0, size = 10): Observable<PageResponse<Order>> {
    return this.http.get<PageResponse<Order>>(this.base, {
      params: { page, size }
    });
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  // Admin
  getAllOrders(page = 0, size = 10): Observable<PageResponse<Order>> {
    return this.http.get<PageResponse<Order>>(`${this.base}/all`, {
      params: { page, size }
    });
  }

  updateStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/${id}/status`, null, {
      params: { status }
    });
  }
}
