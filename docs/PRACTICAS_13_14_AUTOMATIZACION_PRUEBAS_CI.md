# PRÁCTICAS 13 y 14: Automatización de Pruebas y Validación Continua de Aplicaciones Móviles (Flutter)

**Proyecto:** VintageVibe Mobile (Marketplace de Moda Circular Vintage C2C)  
**Repositorio GitHub:** [AngelDevHub/VintageVibe_Mobile](https://github.com/AngelDevHub/VintageVibe_Mobile)  
**Tecnología Móvil:** Flutter 3.44.0 / Dart 3.12.0 + Riverpod + Dio + SecureStorage + SQLite (`sqflite`)  
**Backend API:** Spring Boot 3.4 (Java 21) desplegado en Render + MySQL en Railway  
**Despliegue PWA:** [vintage-vibe-mobile.vercel.app](https://vintage-vibe-mobile.vercel.app)  
**Fecha de actualización:** 19 de noviembre de 2026  

---

## Fase 1. Selección de Componentes Críticos

Con base en los hallazgos de la auditoría de rendimiento, estrés y resiliencia de la práctica anterior, se seleccionaron tres componentes críticos de la aplicación móvil **VintageVibe**:

1. **Función crítica de negocio (Validación de precios C2C y control de stock en carrito):**
   - `validateAndSanitizePrice()` en `mobile/lib/features/publish/presentation/screens/publish_screen.dart` y el cálculo de inventario restante (`remainingStock = variantStock - inCartQty`) aplicado en `ProductDetailScreen` y `CatalogScreen`.
   - **Defecto previo detectado:** Anteriormente, cuando una prenda contaba con 1 unidad en inventario, la aplicación permitía solicitar cantidades mayores, provocando que el backend devolviera `HTTP 400 Bad Request` y que el estado reactivo de Riverpod colapsara a `AsyncError`, reemplazando la vista del carrito por un mensaje rojo técnico (`DioException`).
2. **Servicio y mecanismo de comunicación HTTP (`CartRepository` + `CartNotifier` + `Dio`):**
   - Comunicación REST con los endpoints `/api/v1/cart` y `/api/v1/cart/items` mediante `Dio` y gestión de estado asíncrono con `AsyncNotifier<CartModel>`.
   - **Riesgo previo detectado:** Pérdida del estado previo del carrito ante respuestas `HTTP 400` y falta de tolerancia ante *Cold Starts* o *timeouts* de Render (`connectionTimeout`).
3. **Operación de persistencia y almacenamiento local (`AuthRepository` + `SecureStorage`):**
   - Almacenamiento cifrado del token JWT (`vv_token`) y perfil de usuario serializado en JSON (`vv_user`) mediante `flutter_secure_storage`, así como su limpieza completa al cerrar sesión (`logout()`).
   - **Riesgo previo detectado:** Desincronización de sesión o fuga de credenciales residuales si el cierre de sesión no limpiaba adecuadamente el almacenamiento seguro ante fallos del servidor.

---

## Fase 2. Automatización de Pruebas Unitarias

Se implementaron **8 pruebas unitarias** en [`mobile/test/unit/business_logic_test.dart`](../mobile/test/unit/business_logic_test.dart) utilizando `flutter_test` y `test()`, adicionales a las 9 pruebas existentes en `mobile/test/widget_test.dart`.

Cobertura implementada:
* **Entrada válida (`AUT-01`):** Aceptación de precios con símbolo de moneda, enteros y comas decimales (`$250.50`, `1200`, `$85,99`).
* **Entrada vacía o nula (`AUT-01b`):** Rechazo controlado de valores `null`, cadena vacía `""` y espacios en blanco `"    "`, retornando `'Requerido'`.
* **Valores fuera de rango (`AUT-02`, `AUT-02b`):** Rechazo de precios `0`, `$0.00`, `-45.50` y texto no numérico `'abc'`; además, verificación de que el stock restante nunca produzca números negativos cuando `inCartQty >= variantStock`.
* **Resultado esperado (`AUT-03`, `AUT-03b`):** Verificación exacta de deserialización de `CartModel.fromJson`, cálculo de `CartItemModel.subtotal` (`price * quantity`), manejo seguro de listas `items: null` y mapeo de `AuthResponse.fromJson`.
* **Manejo de excepciones (`AUT-03c`, `AUT-03d`):** Validación explícita con `throwsA(isA<ArgumentError>())` ante stock negativo y `throwsA(isA<TypeError>())` ante payloads JSON corruptos sin campo obligatorio `id`.

---

## Fase 3. Automatización de Pruebas de Integración y Persistencia

Se implementaron **8 pruebas de integración y persistencia** estructuradas en dos suites complementarias:

### A. Integración API REST, Riverpod y SecureStorage
En [`mobile/test/integration/api_and_persistence_integration_test.dart`](../mobile/test/integration/api_and_persistence_integration_test.dart), integrando los componentes reales de la aplicación (`Dio`, `CartRepository`, `CartNotifier` en `ProviderContainer`, `AuthRepository` y `SecureStorage`) mediante un `MockHttpClientAdapter` determinista en memoria y `FlutterSecureStorage.setMockInitialValues({})`:

1. **`AUT-04` (App → Servicio REST → Estado Riverpod, HTTP 200 OK):** Verifica que `cartProvider.notifier.addProduct(101, 1)` envíe `POST /cart/items` con `{'variantId': 101, 'quantity': 1}`, reciba `HTTP 200 OK` y actualice el total del carrito a `$450.0`.
2. **`AUT-05` (Resiliencia ante HTTP 400 Bad Request):** Simula la respuesta real de stock insuficiente del servidor (`HTTP 400`) y valida que `CartNotifier` retorne el mensaje exacto del backend **sin degradar `cartProvider` a `AsyncError`** (`hasError == false`), conservando los productos previos intactos.
3. **`AUT-05b` (Servidor no responde / `connectionTimeout`):** Simula una caída o *timeout* de red en `Dio` y confirma que la aplicación devuelve el mensaje controlado `'No se pudo completar la operación en el carrito'` sin excepciones no capturadas.
4. **`AUT-06` (Persistencia de sesión y limpieza):** Ejecuta `authRepository.login()` contra `/auth/login`, comprueba que el JWT y el objeto de usuario se guarden en `SecureStorage` (`hasSession() == true`, `getStoredUser()` íntegro) y confirma que `authRepository.logout()` elimine por completo los registros almacenados (`hasSession() == false`).

### B. Persistencia Estructurada SQLite y Fallback Offline (Práctica 4)
En [`mobile/test/integration/sqlite_catalog_cache_test.dart`](../mobile/test/integration/sqlite_catalog_cache_test.dart), validando el ciclo de vida CRUD y la resiliencia offline de `LocalCatalogDatabase` (`sqflite_common_ffi`):

5. **`P4-01` (INSERT y SELECT estructurado):** Inserción por lotes y consulta relacional en SQLite de prendas con marca, categoría y precio.
6. **`P4-02` (UPDATE de registro local):** Modificación de nombre y precio en SQLite conservando la integridad de datos.
7. **`P4-03` (DELETE de prenda):** Eliminación por ID en SQLite local con verificación de conteo.
8. **`P4-04` (Sincronización online y Fallback offline):** Valida que `CatalogRepository` consuma la API REST en línea actualizando SQLite, y que al simular una desconexión total (`DioException` de red), retorne de inmediato los registros cacheados en SQLite sin arrojar error al usuario.

---

## Fase 4. Automatización del Proceso de Pruebas (CI/CD con GitHub Actions)

Se configuró el pipeline de integración continua en [`.github/workflows/ci.yml`](../mobile/.github/workflows/ci.yml) en el repositorio dedicado de la aplicación móvil (`AngelDevHub/VintageVibe_Mobile`), el cual se dispara automáticamente en cada `push` (ramas `main`, `develop`) y en cada `pull_request`:

```yaml
name: VintageVibe Mobile CI

on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main", "develop" ]

jobs:
  mobile-quality:
    name: Flutter Analyze & Automated Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Flutter SDK (Stable)
        uses: subosito/flutter-action@v2
        with:
          channel: 'stable'
          cache: true

      - name: Crear archivo .env desde plantilla
        run: cp .env.example .env

      - name: Instalar dependencias de Flutter
        run: flutter pub get

      - name: Análisis estático (Flutter Analyze)
        run: flutter analyze --no-fatal-infos

      - name: Ejecutar pruebas unitarias, integración, SQLite y widgets
        run: flutter test --reporter expanded
```

**Ajuste técnico y resolución de incidencias en el CI:**
* **Versión del SDK:** Se fijó el canal `stable` de Flutter para alineación perfecta con `sdk: ^3.12.0`.
* **Análisis Estático Preventivo:** Se configuró `flutter analyze --no-fatal-infos` como compuerta de calidad previa a los tests. Cuando se detectó un error de resolución de ruta de importación en `catalog_screen.dart` y elementos sin uso tras los cambios de UI, el CI bloqueó el avance inmediatamente, garantizando que código defectuoso no llegara al despliegue. Tras corregir los imports y dead code (`commit 18f2c05`), el análisis estático arrojó **0 errores y 0 advertencias**.

---

## Fase 5. Validación y Análisis de Resultados

### Resumen cuantitativo de ejecución (`flutter test --reporter expanded`)

| Métrica | Resultado |
| :--- | :--- |
| **Total de pruebas ejecutadas** | **25 pruebas automatizadas** (8 unitarias + 4 integración API/Auth + 4 SQLite/offline + 9 widgets/caja blanca) |
| **Pruebas aprobadas** | **25 / 25 (100% de éxito)** |
| **Pruebas fallidas** | **0** |
| **Tiempo total de ejecución local** | **5.2 segundos (`00:05`)** |
| **Resultado en GitHub Actions CI** | **Status: `completed` \| Conclusion: `success` ✅ (Run ID `44464424721`)** |
| **Enlace de ejecución CI en vivo** | [https://github.com/AngelDevHub/VintageVibe_Mobile/actions/runs/44464424721](https://github.com/AngelDevHub/VintageVibe_Mobile/actions/runs/44464424721) |

### Evidencia de ejecución en consola (25 / 25 Pruebas Superadas)

```text
00:00 +0: loading test/integration/api_and_persistence_integration_test.dart
00:00 +0: test/integration/api_and_persistence_integration_test.dart: Fase 3 - Pruebas de Integración: API, Riverpod y Persistencia (VintageVibe) AUT-04: CartNotifier + CartRepository envían POST /cart/items y reciben HTTP 200 OK
00:00 +1: test/integration/api_and_persistence_integration_test.dart: Fase 3 - Pruebas de Integración: API, Riverpod y Persistencia (VintageVibe) AUT-05: Ante HTTP 400 (Stock insuficiente), CartNotifier conserva estado previo y devuelve mensaje
00:00 +2: test/integration/api_and_persistence_integration_test.dart: Fase 3 - Pruebas de Integración: API, Riverpod y Persistencia (VintageVibe) AUT-05b: Muestra mensaje adecuado cuando el servidor no responde (connectionTimeout)
00:00 +3: test/integration/api_and_persistence_integration_test.dart: Fase 3 - Pruebas de Integración: API, Riverpod y Persistencia (VintageVibe) AUT-06: AuthRepository.login persiste JWT y usuario en SecureStorage y logout los limpia
00:01 +4: test/integration/sqlite_catalog_cache_test.dart: Práctica 4 - Almacenamiento Estructurado SQLite (CRUD + Fallback Offline) P4-01: INSERT y SELECT estructurado de 3 prendas en SQLite local
00:01 +5: test/integration/sqlite_catalog_cache_test.dart: Práctica 4 - Almacenamiento Estructurado SQLite (CRUD + Fallback Offline) P4-02: UPDATE modifica un registro existente en SQLite y conserva el cambio
00:01 +6: test/integration/sqlite_catalog_cache_test.dart: Práctica 4 - Almacenamiento Estructurado SQLite (CRUD + Fallback Offline) P4-03: DELETE elimina una prenda por ID en SQLite local
00:01 +7: test/integration/sqlite_catalog_cache_test.dart: Práctica 4 - Almacenamiento Estructurado SQLite (CRUD + Fallback Offline) P4-04: Integración CatalogRepository sincroniza SQLite online y responde offline al caer la red
00:02 +8: test/unit/business_logic_test.dart: Fase 2 - Pruebas Unitarias de Lógica de Negocio Crítica (VintageVibe) AUT-01: Entrada válida - Validador de precios acepta montos con formato monetario
00:02 +9: test/unit/business_logic_test.dart: Fase 2 - Pruebas Unitarias de Lógica de Negocio Crítica (VintageVibe) AUT-01b: Entrada vacía o nula - Rechaza valores nulos, vacíos o solo espacios
00:02 +10: test/unit/business_logic_test.dart: Fase 2 - Pruebas Unitarias de Lógica de Negocio Crítica (VintageVibe) AUT-02: Valores fuera de rango - Rechaza precios en cero, negativos o no numéricos
00:02 +11: test/unit/business_logic_test.dart: Fase 2 - Pruebas Unitarias de Lógica de Negocio Crítica (VintageVibe) AUT-02b: Valores fuera de rango - Stock restante nunca es negativo si inCart >= stock
00:02 +12: test/unit/business_logic_test.dart: Fase 2 - Pruebas Unitarias de Lógica de Negocio Crítica (VintageVibe) AUT-03: Resultado esperado - CartModel y CartItemModel calculan totales correctamente
00:02 +13: test/unit/business_logic_test.dart: Fase 2 - Pruebas Unitarias de Lógica de Negocio Crítica (VintageVibe) AUT-03b: Resultado esperado - CartModel maneja lista items nula sin colapsar
00:02 +14: test/unit/business_logic_test.dart: Fase 2 - Pruebas Unitarias de Lógica de Negocio Crítica (VintageVibe) AUT-03c: Manejo de excepciones - Lanza ArgumentError ante stock o cantidad negativos
00:02 +15: test/unit/business_logic_test.dart: Fase 2 - Pruebas Unitarias de Lógica de Negocio Crítica (VintageVibe) AUT-03d: Manejo de excepciones - Payload JSON corrupto sin id obligatorio lanza TypeError
00:02 +16: test/widget_test.dart: Pruebas de Widgets y UI - CatalogScreen (Mobile Flutter) CP-MOB-01: Muestra mensaje cuando el catálogo de productos está vacío
00:05 +17: test/widget_test.dart: Pruebas de Widgets y UI - CatalogScreen (Mobile Flutter) CP-MOB-02: Renderiza tarjetas de prendas cuando el catálogo tiene datos
00:05 +18: test/widget_test.dart: Pruebas Unitarias White Box - Validador de Precios C2C (ST-01) TC-VAL-01: Rechaza entrada nula
00:05 +19: test/widget_test.dart: Pruebas Unitarias White Box - Validador de Precios C2C (ST-01) TC-VAL-02: Rechaza entrada con solo espacios en blanco
00:05 +20: test/widget_test.dart: Pruebas Unitarias White Box - Validador de Precios C2C (ST-01) TC-VAL-03: Rechaza caracteres alfanuméricos no numéricos
00:05 +21: test/widget_test.dart: Pruebas Unitarias White Box - Validador de Precios C2C (ST-01) TC-VAL-04: Rechaza precio en cero con símbolo de moneda ($0.00)
00:05 +22: test/widget_test.dart: Pruebas Unitarias White Box - Validador de Precios C2C (ST-01) TC-VAL-05: Rechaza precio negativo (-0.01)
00:05 +23: test/widget_test.dart: Pruebas Unitarias White Box - Validador de Precios C2C (ST-01) TC-VAL-06: Acepta valor límite inferior válido ($0.01)
00:05 +24: test/widget_test.dart: Pruebas Unitarias White Box - Validador de Precios C2C (ST-01) TC-VAL-07: Acepta precio con formato de coma decimal y símbolo ($150,50)
00:05 +25: All tests passed!
```

---

## Matriz de Automatización Completada

| ID | Tipo | Estado | Descripción / Evidencia de Validación |
| :--- | :--- | :--- | :--- |
| **AUT-01** | Unitarias | **Aprobado** | Validación de entradas válidas (`$250.50`, `1200`) y nulas/vacías (`null`, `""`, `"   "`) en `validateAndSanitizePrice`. |
| **AUT-02** | Unitarias | **Aprobado** | Validación de valores fuera de rango (`0`, `-45.50`, `'abc'`) y límite de inventario restante (`remainingStock >= 0`). |
| **AUT-03** | Unitarias | **Aprobado** | Verificación de resultados esperados (`CartModel`, `subtotal`, `AuthResponse`) y manejo de excepciones (`ArgumentError`, `TypeError`). |
| **AUT-04** | Integración | **Aprobado** | Comunicación `CartNotifier` → `CartRepository` → `Dio` (`POST /cart/items`), validación de payload y código `HTTP 200 OK`. |
| **AUT-05** | Integración | **Aprobado** | Manejo resiliente ante `HTTP 400` (stock insuficiente conservando `previousState`) y `connectionTimeout` con mensaje amigable. |
| **AUT-06** | Persistencia | **Aprobado** | Almacenamiento y recuperación real de JWT y usuario en `SecureStorage` tras `login()`, y limpieza total tras `logout()`. |
| **AUT-07** | CI (Pipeline) | **Aprobado** | Pipeline configurado en `.github/workflows/ci.yml` con disparo automático en `push` y `pull_request` (Flutter `pub get`, `analyze`, `test`). |
| **AUT-08** | CI (Ejecución) | **Aprobado** | Ejecución automatizada validada al 100% (**25/25 pruebas aprobadas en 5.2 segundos, 0 fallos**), GitHub Actions en verde (`success`, Run ID `44464424721`). |

---

## Fase 6. Conclusiones

La automatización de pruebas unitarias, de integración, persistencia estructurada SQLite y validación estática de código, acoplada a un flujo de Integración Continua (CI) en GitHub Actions, transforma el control de calidad de una actividad manual reactiva a una barrera preventiva permanente. En el contexto de **VintageVibe Mobile**, defectos críticos detectados en iteraciones previas —como la ruptura completa de la pantalla del carrito al superar el stock disponible (`AsyncError`), los errores de formato en campos numéricos, los fallos de almacenamiento en sesiones web y las caídas por falta de conexión offline— quedaron encapsulados como contratos verificables en código.

Cada vez que se incorpore una nueva funcionalidad (como los filtros de marcas/categorías estilo Shein, el checklist dinámico de contraseñas, o notificaciones para Wear OS) o se realice una refactorización, el pipeline CI ejecuta automáticamente el análisis estático y las 25 pruebas en apenas cinco segundos. Si una modificación introduce una regresión en el cálculo de totales, en el manejo de errores HTTP o en el almacenamiento local, el fallo se detecta de inmediato en GitHub Actions antes de impactar el entorno de producción en Vercel. De esta forma, la automatización reduce drásticamente el costo de mantenimiento, acelera la entrega continua y garantiza que la estabilidad y confiabilidad de la aplicación móvil se conserven intactas a lo largo de toda su evolución.
