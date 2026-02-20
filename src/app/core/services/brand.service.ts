import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Brand } from '../models';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/brands`;

  getAll(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.base);
  }

  getById(id: number): Observable<Brand> {
    return this.http.get<Brand>(`${this.base}/${id}`);
  }

  create(brand: Partial<Brand>): Observable<Brand> {
    return this.http.post<Brand>(this.base, brand);
  }

  update(id: number, brand: Partial<Brand>): Observable<Brand> {
    return this.http.put<Brand>(`${this.base}/${id}`, brand);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
