import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AdminRole, AdminService, Permission } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-roles',
  imports: [CommonModule, FormsModule, ButtonModule, ToastModule],
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.css'],
  providers: [MessageService]
})
export class AdminRolesComponent implements OnInit {
  private adminService = inject(AdminService);
  private messageService = inject(MessageService);

  roles = signal<AdminRole[]>([]);
  permissions = signal<Permission[]>([]);
  selectedRoleId = signal<number | null>(null);
  roleName = '';
  selectedPermissionIds: number[] = [];
  loading = signal(true);

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.adminService.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        if (!this.selectedRoleId() && roles.length) {
          this.selectRole(roles[0]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showToast('error', 'No se pudieron cargar los roles');
      }
    });

    this.adminService.getPermissions().subscribe({
      next: (permissions) => this.permissions.set(permissions),
      error: () => this.showToast('error', 'No se pudieron cargar los permisos')
    });
  }

  selectRole(role: AdminRole) {
    this.selectedRoleId.set(role.id);
    this.roleName = role.name;
    this.selectedPermissionIds = role.permissions.map(permission => permission.id);
  }

  saveRoleName() {
    if (!this.roleName.trim()) return;

    if (!this.selectedRoleId()) {
      this.adminService.createRole(this.roleName.trim()).subscribe({
        next: (role) => {
          this.roles.update(list => [...list, role]);
          this.selectRole(role);
          this.showToast('success', 'Rol creado');
        },
        error: () => this.showToast('error', 'No se pudo crear el rol')
      });
      return;
    }

    this.adminService.updateRole(this.selectedRoleId()!, this.roleName.trim()).subscribe({
      next: (role) => {
        this.roles.update(list => list.map(item => item.id === role.id ? role : item));
        this.selectRole(role);
        this.showToast('success', 'Rol actualizado');
      },
      error: () => this.showToast('error', 'No se pudo actualizar el rol')
    });
  }

  savePermissions() {
    const roleId = this.selectedRoleId();
    if (!roleId || !this.selectedPermissionIds.length) return;

    this.adminService.updateRolePermissions(roleId, this.selectedPermissionIds).subscribe({
      next: (role) => {
        this.roles.update(list => list.map(item => item.id === role.id ? role : item));
        this.selectRole(role);
        this.showToast('success', 'Permisos actualizados');
      },
      error: () => this.showToast('error', 'No se pudieron actualizar los permisos')
    });
  }

  startNewRole() {
    this.selectedRoleId.set(null);
    this.roleName = '';
    this.selectedPermissionIds = [];
  }

  isPermissionSelected(permissionId: number): boolean {
    return this.selectedPermissionIds.includes(permissionId);
  }

  togglePermission(permissionId: number, checked: boolean) {
    if (checked && !this.selectedPermissionIds.includes(permissionId)) {
      this.selectedPermissionIds = [...this.selectedPermissionIds, permissionId];
      return;
    }

    if (!checked) {
      this.selectedPermissionIds = this.selectedPermissionIds.filter(id => id !== permissionId);
    }
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
