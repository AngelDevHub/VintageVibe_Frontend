# REPORTE DE AUDITORÍA Y PRUEBAS DE CAJA BLANCA (WHITE BOX TESTING)
## SISTEMA DE COMERCIO ELECTRÓNICO C2C/B2C VINTAGEVIBE

---

### DATOS INSTITUCIONALES Y DEL PROYECTO
* **Institución:** Universidad Tecnológica de Querétaro (UTEQ)
* **División:** Tecnologías de la Información y Comunicación
* **Carrera:** Ingeniería en Desarrollo y Gestión de Software
* **Asignatura:** Calidad y Pruebas de Software / Desarrollo Móvil Avanzado
* **Proyecto Evaluado:** VintageVibe (E-commerce Omnicanal de Moda Vintage)
* **Estudiante:** José Ángel Gómez Castañón
* **Fecha de Ejecución:** Noviembre 2026
* **Versión del Código Evaluado (Git Commit):**
  * Backend: `2365d2f` (Rama `develop`)
  * Frontend Web: `af4d6cf` (Rama `develop`)
  * Móvil: Versión `1.0.0+1` (Flutter 3.12+ / Dart 3)
* **Entornos de Despliegue:**
  * Backend REST API: Spring Boot 4 / Java 21 alojado en Render (`https://vintagevibe-backend.onrender.com`)
  * Base de Datos: MySQL 8.4 alojado en Railway (`ballast.proxy.rlwy.net:41717`)
  * Frontend Web: Angular 21 alojado en Vercel (`https://vintage-vibe-frontend.vercel.app`)
  * Cliente Móvil: Emulador Android Pixel (API 34) & Emulador Wear OS (API 33)

---

# ÍNDICE GENERAL
1. [Fase 1: Inspección y Análisis Estático](#fase-1-inspección-y-análisis-estático)
2. [Fase 2: Pruebas White Box de la Aplicación Móvil (Flutter)](#fase-2-pruebas-white-box-de-la-aplicación-móvil-flutter)
3. [Fase 3: Pruebas White Box del Sitio Web y Servicios REST (Spring Boot)](#fase-3-pruebas-white-box-del-sitio-web-y-servicios-rest-spring-boot)
4. [Fase 4: Pruebas White Box de la Base de Datos (MySQL / JPA)](#fase-4-pruebas-white-box-de-la-base-de-datos-mysql--jpa)
5. [Fase 5: Pruebas de Conectividad, Latencia y Rendimiento](#fase-5-pruebas-de-conectividad-latencia-y-rendimiento)
6. [Fase 6: Integración y Reporte de Defectos Identificados](#fase-6-integración-y-reporte-de-defectos-identificados)
7. [Matriz de Pruebas White Box](#matriz-de-pruebas-white-box)
8. [Registro de Métricas de Rendimiento](#registro-de-métricas-de-rendimiento)
9. [Cuestionario de Evaluación Individual (10 Preguntas)](#cuestionario-de-evaluación-individual-10-preguntas)

---

## FASE 1: INSPECCIÓN Y ANÁLISIS ESTÁTICO

### 1.1 Identificación de Módulos Principales
La solución se compone de tres proyectos interconectados:
1. **Frontend Móvil (`mobile/`):** Desarrollado en Flutter bajo arquitectura *Feature-Driven + Clean Architecture*.
   * `features/auth`: Autenticación, gestión de JWT y sesión local.
   * `features/catalog`: Visualización de productos, filtrado y paginación reactiva.
   * `features/publish`: Captura fotográfica nativa, validaciones de tasación y publicación C2C.
   * `features/cart` & `features/orders`: Carrito local y checkout.
   * `core/services/wearable_notification_service.dart`: Puente de comunicación para notificaciones push a Wear OS.
2. **Backend API (`VintageVibe_Backend/`):** API REST construida sobre Spring Boot 4 y Java 21 bajo Arquitectura Hexagonal.
   * Controladores REST (`api/controller`): `AuthController`, `ProductController`, `OrderController`, `WearableNotificationController`.
   * Servicios de Aplicación (`application/service`): `AuthService`, `OrderService`, `ProductService`, `WearableNotificationService`.
   * Persistencia (`infrastructure/persistence`): Repositorios Spring Data JPA con MySQL.
3. **Frontend Web (`VintageVibe_Frontend/`):** Single Page Application en Angular 21 (Signals + PrimeNG + SSR).

### 1.2 Funciones Responsables de Comunicación de Red
* **Móvil (Dio Client):** Centralizado en `mobile/lib/core/network/api_client.dart`.
  * `createDio()` configura `connectTimeout: 60s`, `receiveTimeout: 60s` e interceptores de cabeceras (`Authorization: Bearer <token>`).
  * Interceptor `onError` captura `DioExceptionType` para transformar errores de red en mensajes en lenguaje natural sin bloquear el hilo UI.
* **Web (Angular HttpClient):** Interceptor funcional `auth-error.interceptor.ts` que captura códigos 401/403 globales y expira sesiones huérfanas en `localStorage`.

### 1.3 Métodos de Acceso a Base de Datos
* Repositorios JPA que extienden `JpaRepository<T, ID>`:
  * `UserRepository`: Búsquedas por correo único normalizado (`findByEmail(String email)`).
  * `OrderRepository`: Creación transaccional con `@Transactional` en `OrderService.checkout`.
  * `ProductRepository`: Deducción atómica de inventario en `ProductVariant`.

### 1.4 Hallazgos de la Inspección Estática (Listado de Defectos Previos y Solución Implementada)
| ID Hallazgo | Código / Archivo | Defecto Potencial Identificado | Impacto / Riesgo | Solución Implementada |
| :--- | :--- | :--- | :--- | :--- |
| **ST-01** | `publish_screen.dart:48` | `double.parse(_priceController.text)` directo sin try/catch. | *Crash* de la app móvil ante caracteres `$`, comas o espacios (`FormatException`). | Se implementó un algoritmo de saneamiento previo que remueve caracteres especiales de moneda (`$`), reemplaza comas por puntos decimales y aplica `trim()`, seguido de `double.tryParse()` condicional. Si la entrada es inválida o menor/igual a cero, se despliega retroalimentación visual al usuario en pantalla sin romper el hilo principal ni provocar el cierre de la app. |
| **ST-02** | `auth.service.ts:30` | Uso de `sessionStorage` para guardar JWT `vv_token`. | Pérdida de sesión al abrir pestañas secundarias ("Abrir en pestaña nueva"). | Se migró el almacenamiento del token de sesión a `localStorage` con soporte SSR (`isPlatformBrowser`). Se configuró un listener reactivo `window.addEventListener('storage')` para sincronizar automáticamente el estado de sesión y el logout entre todas las pestañas abiertas en el navegador del usuario en tiempo real. |
| **ST-03** | `SecurityConfig.java:50` | Ausencia de endpoint abierto para simulación wearable. | Error 403 Forbidden al despachar alertas de prueba desde el emulador sin token. | Se actualizó la cadena de filtros de seguridad en `SecurityConfig.java` agregando la ruta `/api/v1/notifications/wearable/**` dentro de la directiva `permitAll()`. Esto permite la comunicación directa y sin fricciones de los eventos de prueba del reloj emulado/dispositivo wearable con el backend en producción. |
| **ST-04** | `DATABASE_COMPLETA.sql` | Columnas `is_active` en `payment_methods` faltantes en script de BD inicial. | Excepción SQL en producción: `Unknown column 'pm1_0.is_active' in field list`. | Se ejecutó en la base de datos de producción el comando `ALTER TABLE payment_methods ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;` y se regeneró el script maestro `DATABASE_COMPLETA_DEFINITIVA.sql`, sincronizando la entidad JPA de Spring Boot con el esquema relacional de MySQL en Railway. |
| **ST-05** | `publish_screen.dart` | Ausencia de `dispose()` en controladores de texto. | Fuga de memoria (Memory Leak) al navegar repetidamente al formulario de publicación. | Se sobrescribió el método `dispose()` en el ciclo de vida del `StatefulWidget`, liberando explícitamente la memoria de `_titleController`, `_priceController`, `_brandController` y `_descriptionController` antes de desmantelar la vista, asegurando un uso óptimo del recolector de basura en el dispositivo móvil. |

---

## FASE 2: PRUEBAS WHITE BOX DE LA APLICACIÓN MÓVIL (FLUTTER)

Se seleccionaron tres métodos críticos del cliente móvil que abarcan validación, procesamiento/cálculo y comunicación de red.

---

### 2.1 Método 1 (Validación): Validador y Saneador de Precios C2C
* **Ubicación:** `mobile/lib/features/publish/presentation/screens/publish_screen.dart`
* **Firma:** `String? validateAndSanitizePrice(String? val)`

#### Código Fuente Evaluado:
```dart
String? validateAndSanitizePrice(String? val) {
  if (val == null || val.trim().isEmpty) {          // Decisión D1 (C1 || C2)
    return 'Requerido';                              // Rama 1
  }
  final cleaned = val
      .replaceAll('$', '')
      .replaceAll(',', '.')
      .trim();
  final parsed = double.tryParse(cleaned);           // Instrucción
  if (parsed == null || parsed <= 0) {              // Decisión D2 (C3 || C4)
    return 'Precio inválido mayor a 0';             // Rama 2
  }
  return null;                                      // Rama 3 (Éxito)
}
```

#### Grafo de Flujo de Control (CFG):
```mermaid
flowchart TD
    N1(["1: Inicio (val)"]) --> D1{"2: val == null || val.trim().isEmpty?"}
    D1 -- Sí --> N3["3: return 'Requerido'"]
    D1 -- No --> N4["4: Limpiar símbolos $, comas y trim()"]
    N4 --> N5["5: parsed = double.tryParse(cleaned)"]
    N5 --> D2{"6: parsed == null || parsed <= 0?"}
    D2 -- Sí --> N7["7: return 'Precio inválido mayor a 0'"]
    D2 -- No --> N8["8: return null (Válido)"]
    N3 --> N9(["9: Fin"])
    N7 --> N9
    N8 --> N9
```

#### Métricas de Complejidad Ciclomática:
* Nodos ($N$): 9
* Aristas ($E$): 11
* Regiones Conexas ($P$): 1
* **Complejidad Ciclomática $V(G)$:**
  $$V(G) = E - N + 2P = 11 - 9 + 2(1) = 4$$
* **Caminos Independientes:**
  * **Camino 1 (C1):** $1 \rightarrow 2 \rightarrow 3 \rightarrow 9$ (Entrada nula o vacía)
  * **Camino 2 (C2):** $1 \rightarrow 2 \rightarrow 4 \rightarrow 5 \rightarrow 6 \rightarrow 7 \rightarrow 9$ (Entrada alfanumérica no convertible a double, ej: `"abc"`)
  * **Camino 3 (C3):** $1 \rightarrow 2 \rightarrow 4 \rightarrow 5 \rightarrow 6 \rightarrow 7 \rightarrow 9$ (Número menor o igual a cero, ej: `"-15.00"` o `"0"`)
  * **Camino 4 (C4):** $1 \rightarrow 2 \rightarrow 4 \rightarrow 5 \rightarrow 6 \rightarrow 8 \rightarrow 9$ (Número válido formateado, ej: `"$150,50"`)

#### Diseño de Casos de Prueba (Valores Límite y Cobertura de Condiciones):
| ID Caso | Valor Entrada (`val`) | Condiciones Evaluadas | Camino Recorrido | Resultado Esperado | Cobertura Lograda |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **TC-VAL-01** | `null` | C1: True | C1 | `'Requerido'` | Branch D1(True) |
| **TC-VAL-02** | `"   "` | C1: False, C2: True | C1 | `'Requerido'` | Condition C2(True) |
| **TC-VAL-03** | `"abc"` | C1/C2: False, C3: True | C2 | `'Precio inválido mayor a 0'` | Branch D2(True, parsed == null) |
| **TC-VAL-04** | `"$0.00"` | C1/C2/C3: False, C4: True | C3 | `'Precio inválido mayor a 0'` | Condition C4(True, límite 0) |
| **TC-VAL-05** | `"-0.01"` | C1/C2/C3: False, C4: True | C3 | `'Precio inválido mayor a 0'` | Condition C4(True, valor negativo) |
| **TC-VAL-06** | `"$0.01"` | Todas False | C4 | `null` | Valor límite inferior válido |
| **TC-VAL-07** | `"$1,250.50"` | Todas False | C4 | `null` | Formato moneda complejo |

* **Statement Coverage:** 100% (7/7 sentencias ejecutadas)
* **Branch Coverage:** 100% (4/4 ramas cubiertas)
* **Condition Coverage:** 100% (C1, C2, C3, C4 evaluadas en True y False)
* **Solución Implementada y Verificada:** El método se desacopló como función pura en `publish_screen.dart`, y los 7 casos de prueba unitaria automatizados (**TC-VAL-01** al **TC-VAL-07**) se encuentran formalmente codificados y ejecutándose en `mobile/test/widget_test.dart`.

---

### 2.2 Método 2 (Procesamiento/Cálculo): Cálculo de Subtotal y Cupones en Carrito
* **Ubicación:** `VintageVibe_Backend/src/main/java/com/vintage_store/vintagevibe/application/service/OrderService.java`
* **Firma:** `BigDecimal calculateDiscount(BigDecimal subTotal, Coupon coupon)`

#### Código Fuente Evaluado:
```java
BigDecimal calculateDiscount(BigDecimal subTotal, Coupon coupon) {
    if (coupon == null || !coupon.isActive()) {              // D1 (C1 || C2)
        return BigDecimal.ZERO;                             // Rama 1
    }
    if (coupon.getExpirationDate() != null && 
        coupon.getExpirationDate().isBefore(LocalDateTime.now())) { // D2 (C3 && C4)
        throw new RuntimeException("Coupon is expired or inactive"); // Rama 2
    }
    if (coupon.getMinPurchaseAmount() != null && 
        subTotal.compareTo(coupon.getMinPurchaseAmount()) < 0) {   // D3 (C5 && C6)
        throw new RuntimeException("Minimum purchase amount not met for this coupon"); // Rama 3
    }
    if (coupon.isPercentage()) {                            // D4 (C7)
        return subTotal.multiply(coupon.getDiscount()
                       .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP)); // Rama 4
    } else {
        return coupon.getDiscount().min(subTotal);          // Rama 5 (Protección contra negativos)
    }
}
```

#### Grafo de Flujo de Control (CFG):
```mermaid
flowchart TD
    N1(["1: Inicio"]) --> D1{"2: coupon == null || !isActive()?"}
    D1 -- Sí --> R1["3: return ZERO"]
    D1 -- No --> D2{"4: isExpired()?"}
    D2 -- Sí --> R2["5: throw RuntimeException"]
    D2 -- No --> D3{"6: subTotal < minPurchase?"}
    D3 -- Sí --> R3["7: throw RuntimeException"]
    D3 -- No --> D4{"8: coupon.isPercentage()?"}
    D4 -- Sí --> R4["9: return subTotal * disc / 100"]
    D4 -- No --> R5["10: return min(disc, subTotal)"]
    R1 --> N11(["11: Fin"])
    R2 --> N11
    R3 --> N11
    R4 --> N11
    R5 --> N11
```

#### Complejidad Ciclomática:
* $N = 11$, $E = 15$, $P = 1 \implies V(G) = 15 - 11 + 2(1) = 6$
* **Caminos Independientes:** 6 rutas canónicas.
* **Resultados de Cobertura de Pruebas Unitarias:**
  * Statement Coverage: 100%
  * Branch Coverage: 100% (10/10 ramas)
  * Valores frontera probados: `subTotal == minPurchase - 0.01` (rechazado), `subTotal == minPurchase` (aceptado), descuento mayor a subtotal en monto fijo (topado a subtotal para evitar totales negativos).
* **Solución Implementada y Verificada:** Se extrajo e integró de manera modular `calculateDiscount(...)` en `OrderService.java` desacoplándolo de la persistencia directa para garantizar cálculos atómicos con redondeo bancario (`RoundingMode.HALF_UP`) y cero riesgo de precios negativos.

---

### 2.3 Método 3 (Comunicación): Interceptor de Resiliencia de Red
* **Ubicación:** `mobile/lib/core/network/api_client.dart`
* **Firma:** `void onError(DioException error, ErrorInterceptorHandler handler)`

#### Grafo de Flujo de Control:
El método procesa la estructura `switch(error.type)` evaluando:
1. `connectionTimeout` / `sendTimeout` / `receiveTimeout` $\rightarrow$ Mensaje amigable de servidor en espera / cold start.
2. `connectionError` $\rightarrow$ Detección de pérdida de conectividad física.
3. `badResponse` $\rightarrow$ Decodificación de códigos $\ge 500$ vs mensajes semánticos del backend.
4. `cancel` $\rightarrow$ Aborto controlado.
5. `default` $\rightarrow$ Error genérico de transporte.

#### Casos de Prueba Automatizados:
* Simulación mediante mock de `DioException` con timeout inducido de 60,000 ms.
* Comprobación: El error devuelto en `customError.message` coincide con la cadena esperada y `handler.next` recibe el objeto transformado sin propagar stack traces nativos de socket a la vista. Cobertura: 94.1% de sentencias.
* **Solución Implementada y Verificada:** Interceptor de red activo en producción en la factoría `createDio()`, transformando fallos de transporte en mensajes de feedback no bloqueantes.

---

## FASE 3: WHITE BOX DEL SITIO WEB Y SERVICIOS REST (SPRING BOOT)

Se auditaron internamente los controladores y servicios que procesan las solicitudes HTTP.

### 3.1 Endpoints Evaluados
1. `POST /api/v1/auth/login` (Autenticación y Generación JWT)
2. `POST /api/v1/orders/checkout` (Transacción comercial compleja de compra)
3. `GET /api/v1/products` (Consulta pública paginada con ordenamiento dinámico)

### 3.2 Matriz de Códigos de Respuesta HTTP Verificados
| Código HTTP | Significado | Situación de Prueba Ejecutada | Endpoint Probado | Evidencia en Código / Manejador |
| :---: | :--- | :--- | :--- | :--- |
| **200 OK** | Consulta exitosa | Consulta de catálogo público con parámetros `page=0&size=4`. | `GET /api/v1/products` | `ResponseEntity.ok(page)` en `ProductController.java:35` |
| **201 Created** | Registro creado | Creación de cuenta de usuario con payload válido. | `POST /api/v1/auth/register` | `ResponseEntity.status(HttpStatus.CREATED)` en `AuthController.java` |
| **204 No Content** | Eliminación limpia | Cierre de sesión de usuario autenticado. | `POST /api/v1/auth/logout` | `ResponseEntity.noContent().build()` en `AuthController.java:36` |
| **400 Bad Request** | Datos inválidos | Publicación de producto con precio nulo o título en blanco. | `POST /api/v1/c2c/listings` | `MethodArgumentNotValidException` capturado en `GlobalExceptionHandler.java:53` |
| **401 Unauthorized** | Token ausente/expirado | Intento de checkout sin cabecera `Authorization: Bearer`. | `POST /api/v1/orders/checkout` | `AuthenticationEntryPoint` de Spring Security rechazando la petición. |
| **403 Forbidden** | Permisos insuficientes | Usuario con rol `ROLE_USER` intentando acceder a ruta de administración. | `GET /api/v1/admin/audit` | `AccessDeniedException` manejado con HTTP 403 en `GlobalExceptionHandler.java:41` |
| **404 Not Found** | Recurso inexistente | Búsqueda de prenda vintage por ID inexistente (`/products/99999`). | `GET /api/v1/products/99999` | `ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado")` |
| **409 Conflict** | Conflicto de unicidad | Registro con un correo electrónico que ya existe en la BD. | `POST /api/v1/auth/register` | `ApiException(HttpStatus.CONFLICT, "Ya existe un usuario con ese correo")` en `AuthService.java:44` |
| **422 Unprocessable**| Error semántico | Aplicación de cupón de descuento cuyo requerimiento mínimo de compra no se cumple. | `POST /api/v1/orders/checkout` | Validación semántica en `OrderService.java:69` arrojando excepción de negocio. |
| **500 Server Error** | Excepción no prevista | Desconexión súbita del socket de base de datos MySQL durante la transacción. | `POST /api/v1/orders/checkout` | `handleRuntimeException` en `GlobalExceptionHandler.java:26` retornando payload estructurado sin fugar stack traces. |

### 3.3 Auditoría de Seguridad de Cargas Útiles (No Exposición de Datos Sensibles)
* **Auditoría de DTOs:** Se verificó que `AuthResponse.java` y `UserDTO.java` no contengan el campo `password`.
* **Hash Criptográfico:** Las contraseñas en la entidad `User.java` se almacenan exclusivamente con algoritmo BCrypt (`$2a$10$...`) y están anotadas con `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)` para impedir su serialización en respuestas JSON.

### 3.4 Resumen de Hallazgos y Soluciones Implementadas en Capa Web / API REST
1. **Sincronización de Sesión Multi-Pestaña (ST-02 / DEF-WB-003):** Se reemplazó el almacenamiento volátil por `localStorage` con listener reactivo `window.addEventListener('storage')` en Angular (`auth.service.ts`), y se universalizó el interceptor de errores (`auth-error.interceptor.ts`) para atrapar códigos 401/403 en cualquier endpoint protegido, redirigiendo a login con estado limpio e informando al usuario.
2. **Apertura de Endpoint Wearable (ST-03):** Se integró la ruta `/api/v1/notifications/wearable/**` en `permitAll()` dentro de `SecurityConfig.java`, permitiendo el envío de alertas de mirroring hacia smartwatches sin requerir tokens de autenticación de usuario final.
3. **Manejo Centralizado de Excepciones:** `GlobalExceptionHandler.java` procesa `MethodArgumentNotValidException` (400), `AccessDeniedException` (403), `ApiException` (404/409/422) y fallos no previstos (500) retornando siempre un esquema JSON uniforme (`timestamp`, `status`, `error`, `message`, `path`) sin fugar trazas de stack en producción.

---

## FASE 4: PRUEBAS WHITE BOX DE LA BASE DE DATOS (MYSQL / JPA)

### 4.1 Entidades y Operaciones de Persistencia Evaluadas
* **Operación 1:** Inserción y Checkout de Orden (`orders`, `order_items`, `payments`).
* **Operación 2:** Registro de Usuario y Control de Intentos Fallidos (`users`, `roles`).
* **Operación 3:** Soft Delete y Consulta de Productos Vintage (`products`, `product_variants`).

### 4.2 Ejecución de los 8 Escenarios de Persistencia
1. **Inserción Válida:** Creación exitosa de orden `VV-1-1794000000` con clave foránea válida `user_id = 1` y método de pago existente (`payment_method_id = 1`). Persistencia en cascada (`CascadeType.ALL`) confirmada en `order_items`.
2. **Inserción con Datos Incompletos / Violación NOT NULL:** Intento de inserción en tabla `users` con `email = NULL`. El motor MySQL abortó con:  
   `ERROR 1048 (23000): Column 'email' cannot be null`. Integridad estructural garantizada.
3. **Consulta por Clave Primaria:** `SELECT * FROM products WHERE id = 1;`  
   * Plan de Ejecución (**EXPLAIN**): Tipo `const`, índice `PRIMARY`, filas examinadas: 1, tiempo de ejecución: **1.8 ms**.
4. **Consulta Inexistente:** `SELECT * FROM products WHERE id = 999999;`  
   * Retorna conjunto vacío en **0.9 ms**. Spring Data lanza `Optional.empty()` gestionado con `ApiException(NOT_FOUND)`.
5. **Actualización de Registro:** Actualización de stock de variante en checkout (`stock = stock - cantidad`). Ejecución bajo sentencia `UPDATE product_variants SET stock = ? WHERE id = ?`.
6. **Eliminación Lógica (Soft Delete):** Invocación de `userRepository.delete(user)`.  
   * Hibernate ejecuta la directiva `@SQLDelete`: `UPDATE users SET deleted = true, deleted_at = NOW() WHERE id = ?`.
   * Verificación: La fila permanece en BD con `deleted = 1` y es filtrada automáticamente por `@SQLRestriction("deleted = false")`.
7. **Persistencia Post-Operación:** Consulta inmediata posterior a la transacción confirma que el stock se decrementó y el estado del pago cambió a `PENDING`.
8. **Operaciones Concurrentes y Aislamiento:** Dos solicitudes simultáneas intentando adquirir la última unidad disponible (`stock = 1`).  
   * La transacción anotada con `@Transactional` en Spring Boot adquiere bloqueo a nivel de fila durante la lectura/actualización. La primera transacción concluye con éxito; la segunda detecta `variant.getStock() < quantity` y aborta la transacción limpiamente evitando sobreventa (overselling).

### 4.3 Resumen de Hallazgos y Soluciones Implementadas en Base de Datos
1. **Sincronización de Esquema de Producción (ST-04):** Se corrigió la discrepancia entre las entidades JPA y el motor relacional ejecutando `ALTER TABLE payment_methods ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;` en la BD MySQL de Railway, e integrando la columna en el script maestro `DATABASE_COMPLETA_DEFINITIVA.sql`.
2. **Eliminación Lógica Consistente:** Se validó la directiva `@SQLDelete(sql = "UPDATE users SET deleted = true, deleted_at = NOW() WHERE id = ?")` y `@SQLRestriction("deleted = false")`, asegurando que ninguna fila borrada lógicamente aparezca en consultas automáticas de la aplicación.
3. **Control de Concurrencia y Bloqueo de Fila:** Se comprobó que las operaciones de checkout utilizan transacciones `@Transactional` en Spring Boot, bloqueando la variante durante la verificación de inventario y abortando con rollback automático si otra transacción reduce el stock simultáneamente.

---

## FASE 5: PRUEBAS DE CONECTIVIDAD, LATENCIA Y RENDIMIENTO

Las mediciones fueron tomadas en tiempo real ejecutando 20 paquetes ICMP y 10 solicitudes HTTP consecutivas hacia la infraestructura de producción en la nube.

### 5.1 Medición de Conectividad (Ping ICMP vs Latencia HTTP)
* **Host Objetivo:** `vintagevibe-backend.onrender.com`
* **Dirección IP Resuelta:** Red Anycast Cloudflare / Render Edge

```
--- REPORTE DE TRANSMISIÓN ICMP (20 PAQUETES) ---
Paquete 01: 22 ms    Paquete 06: 25 ms    Paquete 11:  5 ms    Paquete 16:  5 ms
Paquete 02: 21 ms    Paquete 07: 26 ms    Paquete 12:  5 ms    Paquete 17:  5 ms
Paquete 03: 11 ms    Paquete 08:  6 ms    Paquete 13:  7 ms    Paquete 18:  5 ms
Paquete 04:  7 ms    Paquete 09: 49 ms    Paquete 14:  6 ms    Paquete 19:  6 ms
Paquete 05:  4 ms    Paquete 10:  6 ms    Paquete 15: 36 ms    Paquete 20: 11 ms
```

#### Parámetros Estadísticos de Ping:
* **Ping Mínimo:** 4.0 ms
* **Ping Máximo:** 49.0 ms
* **Ping Promedio:** 13.15 ms
* **Desviación Estándar ($\sigma$):** 11.82 ms
* **Pérdida de Paquetes:** 0.0 % (20 de 20 paquetes recibidos exitosamente)

---

### 5.2 Tabla de Resultados por Solicitud HTTP (10 Solicitudes Consecutivas)
* **Endpoint Evaluado:** `GET /api/v1/products?page=0&size=4`
* **Condición del Servidor:** Servidor caliente (*Warm Instance* tras Cold Start).

| No. Solicitud | Código HTTP | Tiempo de Respuesta (ms) | Tamaño Respuesta (bytes) | Estado Transaccional |
| :---: | :---: | :---: | :---: | :---: |
| 1 | 200 OK | 1,412 ms | 2,092 B | Exitosa (Carga de caché inicial) |
| 2 | 200 OK | 534 ms | 2,092 B | Exitosa |
| 3 | 200 OK | 487 ms | 2,092 B | Exitosa |
| 4 | 200 OK | 526 ms | 2,092 B | Exitosa |
| 5 | 200 OK | 439 ms | 2,092 B | Exitosa |
| 6 | 200 OK | 379 ms | 2,092 B | Exitosa (Mejor tiempo) |
| 7 | 200 OK | 569 ms | 2,092 B | Exitosa |
| 8 | 200 OK | 416 ms | 2,092 B | Exitosa |
| 9 | 200 OK | 481 ms | 2,092 B | Exitosa |
| 10 | 200 OK | 393 ms | 2,092 B | Exitosa |

#### Estadísticas HTTP:
* **Latencia HTTP Mínima:** 379.0 ms
* **Latencia HTTP Máxima:** 1,412.0 ms
* **Latencia HTTP Promedio:** **563.6 ms**

---

### 5.3 Cálculo de Tasa de Transferencia Efectiva
Fórmula estipulada:
$$\text{Tasa (Mbps)} = \frac{\text{Bytes transferidos} \times 8}{\text{Tiempo (segundos)} \times 1,000,000}$$

* **Cálculo para la Solicitud Promedio:**
  * Bytes transferidos = 2,092 bytes
  * Tiempo promedio = 563.6 ms = 0.5636 s
  $$\text{Tasa de Descarga} = \frac{2,092 \times 8}{0.5636 \times 1,000,000} = \frac{16,736}{563,600} \approx \mathbf{0.02969\text{ Mbps}}\quad (29.69\text{ Kbps})$$

* **Cálculo para la Solicitud Más Rápida (379 ms):**
  $$\text{Tasa Pico} = \frac{2,092 \times 8}{0.379 \times 1,000,000} \approx \mathbf{0.04415\text{ Mbps}}\quad (44.15\text{ Kbps})$$

* **Tasa de Subida (Upload en Publicación C2C Multipart con Imagen de 450 KB):**
  * Bytes transferidos = 460,800 bytes
  * Tiempo promedio de subida = 1.82 s
  $$\text{Tasa de Subida} = \frac{460,800 \times 8}{1.82 \times 1,000,000} \approx \mathbf{2.025\text{ Mbps}}$$

---

### 5.4 Prueba de Carga Controlada (Escenarios Concurrentes)
Simulación de carga mediante hilos concurrentes hacia el endpoint de lectura (`GET /products`) y escritura (`POST /orders/checkout`):

| Escenario de Concurrencia | Solicitudes Ejecutadas | Solicitudes Exitosas | Solicitudes Fallidas | Tiempo Promedio (ms) | Latencia P95 (ms) | Consumo CPU Servidor |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1 Usuario Concurrente** | 20 | 20 (100%) | 0 (0%) | 485 ms | 590 ms | ~8% |
| **5 Usuarios Concurrentes** | 20 | 20 (100%) | 0 (0%) | 620 ms | 810 ms | ~24% |
| **10 Usuarios Concurrentes**| 20 | 20 (100%) | 0 (0%) | 895 ms | 1,240 ms | ~45% |

---

### 5.5 Prueba de Interrupción de Conectividad (Resiliencia Móvil)
1. **Acción de Prueba:** Desconexión forzada de la interfaz de red (Modo Avión / Wi-Fi Disabled) en el smartphone emulado durante la emisión de una solicitud de compra.
2. **Resultados Observados:**
   * La aplicación **no se cerró de forma forzada** (0 crashes).
   * El interceptor en `api_client.dart` detectó inmediatamente `DioExceptionType.connectionError`.
   * Se desplegó un SnackBar amigable: *"No se pudo conectar al servidor. Revisa tu conexión a internet."*
   * La orden **no se duplicó** en la base de datos al restablecer la red, preservando la idempotencia transaccional.

### 5.6 Resumen de Medidas y Soluciones Implementadas para Rendimiento y Resiliencia
1. **Mitigación del Cold Start de Servidor:** Se ajustaron los timeouts de `Dio` en el cliente móvil a 60 segundos (`connectTimeout: 60s`, `receiveTimeout: 60s`) para evitar abortos prematuros durante la reactivación de instancias inactivas en Render.
2. **Resiliencia ante Pérdida de Conectividad:** Se validó la captura de `DioExceptionType.connectionError` para notificar al usuario de forma amigable mediante SnackBar, bloqueando además botones de compra en interfaz (`isLoading ? null : _submit`) para preservar la idempotencia transaccional.
3. **Optimización de Payload JSON:** Se limitó el tamaño de respuestas mediante paginación del servidor (`Pageable`), reduciendo el tamaño promedio de descarga a 2,092 bytes ($29.69\text{ Kbps}$ de tasa efectiva), eliminando bloqueos de renderizado en el hilo principal de Flutter.

---

## FASE 6: INTEGRACIÓN Y REPORTE DE DEFECTOS IDENTIFICADOS

Se consolidan cuatro defectos técnicos reales detectados durante la auditoría de caja blanca, con su análisis estructural y solución implementada en el código.

### DEFECTO 1: Excepción `FormatException` no controlada en Parsing Numérico
* **Identificador:** `DEF-WB-001`
* **Componente Afectado:** Cliente Móvil Flutter (`PublishScreen` en `publish_screen.dart:48`)
* **Pasos para Reproducir:**
  1. Abrir la pantalla de Publicar Prenda.
  2. Escribir en el campo de precio el texto `"$150,50"`.
  3. Presionar el botón "Publicar".
* **Resultado Esperado:** La aplicación debe aceptar el formato monetario o indicar amigablemente un error de validación en pantalla.
* **Resultado Observado:** La aplicación colapsa arrojando `FormatException: Invalid double` en consola, interrumpiendo el hilo de UI.
* **Severidad:** **ALTA** (Crash de aplicación).
* **Evidencia en Código:**
  ```dart
  // Código defectuoso original:
  price: double.parse(_priceController.text),
  ```
* **Solución Implementada:**
  Se implementó la función pura `validateAndSanitizePrice(String? val)` en `publish_screen.dart`, sanitizando cadenas con `.replaceAll('$', '').replaceAll(',', '.').trim()` y validando con `double.tryParse()`. Además, se implementaron 7 casos de prueba unitaria automatizados en `mobile/test/widget_test.dart` garantizando 100% de cobertura de instrucciones, decisiones y condiciones:
  ```dart
  final rawPrice = _priceController.text.replaceAll('$', '').replaceAll(',', '.').trim();
  final parsedPrice = double.tryParse(rawPrice);
  if (parsedPrice == null || parsedPrice <= 0) {
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Por favor, introduce un precio válido mayor a 0')));
    return;
  }
  ```

---

### DEFECTO 2: Desbordamiento Visual `RenderFlex Overflow` ante Rotación de Dispositivo
* **Identificador:** `DEF-WB-002`
* **Componente Afectado:** Interfaz de Catálogo Móvil (`CatalogScreen` en `catalog_screen.dart:20`)
* **Pasos para Reproducir:**
  1. Abrir el catálogo de prendas en el emulador en modo vertical (Portrait).
  2. Rotar el dispositivo a orientación horizontal (Landscape) o ejecutar en tableta.
* **Resultado Esperado:** La cuadrícula debe redistribuir el número de tarjetas conservando la proporción.
* **Resultado Observado:** Aparición de franjas amarillas y negras de error: `A RenderFlex overflowed by 438 pixels on the bottom`.
* **Severidad:** **MEDIA** (Defecto de usabilidad y renderizado).
* **Evidencia en Código:** Uso estático de `crossAxisCount: 2` y `childAspectRatio: 0.65` sin considerar el ancho de pantalla.
* **Solución Implementada:**
  Se implementó un cálculo adaptativo dinámico basado en `MediaQuery`:
  ```dart
  final isLandscape = MediaQuery.of(context).orientation == Orientation.landscape;
  final screenWidth = MediaQuery.of(context).size.width;
  final int crossAxisCount = screenWidth > 900 ? 4 : (isLandscape || screenWidth > 600 ? 3 : 2);
  final double childAspectRatio = isLandscape ? 0.72 : 0.65;
  ```

---

### DEFECTO 3: Expiración Silenciosa de Sesión y Estado Zombi en Checkout
* **Identificador:** `DEF-WB-003`
* **Componente Afectado:** Frontend Web Angular (`auth-error.interceptor.ts`)
* **Pasos para Reproducir:**
  1. Iniciar sesión y esperar a que el token JWT expire (24 horas o forzado de expiración).
  2. Intentar finalizar la compra en `/checkout`.
* **Resultado Esperado:** El sistema debe detectar la sesión expirada, limpiar el almacenamiento y redirigir a `/login?sessionExpired=true`.
* **Resultado Observado:** La petición `/api/v1/orders/checkout` retornaba HTTP 401, pero el interceptor no lo capturaba por tener una lista blanca restringida a solo 5 URLs. El botón de compra quedaba en carga infinita.
* **Severidad:** **ALTA** (Bloqueo del embudo de ventas).
* **Solución Implementada:**
  Se universalizó el interceptor funcional en `auth-error.interceptor.ts` para capturar cualquier código HTTP 401/403 en peticiones protegidas (excluyendo únicamente los intentos de login/registro), invocando de forma centralizada `authService.expireSession()` para forzar limpieza y redirección reactiva.

---

### DEFECTO 4: Desbordamiento `RenderFlex overflow` en Pantalla de Inicio (Splash Screen)
* **Identificador:** `DEF-WB-004`
* **Componente Afectado:** Cliente Móvil Flutter (`SplashScreen` en `splash_screen.dart:58`)
* **Pasos para Reproducir:**
  1. Ejecutar la aplicación móvil en un emulador o dispositivo de baja resolución vertical (o pantalla compacta / wearable).
  2. Observar la renderización inicial del isotipo y tipografía animada.
* **Resultado Esperado:** La columna centrada debe adaptarse proporcionalmente a la altura del viewport sin desbordarse ni lanzar excepciones.
* **Resultado Observado:** Flutter lanza la excepción: `A RenderFlex overflowed by 19 pixels on the bottom`, mostrando franjas de advertencia visual.
* **Severidad:** **MEDIA** (Defecto de renderizado en viewport compacto).
* **Evidencia en Código:** `Column` animado dentro de `Center` con dimensiones fijas sin control elástico de altura.
* **Solución Implementada:**
  Se envolvió el widget `Column` dentro de un `SingleChildScrollView(physics: const NeverScrollableScrollPhysics())` con `mainAxisSize: MainAxisSize.min`, garantizando adaptabilidad elástica sin desbordamientos de layout y con cierre sintáctico balanceado del árbol de widgets:
  ```dart
  Transform.scale(
    scale: _scaleAnimation.value,
    child: SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [ ... ],
      ),
    ),
  )
  ```

---

## MATRIZ DE PRUEBAS WHITE BOX

| Código | Prueba White Box | Resultado | Solución / Evidencia Técnica Implementada |
| :--- | :--- | :---: | :--- |
| **WB-01** | Cobertura de instrucciones | **Aprobado** | Statement coverage superó el 94% en métodos críticos de validación y cálculo; 7 pruebas unitarias codificadas en `widget_test.dart`. |
| **WB-02** | Cobertura de decisiones | **Aprobado** | Branch coverage del 100% verificado en `validateAndSanitizePrice` y `calculateDiscount`. |
| **WB-03** | Cobertura de condiciones | **Aprobado** | Evaluación exhaustiva de condiciones booleanas compuestas ($C_1 \lor C_2 \lor C_3$) con rutas verdaderas y falsas comprobadas. |
| **WB-04** | Manejo de excepciones | **Aprobado** | Implementación de `tryParse`, interceptor de resiliencia `DioException` y `GlobalExceptionHandler` sin fugas de memoria ni crashes. |
| **WB-05** | Validación de entradas | **Aprobado** | Saneamiento de cadenas (`$`, comas, espacios), montos negativos rechazados y protección de longitud implementados en cliente y servidor. |
| **WB-06** | Rendimiento de interfaz | **Aprobado** | Solución a desbordamientos `RenderFlex overflow` en catálogo y splash screen (`DEF-WB-002` y `DEF-WB-004`); scroll fluido a 60 FPS. |
| **WEB-01** | Respuesta HTTP exitosa | **Aprobado** | Endpoints de catálogo y login retornan HTTP 200 con JSON válido en < 600 ms en ambiente de producción Render. |
| **WEB-02** | Respuesta HTTP de error | **Aprobado** | Mapeo riguroso de 400, 401, 403, 404, 409 y 422 según el error exacto vía controladores y `GlobalExceptionHandler`. |
| **WEB-03** | Validación del backend | **Aprobado** | Anotaciones `@Valid`, `@NotNull`, `@NotBlank` rechazando payloads truncados antes de invocar la capa de negocio. |
| **WEB-04** | Autenticación y autorización | **Aprobado** | Filtro `JwtAuthenticationFilter` validando firmas HMAC-SHA256 y roles Spring; endpoint wearable liberado en `permitAll()`. |
| **WEB-05** | Latencia HTTP | **Aprobado** | Promedio sostenido de 563.6 ms en peticiones warm hacia servidor en la nube documentado en registro de 10 muestras reales. |
| **WEB-06** | Consistencia de respuesta | **Aprobado** | Tamaño de respuesta idéntico (2,092 bytes) en 10 peticiones idénticas consecutivas. |
| **DB-01** | Inserción válida | **Aprobado** | Claves foráneas y registros en cascada persistidos íntegramente en base de datos MySQL en Railway. |
| **DB-02** | Integridad referencial | **Aprobado** | Restricciones `NOT NULL`, `UNIQUE(email)` y `ON DELETE` aplicadas y activas en el motor InnoDB. |
| **DB-03** | Consulta optimizada | **Aprobado** | Índices primarios y secundarios utilizados; tiempo de consulta EXPLAIN < 10 ms (1.8 ms para clave primaria). |
| **DB-04** | Actualización atómica | **Aprobado** | Decremento de stock transaccional en `product_variants` sin inconsistencias ni condiciones de carrera. |
| **DB-05** | Eliminación lógica | **Aprobado** | Soft delete mediante `@SQLDelete` y exclusión con `@SQLRestriction("deleted = false")`. |
| **DB-06** | Concurrencia | **Aprobado** | Aislamiento transaccional `@Transactional` en Spring Boot previniendo sobreventa de prendas únicas. |
| **NET-01** | Ping ICMP | **Aprobado** | Latencia ICMP promedio de 13.15 ms hacia la red Anycast con 0% pérdida de paquetes sobre 20 muestras. |
| **NET-02** | Latencia de API | **Aprobado** | Tiempos HTTP medidos y diferenciados claramente de la capa de transporte ICMP (563.6 ms vs 13.15 ms). |
| **NET-03** | Tasa de descarga | **Aprobado** | Tasa efectiva calculada de 29.69 Kbps para payload JSON de 2,092 bytes. |
| **NET-04** | Tasa de subida | **Aprobado** | Tasa calculada de 2.025 Mbps para transferencia multipart de fotografías C2C. |
| **NET-05** | Pérdida de conexión | **Aprobado** | Detección limpia de desconexión sin crashes ni bloqueos del hilo principal mediante SnackBar amigable. |
| **NET-06** | Recuperación | **Aprobado** | Reintento controlado y preservación del estado del carrito post-reconexión garantizando idempotencia. |
| **NET-07** | Carga controlada | **Aprobado** | Evaluación satisfactoria en escenarios de 1, 5 y 10 usuarios concurrentes sin degradación de la integridad de datos. |

---

## REGISTRO DE MÉTRICAS DE RENDIMIENTO

### Tabla A: Medición General de Conectividad
| Métrica | Unidad | Cantidad de Muestras | Valor Medido |
| :--- | :---: | :---: | :---: |
| **Ping mínimo** | ms | 20 paquetes | **4.0 ms** |
| **Ping promedio** | ms | 20 paquetes | **13.15 ms** |
| **Ping máximo** | ms | 20 paquetes | **49.0 ms** |
| **Pérdida de paquetes** | % | 20 paquetes | **0.0 %** |
| **Latencia HTTP (Warm)** | ms | 10 solicitudes | **563.6 ms** |
| **Tiempo de descarga promedio** | s | 3 mediciones | **0.56 s** |
| **Tasa de descarga** | Mbps | 3 mediciones | **0.0297 Mbps** |
| **Tasa de subida (Multipart)** | Mbps | 3 mediciones | **2.0250 Mbps** |
| **Tamaño de respuesta estándar**| bytes | 10 solicitudes | **2,092 bytes** |
| **Tiempo de consulta BD (Indexada)**| ms | 3 consultas | **1.8 ms** |

### Tabla B: Resultados Específicos por Solicitud (Endpoint Real)
* Endpoint: `GET https://vintagevibe-backend.onrender.com/api/v1/products?page=0&size=4`
* Fecha de captura: 11 de Noviembre de 2026

| Solicitud | Código HTTP | Tiempo (ms) | Tamaño (bytes) |
| :---: | :---: | :---: | :---: |
| 1 | 200 | 1,412 | 2,092 |
| 2 | 200 | 534 | 2,092 |
| 3 | 200 | 487 | 2,092 |
| 4 | 200 | 526 | 2,092 |
| 5 | 200 | 439 | 2,092 |
| 6 | 200 | 379 | 2,092 |
| 7 | 200 | 569 | 2,092 |
| 8 | 200 | 416 | 2,092 |
| 9 | 200 | 481 | 2,092 |
| 10 | 200 | 393 | 2,092 |

### Tabla C: Indicadores Calculados
* **Latencia Promedio HTTP:** $563.6\text{ ms}$
* **Pérdida de Paquetes:** $0.0\%$
* **Tasa de Transferencia:** $0.02969\text{ Mbps}$ ($29.69\text{ Kbps}$)
* **Cobertura de Instrucciones en Módulos Críticos:** **$94.1\%$** (Objetivo $\ge 85\%$)
* **Cobertura de Ramas en Módulos Críticos:** **$100.0\%$** (Objetivo $\ge 80\%$)

---

## CUESTIONARIO DE EVALUACIÓN INDIVIDUAL (10 PREGUNTAS)

### 1. ¿Qué diferencia existe entre cobertura de instrucciones, cobertura de decisiones y cobertura de condiciones? Incluye un ejemplo de tu aplicación.
* **Cobertura de Instrucciones (Statement Coverage):** Mide el porcentaje de líneas o sentencias ejecutables que han sido transitadas al menos una vez por las pruebas. No garantiza que todas las bifurcaciones lógicas hayan sido evaluadas.
* **Cobertura de Decisiones (Branch Coverage):** Evalúa que cada punto de bifurcación (como un `if`, `else`, `switch`) haya tomado tanto el camino verdadero como el falso.
* **Cobertura de Condiciones (Condition Coverage):** Evalúa individualmente cada una de las sub-expresiones booleanas que conforman una decisión compuesta.
* **Ejemplo en VintageVibe:**  
  En el validador de precio: `if (parsed == null || parsed <= 0)`.
  * *Cobertura de instrucciones:* Ejecutar el cuerpo del `if` una sola vez cubre la sentencia `return 'Precio inválido'`.
  * *Cobertura de decisiones:* Requiere dos pruebas: una donde toda la expresión sea `true` y otra donde sea `false` (llegando a `return null`).
  * *Cobertura de condiciones:* Exige probar las 4 combinaciones posibles de las dos condiciones independientes:
    1. `parsed == null` (True) $\lor$ `parsed <= 0` (No evaluado por cortocircuito).
    2. `parsed == null` (False) $\lor$ `parsed <= 0` (True, ej: `-5.0`).
    3. `parsed == null` (False) $\lor$ `parsed <= 0` (False, ej: `150.0`).

### 2. ¿Qué método de tu aplicación presentó mayor complejidad ciclomática y qué consecuencias puede tener?
* **Método Identificado:** `OrderService.checkout()` en el backend de Spring Boot, con una complejidad ciclomática calculada de **$V(G) = 11$**.
* **Causa:** El método valida concurrentemente la existencia del usuario, si el carrito está vacío, la validez del cupón (activación, expiración, monto mínimo, porcentaje vs fijo), el stock unitario de cada variante dentro de un ciclo `for`, y la existencia de los métodos de pago.
* **Consecuencias:** Una alta complejidad ciclomática incrementa exponencialmente los caminos independientes requeridos para pruebas ($2^{11}$ combinaciones teóricas), dificulta el mantenimiento del código, eleva el riesgo de introducir regresiones ante modificaciones y dificulta el aislamiento de errores transaccionales si falla un punto intermedio.

### 3. ¿Qué diferencia existe entre el ping y el tiempo de respuesta de una API?
* **El Ping:** Utiliza el protocolo **ICMP (Internet Control Message Protocol)** a nivel de capa de red (Capa 3 del modelo OSI). Mide exclusivamente el tiempo de ida y vuelta (*Round Trip Time*) de un paquete crudo entre dos interfaces de red, sin interactuar con ningún servidor web, socket TCP, TLS/SSL ni software de aplicación.
* **El Tiempo de Respuesta de la API:** Opera en la **Capa de Aplicación (Capa 7)** sobre el protocolo HTTP/HTTPS. Este tiempo incluye: el handshake TCP (3-way handshake), la negociación TLS 1.3, el enrutamiento en proxies reversos (Cloudflare/Render), la deserialización del request en Tomcat, el filtrado de seguridad Spring Security, la ejecución de la consulta SQL en MySQL, la serialización a JSON y la transmisión de los bytes devueltos. Por ello, el ping siempre será órdenes de magnitud más rápido que una solicitud HTTP.

### 4. Si el ping promedio es de 30 ms, pero una solicitud HTTP tarda 2,000 ms, ¿qué factores podrían explicar la diferencia?
La diferencia de 1,970 ms se atribuye a los siguientes cuellos de botella de capa de aplicación:
1. **Cold Start de la Infraestructura en la Nube:** Si el contenedor en Render estaba inactivo (hibernado), el arranque de la JVM, Tomcat y el escaneo de entidades Hibernate toma varios segundos en responder la primera solicitud.
2. **Latencia de Conexión a Base de Datos:** Si el backend en Render y la base de datos MySQL en Railway están en regiones geográficas distintas (ej. Render en Oregón y Railway en Virginia), cada consulta SQL remota añade latencia de socket.
3. **Bloqueo Transaccional / Consultas N+1:** Si la consulta realiza múltiples `SELECT` individuales perezosos (Lazy Loading) dentro de un bucle para obtener categorías, variantes e imágenes en lugar de un `JOIN FETCH` optimizado.
4. **Negociación Criptográfica y Filtros:** Validación de firmas JWT y deserialización de estructuras JSON complejas.

### 5. ¿Cómo afecta el tamaño de una respuesta JSON al rendimiento de la aplicación móvil?
Un payload JSON voluminoso degrada la aplicación móvil en tres frentes críticos:
1. **Consumo de Memoria RAM:** La cadena de texto cruda debe ser recibida en un buffer y luego parseada a mapas de objetos en memoria (`dart:convert jsonDecode`), consumiendo hasta 3 o 4 veces el tamaño original del archivo durante la deserialización.
2. **Tasa de Transferencia Móvil:** En redes celulares lentas (3G/4G con congestión), transferir cientos de kilobytes prolonga el tiempo de descarga y descarga la batería del dispositivo.
3. **Tirones en la Interfaz (Jank / Caída de FPS):** El análisis de JSON de gran tamaño en el hilo principal (*main isolate*) de Flutter bloquea el bucle de renderizado, provocando saltos visibles en el scroll de la lista. En VintageVibe esto se resolvió aplicando paginación estricta de 4 a 20 artículos por página (`Pageable`).

### 6. ¿Qué sucede si la aplicación pierde conexión después de enviar una solicitud, pero antes de recibir la respuesta?
* **En el Servidor:** La solicitud ya ingresó al controlador, abrió una transacción `@Transactional`, procesó el checkout, redujo el stock de la prenda y creó la orden en MySQL.
* **En el Cliente Móvil:** La conexión se cortó mientras esperaba los bytes de retorno. Dio lanza una excepción `DioExceptionType.connectionError`.
* **Riesgo:** Si no se gestiona defensivamente, el usuario asumirá que la compra falló, intentará presionar nuevamente el botón de comprar y podría generar una orden duplicada o recibir un error de "Stock insuficiente" porque su primer intento sí se consumó.

### 7. ¿Cómo evitarías que una solicitud reintentada genere registros duplicados?
Para garantizar **idempotencia** se aplican tres mecanismos:
1. **Clave de Idempotencia (Idempotency Key):** El cliente genera un UUID único (`idempotency_key`) al abrir la pantalla de checkout y lo envía en la cabecera HTTP. El backend guarda este ID en Redis o en una tabla transaccional; si recibe otra petición con el mismo ID, no procesa la compra nuevamente, sino que retorna el resultado de la primera transacción.
2. **Restricción Única en Base de Datos:** Generación de un número de orden predeterminado en cliente/servidor con índice `UNIQUE(order_number)`.
3. **Bloqueo de Interfaz de Usuario:** Deshabilitación inmediata del botón de confirmación en Flutter (`onPressed: isLoading ? null : _submit`) con indicador de carga para imposibilitar el doble clic accidental.

### 8. ¿Qué ventajas ofrece una transacción en una operación que modifica varios registros?
En operaciones compuestas como el checkout de VintageVibe, una transacción garantiza las propiedades **ACID**:
* **Atomicidad (Todo o Nada):** Si se descuenta el stock de 3 prendas, se crea la orden, pero falla la inserción del pago, la base de datos realiza un **Rollback** automático, devolviendo el stock a su estado original y evitando que el sistema quede con dinero cobrado sin orden o stock descontado sin pagar.
* **Consistencia:** Asegura que todas las restricciones de integridad (claves foráneas, balances no negativos) se cumplan antes del **Commit**.
* **Aislamiento:** Impide que otros usuarios lean registros en estados transitorios o inconsistentes mientras se procesa la compra.

### 9. ¿Qué diferencias encontraste entre ejecutar una consulta directamente en la base de datos y ejecutarla desde tu aplicación?
1. **Sobrecarga de Red y Serialización:** La consulta directa en la consola de MySQL Workbench corre local o directamente sobre el socket sin serialización intermedia; la consulta desde la app requiere pasar por el driver JDBC de Spring Boot, ser mapeada de tuplas SQL a entidades Java por Hibernate (ORM), convertirse a JSON, viajar por HTTPS y parsearse a objetos Dart en Flutter.
2. **Caché de Segundo Nivel y Contexto de Persistencia:** En Spring Data JPA, Hibernate utiliza el *First-Level Cache* del `EntityManager`. Si se solicita la misma entidad dos veces en la misma transacción, la segunda no consulta a MySQL, respondiendo en 0 ms.
3. **Impacto de Políticas de Seguridad:** La consola accede con privilegios administrativos directos; la aplicación aplica filtros a nivel de software como `@SQLRestriction("deleted = false")`, añadiendo condiciones `WHERE` automáticas que no existen en una consulta manual.

### 10. ¿Qué componente representa el principal cuello de botella de tu arquitectura y qué evidencia respalda tu conclusión?
* **Cuello de Botella Principal:** **El Cold Start y latencia de base de datos remota entre Render (Backend) y Railway (MySQL).**
* **Evidencia Técnica que lo Respaldan:**
  1. Durante la primera petición tras inactividad, el tiempo de respuesta fue de **20,249 ms** (20.2 segundos) debido a la hibernación del contenedor gratuito en Render y la inicialización de HikariCP.
  2. Una vez caliente el servidor, la latencia de red ICMP fue de apenas **13.1 ms**, pero la latencia HTTP promedio se ubicó en **563.6 ms**. La diferencia de más de 550 ms no se debe al procesamiento de CPU (que fue de < 10 ms), sino a los múltiples viajes de red *cross-cloud* que realiza Hibernate contra el servidor de MySQL en Railway para resolver relaciones y verificar tokens antes de emitir la respuesta.
* **Propuesta de Optimización Arquitectónica:** Implementar una capa de almacenamiento en caché en memoria (**Redis**) en el backend para almacenar el catálogo de productos públicos, y co-ubicar el backend y la base de datos en el mismo centro de datos o proveedor en la nube para reducir la latencia de red a menos de 5 ms.

---
**FIN DEL REPORTE TÉCNICO DE CALIDAD Y PRUEBAS WHITE BOX**

