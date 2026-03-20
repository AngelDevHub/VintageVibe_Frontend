import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { DashboardStats } from '../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.adminService.getStats().subscribe({
      next: (s) => { this.stats.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
