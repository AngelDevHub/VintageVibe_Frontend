# Manual Técnico

## Objetivo Técnico
Implementar un módulo administrativo de usuarios en arquitectura `Spring Boot + Angular`, aplicando controles de seguridad, gestión de roles y auditoría de eventos críticos.

## Stack
- Backend: `Spring Boot`, `Spring Security`, `JPA`, `JWT`, `BCrypt`
- Frontend: `Angular standalone`, `PrimeNG`, `signals`
- Base de datos: `MySQL`

## Backend Implementado
### Entidades nuevas o ampliadas
- `User`
  - Campos agregados: `failedLoginAttempts`, `lockedUntil`, `lastLoginAt`, `passwordChangedAt`
- `Permission`
- `AuditLog`
- `Role`
  - Relación `many-to-many` con permisos

### Endpoints principales
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/account/me`
- `PUT /api/v1/account/profile`
- `POST /api/v1/account/change-password`
- `GET /api/v1/account/access-history`
- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users`
- `PUT /api/v1/admin/users/{id}`
- `PATCH /api/v1/admin/users/{id}/role`
- `PATCH /api/v1/admin/users/{id}/toggle-active`
- `PATCH /api/v1/admin/users/{id}/password`
- `DELETE /api/v1/admin/users/{id}`
- `GET /api/v1/admin/users/{id}/access-history`
- `GET /api/v1/admin/roles`
- `POST /api/v1/admin/roles`
- `PUT /api/v1/admin/roles/{id}`
- `GET /api/v1/admin/roles/permissions`
- `PUT /api/v1/admin/roles/{id}/permissions`
- `GET /api/v1/admin/audit-logs`

### Servicios agregados
- `AdminUserService`
- `RoleAdminService`
- `AccountService`
- `AuditLogService`
- `PasswordPolicyService`

## Frontend Implementado
### Vistas administrativas
- `/admin/users`
  - Alta
  - Edición
  - Cambio de contraseña
  - Cambio de rol
  - Activación/desactivación
  - Eliminación lógica
  - Consulta de historial de accesos
- `/admin/roles`
  - Alta de rol
  - Edición de rol
  - Asignación y visualización de permisos
- `/admin/audit`
  - Consulta de bitácora general

### Vista de usuario
- `/profile`
  - Edición de perfil
  - Cambio de contraseña
  - Historial de accesos

## Controles De Seguridad Aplicados
1. Contraseñas cifradas con `BCryptPasswordEncoder`
2. Validación de formularios con `jakarta.validation` y validaciones en Angular
3. Expiración de sesión mediante `JWT`
4. Bloqueo temporal de cuenta después de 5 intentos fallidos
5. Política de contraseña segura
6. Restricción por rol para rutas administrativas
7. Bitácora con usuario, fecha, hora, IP y acción

## Auditoría Implementada
### Eventos registrados
- `LOGIN_SUCCESS`
- `LOGIN_FAILURE`
- `LOGOUT`
- `PASSWORD_CHANGED`
- `USER_CREATED`
- `USER_UPDATED`
- `USER_DEACTIVATED`
- `USER_ACTIVATED`
- `USER_DELETED`
- `ROLE_CHANGED`
- `ROLE_CREATED`
- `ROLE_UPDATED`
- `ROLE_PERMISSIONS_UPDATED`
- `PROFILE_UPDATED`

### Datos almacenados por registro
- Usuario
- Correo del usuario
- Fecha y hora
- Dirección IP
- Acción realizada
- Detalle del evento

## Base De Datos
- El esquema base se actualizó en `VintageVibe_Backend/database/schema.sql`
- Se recomienda ejecutar además el script incremental:
  - `VintageVibe_Backend/database/migrations/practicas_11_12_user_admin.sql`

## Pruebas Y Verificación
- Frontend compilado con `pnpm build`
- Diagnósticos revisados en archivos editados
- La compilación completa del backend depende del entorno Java local

## Evidencias Recomendadas
- Captura del panel de usuarios
- Captura del panel de roles y permisos
- Captura de la bitácora
- Captura del perfil con cambio de contraseña
- Video corto mostrando:
  - Alta de usuario
  - Cambio de rol
  - Desactivación
  - Consulta de bitácora
  - Actualización de perfil
