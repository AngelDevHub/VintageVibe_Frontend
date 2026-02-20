import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Cart, AddCartItemRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cart`;

  private _cart = signal<Cart | null>(null);
  readonly cart = this._cart.asReadonly();
  readonly cartCount = computed(() => this._cart()?.items?.length ?? 0);
  readonly cartTotal = computed(() => this._cart()?.total ?? 0);

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.base).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  addItem(variantId: number, quantity: number): Observable<Cart> {
    const body: AddCartItemRequest = { variantId, quantity };
    return this.http.post<Cart>(`${this.base}/items`, body).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  updateItem(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.base}/items/${itemId}`, { quantity }).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.base}/items/${itemId}`).pipe(
      tap(cart => this._cart.set(cart))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.base}`).pipe(
      tap(() => this._cart.set(null))
    );
  }

  clearLocalCart(): void {
    this._cart.set(null);
  }
}
