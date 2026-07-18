# Manual De Usuario

## Objetivo
Este manual describe el uso del módulo administrativo de usuarios y las funciones de autoservicio de cuenta implementadas para las prácticas 11 y 12.

## Perfiles
- `Administrador`: crea usuarios, edita usuarios, cambia contraseñas, asigna roles, activa o desactiva cuentas, elimina lógicamente cuentas y consulta la bitácora.
- `Usuario normal`: inicia sesión, edita su perfil, cambia su contraseña y consulta su historial de accesos.

## Acceso Como Administrador
1. Inicia sesión con una cuenta que tenga el rol `ROLE_ADMIN`.
2. En la barra de navegación entra al panel `/admin`.
3. Usa el menú lateral para acceder a:
   - `Usuarios`
   - `Roles`
   - `Bitácora`

## Gestión De Usuarios
### Alta de usuarios
1. Entra a `/admin/users`.
2. Haz clic en `Nuevo usuario`.
3. Captura nombre, apellido, correo, teléfono, contraseña inicial, rol y estado.
4. Presiona `Crear usuario`.

### Edición de usuarios
1. En la tabla de usuarios haz clic en el icono de edición.
2. Modifica los datos requeridos.
3. Presiona `Guardar cambios`.

### Cambio de contraseña por administrador
1. En la tabla de usuarios haz clic en el icono de candado.
2. Captura la nueva contraseña.
3. Presiona `Actualizar contraseña`.

### Asignación de roles
1. En la columna `Rol` selecciona el nuevo rol.
2. El sistema guarda el cambio y lo registra en bitácora.

### Activación o desactivación
1. En la columna de acciones haz clic en el botón de encendido.
2. El estado cambia entre `Activo` e `Inactivo`.

### Eliminación lógica
1. Haz clic en el botón de eliminar.
2. Confirma la acción.
3. El usuario queda eliminado lógicamente y se registra en bitácora.

### Consulta de historial de accesos
1. Haz clic en el icono de reloj en la tabla de usuarios.
2. El sistema muestra los eventos del usuario seleccionado.

## Gestión De Roles Y Permisos
### Crear un rol
1. Entra a `/admin/roles`.
2. Haz clic en `Nuevo rol`.
3. Escribe el nombre del rol.
4. Presiona `Crear rol`.

### Modificar permisos
1. Selecciona un rol existente.
2. Marca o desmarca los permisos deseados.
3. Presiona `Guardar permisos`.

### Visualizar permisos asociados
1. En la tabla izquierda selecciona un rol.
2. En el panel derecho aparecerán sus permisos actuales.

## Bitácora
### Consultar registros
1. Entra a `/admin/audit`.
2. Usa el campo de búsqueda para filtrar por usuario o acción.
3. Revisa fecha, hora, dirección IP y detalle.

## Autoservicio Del Usuario
### Editar perfil
1. Inicia sesión.
2. Entra a `/profile`.
3. En la sección `Editar datos personales`, modifica la información.
4. Presiona `Guardar perfil`.

### Cambiar contraseña
1. En `/profile`, ubica la sección `Cambiar contraseña`.
2. Captura tu contraseña actual y la nueva.
3. Presiona `Actualizar contraseña`.

### Consultar historial de accesos
1. En la misma vista de perfil, revisa la sección `Historial de accesos`.
2. Ahí aparecerán inicios de sesión, cierres de sesión y cambios de contraseña.

## Reglas De Seguridad Visibles Para El Usuario
- La contraseña debe tener al menos 8 caracteres.
- La contraseña debe incluir mayúsculas, minúsculas, números y un carácter especial.
- Después de varios intentos fallidos, la cuenta se bloquea temporalmente.
- Las sesiones se controlan mediante JWT con expiración.
- Las acciones administrativas quedan registradas en la bitácora.
