import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebAuthnService {
  private apiUrl = `${environment.apiUrl}/v1/webauthn`;

  constructor(private http: HttpClient) {}

  /**
   * Registra un nuevo dispositivo biometríco (Passkey)
   */
  register(): Observable<void> {
    return this.http.post<any>(`${this.apiUrl}/register/start`, {}).pipe(
      switchMap(options => {
        // Convert options for navigator.credentials.create
        const credentialCreationOptions: any = this.decodeOptions(options);
        
        return from(navigator.credentials.create({
          publicKey: credentialCreationOptions
        }) as Promise<PublicKeyCredential>);
      }),
      switchMap(credential => {
        if (!credential) {
          return throwError(() => new Error('No se pudo crear la credencial'));
        }

        // Prepare response to send back to server
        const response = {
          id: credential.id,
          rawId: this.bufferToBase64(credential.rawId),
          type: credential.type,
          response: {
            attestationObject: this.bufferToBase64((credential.response as AuthenticatorAttestationResponse).attestationObject),
            clientDataJSON: this.bufferToBase64(credential.response.clientDataJSON),
          }
        };

        return this.http.post<void>(`${this.apiUrl}/register/finish`, JSON.stringify(response));
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
        const credentialRequestOptions: any = this.decodeOptions(options);
        
        return from(navigator.credentials.get({
          publicKey: credentialRequestOptions
        }) as Promise<PublicKeyCredential>);
      }),
      switchMap(credential => {
        if (!credential) {
          return throwError(() => new Error('No se pudo obtener la credencial'));
        }

        const response = {
          email: email,
          response: JSON.stringify({
            id: credential.id,
            rawId: this.bufferToBase64(credential.rawId),
            type: credential.type,
            response: {
              authenticatorData: this.bufferToBase64((credential.response as AuthenticatorAssertionResponse).authenticatorData),
              clientDataJSON: this.bufferToBase64(credential.response.clientDataJSON),
              signature: this.bufferToBase64((credential.response as AuthenticatorAssertionResponse).signature),
              userHandle: (credential.response as AuthenticatorAssertionResponse).userHandle ? 
                this.bufferToBase64((credential.response as AuthenticatorAssertionResponse).userHandle!) : null
            }
          })
        };

        return this.http.post<any>(`${this.apiUrl}/login/finish`, response);
      }),
      catchError(err => {
        console.error('Error en el login WebAuthn:', err);
        return throwError(() => err);
      })
    );
  }

  // Helpers para manejar buffers y base64
  private decodeOptions(options: any): any {
    // WebAuthn requiere que ciertos campos sean ArrayBuffer
    if (options.challenge) {
      options.challenge = this.base64ToBuffer(options.challenge);
    }
    if (options.user && options.user.id) {
      options.user.id = this.base64ToBuffer(options.user.id);
    }
    if (options.allowCredentials) {
      options.allowCredentials = options.allowCredentials.map((c: any) => ({
        ...c,
        id: this.base64ToBuffer(c.id)
      }));
    }
    return options;
  }

  private base64ToBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
}
