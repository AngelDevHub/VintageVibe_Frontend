import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AuditLogEntry } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-audit',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-audit.component.html',
  styleUrls: ['./admin-audit.component.css']
})
export class AdminAuditComponent implements OnInit {
  private adminService = inject(AdminService);

  logs = signal<AuditLogEntry[]>([]);
  loading = signal(true);
  page = signal(0);
  totalPages = signal(0);
  total = signal(0);
  searchTerm = '';

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.adminService.getAuditLogs(this.page(), 15, this.searchTerm).subscribe({
      next: (response) => {
        this.logs.set(response.content);
        this.totalPages.set(response.totalPages);
        this.total.set(response.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goPage(page: number) {
    this.page.set(page);
    this.load();
  }
}
