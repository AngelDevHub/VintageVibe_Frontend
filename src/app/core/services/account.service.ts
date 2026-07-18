import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { PageResponse } from '../models';
import { AuditLogEntry, AdminUser } from './admin.service';

export interface ProfilePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getMyProfile(): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.api}/account/me`);
  }

  updateProfile(payload: ProfilePayload): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.api}/account/profile`, payload);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.api}/account/change-password`, { currentPassword, newPassword });
  }

  getAccessHistory(page = 0, size = 10): Observable<PageResponse<AuditLogEntry>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<AuditLogEntry>>(`${this.api}/account/access-history`, { params });
  }
}
