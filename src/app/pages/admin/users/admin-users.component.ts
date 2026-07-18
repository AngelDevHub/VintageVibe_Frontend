import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AdminRole, AdminService, AdminUser, AuditLogEntry } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
  providers: [MessageService]
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private messageService = inject(MessageService);
  users = signal<AdminUser[]>([]);
  roles = signal<AdminRole[]>([]);
  loading = signal(true);
  page = signal(0);
  totalPages = signal(0);
  total = signal(0);
  searchTerm = '';
  deleteId = signal<number | null>(null);
  userFormOpen = signal(false);
  editingUserId = signal<number | null>(null);
  passwordUserId = signal<number | null>(null);
  historyUser = signal<AdminUser | null>(null);
  accessHistory = signal<AuditLogEntry[]>([]);
  historyLoading = signal(false);
  historyPage = signal(0);
  historyTotalPages = signal(0);
  userForm = this.createEmptyUserForm();
  passwordForm = { newPassword: '' };

  ngOnInit() {
    this.load();
    this.loadRoles();
  }

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

  loadRoles() {
    this.adminService.getRoles().subscribe({
      next: (roles) => this.roles.set(roles),
      error: () => this.showToast('error', 'No se pudieron cargar los roles.')
    });
  }

  goPage(p: number) { this.page.set(p); this.load(); }

  onRoleChange(id: number, event: Event) {
    const role = (event.target as HTMLSelectElement).value;
    this.adminService.changeUserRole(id, role).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === id ? updated : u));
        this.showToast('success', 'Rol actualizado');
      },
      error: () => this.showToast('error', 'Error al cambiar rol')
    });
  }

  toggleActive(user: AdminUser) {
    this.adminService.toggleUserActive(user.id).subscribe({
      next: (u) => {
        this.users.update(list => list.map(x => x.id === u.id ? u : x));
        this.showToast('success', `Usuario ${u.isActive ? 'activado' : 'desactivado'}`);
      },
      error: () => this.showToast('error', 'No se pudo cambiar el estatus')
    });
  }

  openCreateForm() {
    this.userFormOpen.set(true);
    this.editingUserId.set(null);
    this.userForm = this.createEmptyUserForm();
  }

  openEditForm(user: AdminUser) {
    this.userFormOpen.set(true);
    this.passwordUserId.set(null);
    this.historyUser.set(null);
    this.editingUserId.set(user.id);
    this.userForm = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? '',
      password: '',
      roleName: user.role.name,
      isActive: user.isActive
    };
  }

  saveUser() {
    const payload = {
      firstName: this.userForm.firstName.trim(),
      lastName: this.userForm.lastName.trim(),
      email: this.userForm.email.trim(),
      phone: this.userForm.phone?.trim() || null,
      roleName: this.userForm.roleName,
      isActive: this.userForm.isActive
    };

    if (this.editingUserId()) {
      this.adminService.updateUser(this.editingUserId()!, payload).subscribe({
        next: (updated) => {
          this.users.update(list => list.map(user => user.id === updated.id ? updated : user));
          this.editingUserId.set(null);
          this.userFormOpen.set(false);
          this.userForm = this.createEmptyUserForm();
          this.showToast('success', 'Usuario actualizado');
        },
        error: () => this.showToast('error', 'No se pudo actualizar el usuario')
      });
      return;
    }

    this.adminService.createUser({
      ...payload,
      password: this.userForm.password
    }).subscribe({
      next: (created) => {
        this.users.update(list => [created, ...list]);
        this.total.update(value => value + 1);
        this.userFormOpen.set(false);
        this.userForm = this.createEmptyUserForm();
        this.showToast('success', 'Usuario creado');
      },
      error: () => this.showToast('error', 'No se pudo crear el usuario')
    });
  }

  cancelUserForm() {
    this.userFormOpen.set(false);
    this.editingUserId.set(null);
    this.userForm = this.createEmptyUserForm();
  }

  openPasswordForm(user: AdminUser) {
    this.passwordUserId.set(user.id);
    this.passwordForm = { newPassword: '' };
  }

  savePassword() {
    const userId = this.passwordUserId();
    if (!userId || !this.passwordForm.newPassword.trim()) return;

    this.adminService.changeUserPassword(userId, this.passwordForm.newPassword.trim()).subscribe({
      next: () => {
        this.passwordUserId.set(null);
        this.passwordForm = { newPassword: '' };
        this.showToast('success', 'Contraseña actualizada');
      },
      error: () => this.showToast('error', 'No se pudo actualizar la contraseña')
    });
  }

  openHistory(user: AdminUser) {
    this.historyUser.set(user);
    this.historyPage.set(0);
    this.loadHistory();
  }

  loadHistory(page = this.historyPage()) {
    const user = this.historyUser();
    if (!user) return;

    this.historyLoading.set(true);
    this.historyPage.set(page);
    this.adminService.getUserAccessHistory(user.id, page).subscribe({
      next: (response) => {
        this.accessHistory.set(response.content);
        this.historyTotalPages.set(response.totalPages);
        this.historyLoading.set(false);
      },
      error: () => {
        this.historyLoading.set(false);
        this.showToast('error', 'No se pudo cargar la bitácora del usuario');
      }
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
        this.total.update(value => Math.max(0, value - 1));
        this.showToast('success', 'Usuario eliminado');
      },
      error: () => this.showToast('error', 'Error al eliminar')
    });
  }

  private createEmptyUserForm() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      roleName: 'ROLE_USER',
      isActive: true
    };
  }

  private showToast(severity: 'success' | 'error', detail: string) {
    this.messageService.add({
      severity,
      summary: severity === 'success' ? 'Listo' : 'Atención',
      detail,
      life: 3000
    });
  }
}
