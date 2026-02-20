import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Payment, PaymentRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/payments`;

  createPayment(request: PaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(this.base, request);
  }

  getPaymentByOrder(orderId: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.base}/order/${orderId}`);
  }

  updateStatus(paymentId: number, status: string): Observable<Payment> {
    return this.http.patch<Payment>(`${this.base}/${paymentId}/status`, null, {
      params: { status }
    });
  }
}
