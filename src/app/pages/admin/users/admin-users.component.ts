import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  users = signal<AdminUser[]>([]);
  loading = signal(true);
  page = signal(0);
  totalPages = signal(0);
  total = signal(0);
  searchTerm = '';
  deleteId = signal<number | null>(null);
  toast = signal('');
  toastType = signal<'success' | 'error'>('success');

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.adminService.getUsers(this.page(), 10, this.searchTerm).subscribe({
      next: (p) => {
        this.users.set(p.content);
        this.totalPages.set(p.totalPages);
        this.total.set(p.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  goPage(p: number) { this.page.set(p); this.load(); }

  onRoleChange(id: number, event: Event) {
    const role = (event.target as HTMLSelectElement).value;
    this.adminService.changeUserRole(id, role).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === id ? { ...u, role: updated.role } : u));
        this.showToast('Rol actualizado');
      },
      error: () => this.showToast('Error al cambiar rol', 'error')
    });
  }

  toggleActive(user: AdminUser) {
    this.adminService.toggleUserActive(user.id).subscribe({
      next: (u) => {
        this.users.update(list => list.map(x => x.id === u.id ? u : x));
        this.showToast(`Usuario ${u.isActive ? 'activado' : 'desactivado'}`);
      },
      error: () => this.showToast('Error', 'error')
    });
  }

  confirmDelete(id: number) { this.deleteId.set(id); }

  deleteUser() {
    const id = this.deleteId();
    if (!id) return;
    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.users.update(list => list.filter(u => u.id !== id));
        this.deleteId.set(null);
        this.showToast('Usuario eliminado');
      },
      error: () => this.showToast('Error al eliminar', 'error')
    });
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toast.set(msg); this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
