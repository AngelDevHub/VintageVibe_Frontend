# PRÁCTICAS 13 y 14: Automatización de Pruebas y Validación Continua de Aplicaciones Móviles (Flutter)

**Proyecto:** VintageVibe Mobile (Marketplace de Moda Circular Vintage C2C)  
**Tecnología Móvil:** Flutter 3.44.0 / Dart 3.12.0 + Riverpod + Dio + SecureStorage  
**Backend API:** Spring Boot 3.4 (Java 21) desplegado en Render + MySQL en Railway  
**Fecha:** 18 de noviembre de 2026  

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

## Fase 3. Automatización de Pruebas de Integración

Se implementaron **4 pruebas de integración** en [`mobile/test/integration/api_and_persistence_integration_test.dart`](../mobile/test/integration/api_and_persistence_integration_test.dart), integrando los componentes reales de la aplicación (`Dio`, `CartRepository`, `CartNotifier` en `ProviderContainer`, `AuthRepository` y `SecureStorage`) mediante un `MockHttpClientAdapter` determinista en memoria y `FlutterSecureStorage.setMockInitialValues({})`:

1. **`AUT-04` (App → Servicio REST → Estado Riverpod, HTTP 200 OK):** Verifica que `cartProvider.notifier.addProduct(101, 1)` envíe `POST /cart/items` con `{'variantId': 101, 'quantity': 1}`, reciba `HTTP 200 OK` y actualice el total del carrito a `$450.0`.
2. **`AUT-05` (Resiliencia ante HTTP 400 Bad Request):** Simula la respuesta real de stock insuficiente del servidor (`HTTP 400`) y valida que `CartNotifier` retorne el mensaje exacto del backend **sin degradar `cartProvider` a `AsyncError`** (`hasError == false`), conservando los productos previos intactos.
3. **`AUT-05b` (Servidor no responde / `connectionTimeout`):** Simula una caída o *timeout* de red en `Dio` y confirma que la aplicación devuelve el mensaje controlado `'No se pudo completar la operación en el carrito'` sin excepciones no capturadas.
4. **`AUT-06` (Persistencia de sesión y limpieza):** Ejecuta `authRepository.login()` contra `/auth/login`, comprueba que el JWT y el objeto de usuario se guarden en `SecureStorage` (`hasSession() == true`, `getStoredUser()` íntegro) y confirma que `authRepository.logout()` elimine por completo los registros almacenados (`hasSession() == false`).

---

## Fase 4. Automatización del Proceso de Pruebas (CI/CD con GitHub Actions)

Se actualizó el pipeline de integración continua en [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), el cual se dispara automáticamente en cada `push` (ramas `main`, `master`, `develop`) y en cada `pull_request`:

```yaml
  mobile-quality:
    name: Mobile Unit, Integration & Widget Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: mobile
    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Flutter SDK (Stable)
        uses: subosito/flutter-action@v2
        with:
          channel: 'stable'
          cache: true

      - name: Instalar dependencias de Flutter
        run: flutter pub get

      - name: Análisis estático de código (Flutter Analyze)
        run: flutter analyze --no-fatal-infos

      - name: Ejecutar Pruebas Unitarias, de Integración y Widgets
        run: flutter test --reporter expanded
```

**Ajuste técnico realizado en el CI:** Se actualizó la versión fijada de Flutter (`3.29.0`) al canal `stable` para garantizar compatibilidad con el requisito `sdk: ^3.12.0` definido en `mobile/pubspec.yaml`, y se incorporó el paso de análisis estático `flutter analyze --no-fatal-infos`.

---

## Fase 5. Validación y Análisis de Resultados

### Resumen cuantitativo de ejecución (`flutter test --reporter expanded`)

| Métrica | Resultado |
| :--- | :--- |
| **Total de pruebas ejecutadas** | **21 pruebas** (8 unitarias nuevas + 4 de integración/persistencia + 9 de widgets/caja blanca) |
| **Pruebas aprobadas** | **21 / 21 (100%)** |
| **Pruebas fallidas** | **0** |
| **Tiempo total de ejecución** | **6 segundos (`00:06`)** |
| **Errores encontrados y correcciones** | Se detectó en el workflow CI anterior una incompatibilidad de versión del SDK de Flutter (`3.29.0` vs Dart `3.12.0`); se actualizó al canal `stable` y se añadió `flutter analyze`. |

### Evidencia de ejecución en consola

```text
00:00 +0: ... api_and_persistence_integration_test.dart: AUT-04: CartNotifier + CartRepository envían POST /cart/items y reciben HTTP 200 OK
00:00 +1: ... api_and_persistence_integration_test.dart: AUT-05: Ante HTTP 400 (Stock insuficiente), CartNotifier conserva estado previo y devuelve mensaje
00:00 +2: ... api_and_persistence_integration_test.dart: AUT-05b: Muestra mensaje adecuado cuando el servidor no responde (connectionTimeout)
00:00 +3: ... api_and_persistence_integration_test.dart: AUT-06: AuthRepository.login persiste JWT y usuario en SecureStorage y logout los limpia
00:01 +4: ... business_logic_test.dart: AUT-01: Entrada válida - Validador de precios acepta montos con formato monetario
00:01 +5: ... business_logic_test.dart: AUT-01b: Entrada vacía o nula - Rechaza valores nulos, vacíos o solo espacios
00:01 +6: ... business_logic_test.dart: AUT-02: Valores fuera de rango - Rechaza precios en cero, negativos o no numéricos
00:01 +7: ... business_logic_test.dart: AUT-02b: Valores fuera de rango - Stock restante nunca es negativo si inCart >= stock
00:01 +8: ... business_logic_test.dart: AUT-03: Resultado esperado - CartModel y CartItemModel calculan totales correctamente
00:02 +9: ... business_logic_test.dart: AUT-03b: Resultado esperado - CartModel maneja lista items nula sin colapsar
00:02 +10: ... business_logic_test.dart: AUT-03c: Manejo de excepciones - Lanza ArgumentError ante stock o cantidad negativos
00:02 +11: ... business_logic_test.dart: AUT-03d: Manejo de excepciones - Payload JSON corrupto sin id obligatorio lanza TypeError
00:03 +12: ... widget_test.dart: CP-MOB-01 ... hasta TC-VAL-07
00:06 +21: All tests passed!
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
| **AUT-07** | CI | **Aprobado** | Pipeline configurado en `.github/workflows/ci.yml` con disparo automático en `push` y `pull_request` (Flutter `pub get`, `analyze`, `test`). |
| **AUT-08** | CI | **Aprobado** | Ejecución automatizada validada al 100% (21/21 pruebas aprobadas en 6 segundos, 0 fallos) y lista para verificación continua en cada push. |

---

## Fase 6. Conclusiones

La automatización de pruebas unitarias, de integración y de persistencia, acoplada a un flujo de Integración Continua (CI) en GitHub Actions, transforma el control de calidad de una actividad manual reactiva a una barrera preventiva permanente. En el contexto de **VintageVibe Mobile**, defectos críticos detectados en iteraciones previas —como la ruptura completa de la pantalla del carrito al superar el stock disponible (`AsyncError`), los errores de formato en campos numéricos y el riesgo de sesiones inconsistentes tras fallos de red— quedaron encapsulados como contratos verificables en código.

Cada vez que se incorpore una nueva funcionalidad (como soporte PWA para iOS, pasarelas de pago o notificaciones para Wear OS) o se realice una refactorización, el pipeline CI ejecutará automáticamente el análisis estático y las 21 pruebas en apenas seis segundos. Si una modificación introduce una regresión en el cálculo de totales, en el manejo de errores HTTP o en el almacenamiento del token JWT, el fallo se detecta de inmediato antes de llegar a producción. De esta forma, la automatización reduce drásticamente el costo de mantenimiento, acelera la entrega continua y garantiza que la estabilidad y confiabilidad de la aplicación móvil se conserven intactas a lo largo de toda su evolución.
