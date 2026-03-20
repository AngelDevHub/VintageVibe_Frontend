import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-shell',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.css']
})
export class AdminShellComponent {
  private authService = inject(AuthService);

  sidebarCollapsed = signal(false);

  userName = () => {
    const u = this.authService.currentUser();
    return u ? `${u.firstName} ${u.lastName}` : 'Admin';
  };
}
