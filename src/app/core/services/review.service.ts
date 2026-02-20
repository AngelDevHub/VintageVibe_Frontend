import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Review, ReviewRequest, PageResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/reviews`;

  getProductReviews(productId: number, page = 0, size = 10): Observable<PageResponse<Review>> {
    return this.http.get<PageResponse<Review>>(`${this.base}/product/${productId}`, {
      params: { page, size }
    });
  }

  create(request: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.base, request);
  }
}
