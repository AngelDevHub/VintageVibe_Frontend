import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private _token = signal<string | null>(null);
  private _user = signal<AuthResponse | null>(null);

  readonly token = this._token.asReadonly();
  readonly currentUser = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly isAdmin = computed(() => {
    const role = this._user()?.role?.toUpperCase();
    return role === 'ROLE_ADMIN' || role === 'ADMIN';
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedToken = localStorage.getItem('vv_token');
      const savedUser = localStorage.getItem('vv_user');
      if (savedToken && savedUser) {
        this._token.set(savedToken);
        this._user.set(JSON.parse(savedUser));
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this._token.set(response.token);
        this._user.set(response);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('vv_token', response.token);
          localStorage.setItem('vv_user', JSON.stringify(response));
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(response => {
        this._token.set(response.token);
        this._user.set(response);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('vv_token', response.token);
          localStorage.setItem('vv_user', JSON.stringify(response));
        }
      })
    );
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('vv_token');
      localStorage.removeItem('vv_user');
    }
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }
}
