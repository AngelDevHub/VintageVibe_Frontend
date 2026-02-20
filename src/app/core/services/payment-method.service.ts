import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentMethod } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/payment-methods';

  getAll(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(this.apiUrl);
  }
}
