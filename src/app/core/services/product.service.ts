import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Product, PageResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/products`;

  getAll(params?: {
    page?: number;
    size?: number;
    name?: string;
    categoryId?: number;
    brandId?: number;
    conditionId?: number;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Observable<PageResponse<Product>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
      if (params.name) httpParams = httpParams.set('name', params.name);
      if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
      if (params.brandId) httpParams = httpParams.set('brandId', params.brandId);
      if (params.conditionId) httpParams = httpParams.set('conditionId', params.conditionId);
      if (params.minPrice !== undefined) httpParams = httpParams.set('minPrice', params.minPrice);
      if (params.maxPrice !== undefined) httpParams = httpParams.set('maxPrice', params.maxPrice);
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
    }
    // Añadimos cache-buster para evitar respuestas obsoletas del navegador
    httpParams = httpParams.set('_t', Date.now().toString());
    
    return this.http.get<PageResponse<Product>>(this.base, { params: httpParams });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  getBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/slug/${slug}`);
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.base, product);
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
