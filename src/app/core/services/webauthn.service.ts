import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { create, get } from '@github/webauthn-json';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebAuthnService {
  private apiUrl = `${environment.apiUrl}/webauthn`;

  constructor(private http: HttpClient) {}

  /**
   * Registra un nuevo dispositivo biometríco (Passkey)
   */
  register(): Observable<void> {
    return this.http.post<any>(`${this.apiUrl}/register/start`, {}).pipe(
      switchMap(options => {
        // La librería @github/webauthn-json procesará automáticamente el JSON de opciones devuelto
        // por Yubico y efectuará las conversiones inversas de Base64URLEncoded
        return from(create(options));
      }),
      switchMap(credential => {
        if (!credential) {
          return throwError(() => new Error('No se pudo crear la credencial'));
        }
        
        // Yubico espera un String JSON en la estructura oficial de WebAuthn
        return this.http.post<void>(`${this.apiUrl}/register/finish`, JSON.stringify(credential), {
          headers: { 'Content-Type': 'application/json' }
        });
      }),
      catchError(err => {
        console.error('Error en el registro WebAuthn:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Autentica al usuario usando biometría
   */
  login(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login/start`, { email }).pipe(
      switchMap(options => {
        return from(get(options));
      }),
      switchMap(credential => {
        if (!credential) {
          return throwError(() => new Error('No se pudo obtener la credencial'));
        }

        const requestBody = {
          email: email,
          // credential ya es el JSON serializable FIDO2 que Yubico puede leer directamente
          response: JSON.stringify(credential)
        };

        return this.http.post<any>(`${this.apiUrl}/login/finish`, requestBody);
      }),
      catchError(err => {
        console.error('Error en el login WebAuthn:', err);
        return throwError(() => err);
      })
    );
  }
}
