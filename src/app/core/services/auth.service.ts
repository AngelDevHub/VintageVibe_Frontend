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
  readonly email = computed(() => this._user()?.email || '');
  readonly isAdmin = computed(() => {
    const role = this._user()?.role?.toUpperCase();
    return role === 'ROLE_ADMIN' || role === 'ADMIN';
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedToken = localStorage.getItem('vv_token') || sessionStorage.getItem('vv_token');
      const savedUser = localStorage.getItem('vv_user') || sessionStorage.getItem('vv_user');
      if (savedToken && savedUser) {
        try {
          this._token.set(savedToken);
          this._user.set(JSON.parse(savedUser));
          localStorage.setItem('vv_token', savedToken);
          localStorage.setItem('vv_user', savedUser);
        } catch {
          this.clearSession(false);
        }
      }

      window.addEventListener('storage', (event) => {
        if (event.key === 'vv_token') {
          if (!event.newValue) {
            this._token.set(null);
            this._user.set(null);
            this.router.navigate(['/login']);
          } else {
            this._token.set(event.newValue);
            const userJson = localStorage.getItem('vv_user');
            if (userJson) {
              try {
                this._user.set(JSON.parse(userJson));
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      });
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => this.setSession(response))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(response => this.setSession(response))
    );
  }

  setSession(response: AuthResponse): void {
    this._token.set(response.token);
    this._user.set(response);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('vv_token', response.token);
      localStorage.setItem('vv_user', JSON.stringify(response));
    }
  }

  logout(): void {
    this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  expireSession(): void {
    this.clearSession(true, true);
  }

  getToken(): string | null {
    return this._token();
  }

  private clearSession(redirect = true, isExpired = false): void {
    this._token.set(null);
    this._user.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('vv_token');
      localStorage.removeItem('vv_user');
      sessionStorage.removeItem('vv_token');
      sessionStorage.removeItem('vv_user');
    }
    if (redirect) {
      this.router.navigate(['/login'], {
        queryParams: isExpired ? { sessionExpired: 'true' } : undefined
      });
    }
  }
}
