import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Coupon } from '../models';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/coupons`;

  validate(code: string): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.base}/validate/${code}`);
  }
}
