import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Address } from '../models';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/addresses`;

  getMyAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(this.base);
  }

  getById(id: number): Observable<Address> {
    return this.http.get<Address>(`${this.base}/${id}`);
  }

  create(address: Partial<Address>): Observable<Address> {
    return this.http.post<Address>(this.base, address);
  }

  update(id: number, address: Partial<Address>): Observable<Address> {
    return this.http.put<Address>(`${this.base}/${id}`, address);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
