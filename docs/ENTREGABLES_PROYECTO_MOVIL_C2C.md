# UNIVERSIDAD TECNOLÓGICA DE QUERÉTARO
## División de Tecnologías de la Información y Comunicación
### Ingeniería en Desarrollo y Gestión de Software
**Asignatura:** Desarrollo de Aplicaciones para Dispositivos Móviles Avanzados  
**Proyecto:** Extensión Móvil C2C para Plataforma de Comercio Electrónico de Ropa Vintage (VintageVibe)  
**Estudiante:** José Ángel Gómez Castañón  
**Fecha de Actualización:** Noviembre 2026  

---

# ESPECIFICACIÓN TÉCNICA DETALLADA DE ENTREGABLES Y RÚBRICA DE EVALUACIÓN

El presente documento amplía, desglosa y formaliza cada uno de los entregables del proyecto por parciales, integrando la fundamentación técnica de la arquitectura móvil en **Flutter**, su integración con el backend en **Spring Boot**, servicios en la nube (**Cloudinary**, **Railway MySQL**, **Render**) y la ejecución de las prácticas de laboratorio institucionales (**Firmware** y **Conexión Externa a Wearables**).

---

## 6. División de Entregables del Proyecto

```mermaid
flowchart LR
    A["Parcial 1: Fundamentación &amp; Base Técnica"] --> B["Parcial 2: Desarrollo C2C &amp; Integración Hardware"]
    B --> C["Parcial 3: Sincronización, Resiliencia &amp; E2E"]
```

---

### 6.1 Primer Parcial: Definición, Análisis, Arquitectura y Prototipado Base

#### Objetivo General
Establecer la base arquitectónica, conceptual, de hardware y de diseño de la aplicación móvil en Flutter, garantizando la viabilidad de la modalidad C2C (Consumer-to-Consumer) y el acceso a los sensores ópticos nativos.

---

#### 6.1.1 Documento de Justificación, Alcance y Selección del Smart Device
* **Justificación de Negocio (B2C a C2C):**
  * La plataforma VintageVibe nació como un comercio electrónico B2C donde únicamente el catálogo corporativo ofrecía prendas.
  * La extensión C2C descentraliza el inventario permitiendo a la comunidad fotografiar, tasar y vender prendas vintage de segunda mano, aprovechando la economía circular de la moda retro.
* **Selección del Dispositivo Inteligente (Smartphone Android/iOS):**
  * **Acceso a Sensores Físicos:** Presencia indispensable de sensor óptico (cámara) con autoenfoque y flash LED para capturar la textura y autenticidad de la ropa.
  * **Almacenamiento Seguro Hardware-backed:** Soporte para Keystore (Android) y Keychain (iOS) a fin de resguardar tokens JWT de sesión de forma inviolable mediante `flutter_secure_storage`.
  * **Conectividad Múltiple:** Antena Wi-Fi / LTE / 5G para comunicación HTTP REST y módulo Bluetooth Low Energy (BLE) para la sincronización periférica con wearables (Smartwatches).
* **Delimitación de Alcance Móvil:**
  * La aplicación móvil está optimizada exclusivamente para compradores y vendedores finales (C2C). Las tareas administrativas masivas de auditoría global y métricas financieras permanecen en el panel web de Angular.

---

#### 6.1.2 Diseño de Arquitectura de Comunicación y Software Móvil
* **Patrón de Arquitectura: Feature-Driven + Clean Architecture:**
  * **Capa Presentation:** Screens declarativas, componentes atómicos (`VVShell`, botones táctiles de 48dp mínimo) y gestión de estados inmutables con **Flutter Riverpod** (`NotifierProvider`, `FutureProvider`).
  * **Capa Domain:** Entidades desacopladas (`Product`, `ProductVariant`, `User`, `CartItem`) y contratos abstractos de repositorio.
  * **Capa Data:** Implementaciones concretas de repositorios, DTOs con serialización JSON segura, cliente HTTP **Dio** con interceptores de autenticación y manejo de timeouts adaptados al cloud hosting.
* **Enrutamiento Declarativo (Navigation 2.0 con GoRouter):**
  * **ShellRoute Persistente:** Mantiene una barra de navegación inferior (`BottomNavigationBar`) con 4 accesos directos: Catálogo (`/home`), Publicar (`/publish`), Carrito (`/cart`) y Perfil (`/profile`).
  * **Stack Navigation:** Pantallas de detalle (`/product/:id`, `/checkout`, `/orders`, `/my-listings`) que se apilan ocultando la barra inferior para una navegación inmersiva.
  * **Auth Guards Reactivos:** Redirección automática a `/login` si un usuario no autenticado intenta publicar o consultar información sensible.

---

#### 6.1.3 Prototipo Funcional de Publicación y Wireframes UI/UX
* **Wireframes y Layout Responsivo:**
  * Pantalla de publicación vertical con contenedor interactivo de fotografía (proporción 1:1 / 4:3), campos de texto con validación flotante, selector desplegable de condición de la prenda (*Nuevo con etiqueta, Excelente, Buen estado, Usado*) y botón de acción principal de alta visibilidad.
* **Sistema de Diseño Vintage:**
  * Tipografía dual integrada: `Playfair Display` para títulos y acentos retro; `Inter` para legibilidad técnica en formularios y precios.
  * Paleta cromática semántica: Primario Arena Vintage (`#D4A574`), Acento Cuero (`#8B7355`), Oscuro Carbón (`#2C2416`), Fondo Pergamino (`#F5F1ED`), Éxito Salvia (`#7A9B76`) y Error Carmesí (`#C85A54`).

---

#### 6.1.4 Configuración del Entorno Flutter y Conexión Inicial de Cámara
* Configuración de SDK Flutter 3.12+ con compatibilidad Java 17 y Android Gradle Plugin moderno (`desugar_jdk_libs`).
* Declaración formal de permisos en `AndroidManifest.xml` (`CAMERA`, `READ_MEDIA_IMAGES`, `POST_NOTIFICATIONS`).
* Verificación de inicialización de plugins nativos mediante Method Channels en `MainActivity`.

---

#### Checklist de Calificación — Parcial 1 (Docente)
| Criterio Evaluado | Evidencia Solicitada | Ponderación | Cumplimiento |
| :--- | :--- | :---: | :---: |
| **Justificación y Smart Device** | Documento con comparativa técnica de hardware, justificación del modelo C2C y delimitación de alcance. | 15% | `[ ]` Aprobado |
| **Arquitectura de Software** | Estructura de carpetas por features (`presentation`, `domain`, `data`) y configuración de Riverpod. | 25% | `[ ]` Aprobado |
| **Enrutamiento GoRouter** | Navegación funcional con `ShellRoute` (BottomNav) y rutas hijas en pila con Auth Guards. | 25% | `[ ]` Aprobado |
| **Diseño y Wireframes** | Cumplimiento de paleta de colores vintage, tipografía dual y formulario base de publicación. | 15% | `[ ]` Aprobado |
| **Configuración de Hardware Base** | Proyecto Flutter compilando sin errores, permisos configurados en Android y plugin de cámara reconocido. | 20% | `[ ]` Aprobado |

---

### 6.2 Segundo Parcial: Desarrollo Funcional C2C, Cámara y Subida Multipart

#### Objetivo General
Desarrollar la funcionalidad central de publicación C2C de extremo a extremo, integrando el acceso al sensor de hardware óptico, validaciones estrictas de datos, gestión de fallos de ciclo de vida del sistema operativo y consumo de servicios REST multipart en Spring Boot.

---

#### 6.2.1 Acceso al Sensor Óptico, Previsualización y Control de Ciclo de Vida
* **Invocación al Firmware:** Apertura directa de la interfaz nativa de captura mediante `ImagePicker.pickImage(source: ImageSource.camera)`.
* **Procesamiento y Compresión en Cliente:**
  * Restricción por hardware de resolución máxima (`maxWidth: 1200`, `maxHeight: 1200`) y compresión JPEG al 85% para optimizar memoria RAM del dispositivo y acelerar la transferencia celular.
* **Resiliencia ante Asesinato de Actividad (Android Activity Recreation):**
  * Solución implementada: Invocación obligatoria de `ImagePicker.retrieveLostData()` en el ciclo de vida `initState()` de `_PublishScreenState`.
  * Si el sistema operativo destruye la app en segundo plano mientras la cámara está abierta, la fotografía no se pierde y se restaura automáticamente al reabrir la interfaz.

---

#### 6.2.2 Formulario C2C, Saneamiento de Datos y Validación Numérica
* **Saneamiento Defensivo de Entrada:**
  * Eliminación de símbolos monetarios (`$`), espacios en blanco y conversión de comas decimales a puntos antes del parsing.
  * Validación segura con `double.tryParse()` para erradicar crashes por `FormatException` si el usuario ingresa caracteres inesperados.
* **Manejo de Fugas de Memoria:**
  * Implementación estricta de `dispose()` para `_titleController`, `_priceController`, `_brandController` y `_descriptionController`.

---

#### 6.2.3 Subida Multipart y Almacenamiento en Cloudinary
* **Capa Móvil:** Construcción de petición `FormData` con `MultipartFile.fromFile` enviando el binario de la imagen y los campos serializados del producto.
* **Capa Backend (Spring Boot):**
  * Controlador receptor multipart que valida dimensiones, tipo MIME (`image/jpeg`, `image/png`) y peso del archivo.
  * Transferencia asíncrona hacia CDN Cloudinary para almacenamiento persistente y generación de URLs públicas seguras (HTTPS).

---

#### 6.2.4 Feedback Interactivo al Usuario Post-Publicación
* **Escucha Reactiva con `ref.listen`:**
  * Captura de estados de éxito o error en `PublishNotifier`.
* **Modal de Confirmación Inmediata (`AlertDialog`):**
  * Al completar la publicación, se limpia el formulario y la foto, presentando un diálogo visual con dos botones:
    1. **"Ir al Catálogo":** Redirige a `/home` para visualizar la tienda.
    2. **"Ver Prenda":** Navega de inmediato a `/product/:id` para inspeccionar la ficha técnica recién creada.

---

#### Checklist de Calificación — Parcial 2 (Docente)
| Criterio Evaluado | Evidencia Solicitada | Ponderación | Cumplimiento |
| :--- | :--- | :---: | :---: |
| **Captura y Previsualización** | Se activa la cámara nativa, se toma la foto y se renderiza en el contenedor del formulario. | 25% | `[ ]` Aprobado |
| **Recuperación de Ciclo de Vida** | Demostración de `retrieveLostData()` funcionando ante reinicio o pausa de la actividad. | 15% | `[ ]` Aprobado |
| **Validación y Parsing Seguro** | Validación de campos obligatorios, prevención de números negativos y soporte de comas decimales sin crash. | 20% | `[ ]` Aprobado |
| **Integración Multipart & Cloud** | Envío de imagen al backend, subida a Cloudinary e inserción del registro en MySQL Railway. | 25% | `[ ]` Aprobado |
| **Feedback de Publicación** | Diálogo modal interactivo con redirección funcional a Catálogo o Detalle de Prenda. | 15% | `[ ]` Aprobado |

---

### 6.3 Tercer Parcial: Sincronización Omnicanal, Resiliencia y Pruebas E2E

#### Objetivo General
Consolidar la sincronización en tiempo real entre la aplicación móvil y la tienda web Angular, implementar resiliencia contra fallos de red y tiempos de espera de la nube, y ejecutar pruebas de caja negra que garanticen la estabilidad total del sistema.

---

#### 6.3.1 Sincronización Inmediata Omnicanal (Móvil ↔ Web)
* La prenda vintage publicada desde el dispositivo móvil en Flutter se refleja al instante en el catálogo de la tienda web desarrollada en Angular (y viceversa).
* Actualización atómica de inventario en MySQL: al comprarse la última unidad disponible, tanto el frontend web como el catálogo móvil marcan el producto como no disponible de forma coherente.

---

#### 6.3.2 Resiliencia de Red y Manejo de Timeouts (Dio Interceptors)
* **Soporte para Cold Starts de la Nube:**
  * Configuración de timeouts de conexión de 60 segundos en `AppConfig` para tolerar el arranque de servidores gratuitos en la nube (Render).
* **Traductor Centralizado de Excepciones:**
  * Interceptor en `ApiClient` que transforma códigos técnicos incomprensibles (`connectionTimeout`, `receiveTimeout`, `connectionError`) en mensajes amigables en español: *"El servidor está tardando en responder. Inténtalo de nuevo en unos momentos"*.
* **Pull-to-Refresh y Estados de Error:**
  * Integración de `RefreshIndicator` en el catálogo móvil para permitir recargar los productos deslizando el dedo hacia abajo.
  * Pantalla de error con botón de **"Reintentar"** (`ref.invalidate(productsProvider)`).

---

#### 6.3.3 Adaptabilidad Antidesbordamiento (Layout Landscape & Tablets)
* Cálculo dinámico de `crossAxisCount` y `childAspectRatio` en `CatalogScreen` mediante `MediaQuery`:
  * Modo Vertical (Portrait): 2 columnas, aspect ratio `0.65`.
  * Modo Horizontal (Landscape) o Pantallas > 600px: 3 a 4 columnas, aspect ratio `0.72`.
* Erradicación total de advertencias visuales de desbordamiento (`RenderFlex overflowed by X pixels`).

---

#### 6.3.4 Pruebas de Integración End-to-End (E2E) y Auditoría de Caja Negra
* **Prueba de Flujo Completo:** Registro de usuario móvil → Publicación de prenda con cámara → Consulta en Web Angular → Checkout y Pago en Web → Deducción de inventario en BD → Reflejo de orden en móvil.
* **Prueba de Sesión y Expiración:** Forzado de error 401 que activa la limpieza de credenciales en `FlutterSecureStorage` y redirige a la pantalla de Login sin dejar la app en estado zombi.

---

#### Checklist de Calificación — Parcial 3 (Docente)
| Criterio Evaluado | Evidencia Solicitada | Ponderación | Cumplimiento |
| :--- | :--- | :---: | :---: |
| **Sincronización Omnicanal** | Publicar prenda en móvil y verificar su aparición inmediata en la tienda web Angular. | 25% | `[ ]` Aprobado |
| **Resiliencia de Red** | Interceptor de errores funcionando ante pérdida de conexión y botón de reintento operativo. | 20% | `[ ]` Aprobado |
| **Pull-to-Refresh** | Gesto táctil de recarga operativa actualizando el feed de productos vía Riverpod. | 15% | `[ ]` Aprobado |
| **UI Responsiva en Rotación** | Rotar el teléfono a horizontal (Landscape) verificando 0 desbordamientos RenderFlex. | 15% | `[ ]` Aprobado |
| **Prueba E2E y Reporte Final** | Demostración del ciclo completo de compra/venta y entrega de documentación técnica final. | 25% | `[ ]` Aprobado |

---

## 7. Prácticas de Laboratorio Aplicadas al Proyecto

```mermaid
sequenceDiagram
    autonumber
    actor Vendedor as Vendedor (Móvil)
    participant Camara as Firmware Cámara
    participant App as App Flutter
    participant Backend as Spring Boot API
    participant Watch as Smartwatch (Wear OS)

    Note over Vendedor,Camara: PRÁCTICA 1: Firmware
    Vendedor->>App: Clic en "Tomar Foto"
    App->>Camara: Invocación nativa (Method Channel)
    Camara-->>App: Procesamiento digital &amp; Compresión JPEG
    App->>Backend: Envío Multipart (Datos + Imagen)

    Note over Backend,Watch: PRÁCTICA 2: Conexión Externa
    Backend->>App: Push Notification (High Priority / Importance.max)
    App->>Watch: Bluetooth Mirroring (ADB Bridge 5601)
    Watch-->>Vendedor: Alerta háptica &amp; Pantalla encendida
```

---

### PRÁCTICA 1: Firmware — Acceso a Sensores Ópticos y Procesamiento Digital

#### 1. Definición y Recursos Utilizados
* **Tecnología:** Plugins nativos de Flutter (`image_picker`, `camera`) comunicándose mediante canales de plataforma (Method Channels) con las APIs de bajo nivel de Android (`android.hardware.camera2`) e iOS (`AVFoundation`).
* **Objetivo de Hardware:** Establecer un puente directo de comunicación con el firmware del sensor óptico CMOS del teléfono inteligente.

#### 2. Mecanismo de Implementación Técnica
1. **Negociación de Permisos de Sistema:**
   * La app invoca el canal nativo solicitando permisos en tiempo de ejecución al sistema operativo.
2. **Control de Parámetros de Disparo en Firmware:**
   * Se solicita al controlador de la cámara enfocar la escena, compensar exposición y capturar la imagen cruda del sensor.
3. **Conversión y Compresión en Memoria:**
   * El stream de bytes es comprimido internamente a JPEG (calidad 85%, resolución máxima de 1200x1200px) reduciendo archivos de 8MB a menos de 450KB antes de escribirlos en el almacenamiento temporal del sandbox.
4. **Resguardo de Estado:**
   * El archivo resultante se enlaza al estado local del widget (`_imageFile = File(pickedFile.path)`).

#### 3. Protocolo de Demostración para el Docente
1. Abrir la aplicación móvil e iniciar sesión como vendedor.
2. Dirigirse a la pestaña inferior **"Publicar Prenda"**.
3. Presionar el recuadro central que indica **"Tomar Foto"** (ícono de cámara).
4. **Verificación de hardware:** Observar la apertura inmediata de la interfaz de la cámara física/emulador.
5. Tomar la fotografía de prueba y confirmar la toma.
6. **Resultado esperado:** La cámara se cierra y la fotografía tomada aparece montada dentro del formulario de publicación con ajuste `BoxFit.cover`, lista para ser enviada al servidor.

---

### PRÁCTICA 2: Conexión Externa — Sistema de Alertas Wearable mediante Bluetooth/ADB

#### 1. Definición y Recursos Utilizados
* **Tecnología:** `flutter_local_notifications`, `firebase_messaging`, canal de notificación con `Importance.max`, y túnel TCP ADB (`port 5601`) para emulación del enlace Bluetooth físico.
* **Objetivo de Conectividad:** Extender las notificaciones del negocio C2C hacia dispositivos periféricos vestibles (Smartwatches Wear OS / Apple Watch).

#### 2. Mecanismo de Implementación Técnica
1. **Canal de Máxima Prioridad (Android Notification Channel):**
   * Creación del canal `vintagevibe_c2c_high_importance` con:
     * `Importance: Importance.max`
     * `Priority: Priority.max`
     * `Visibility: NotificationVisibility.public`
     * `fullScreenIntent: true`
     * Vibración háptica activa.
2. **Emparejamiento y Puente de Conexión Externa:**
   * En entorno de pruebas con emuladores, se activa el puenteo TCP:
     ```powershell
     adb -s <serial_telefono> forward tcp:5601 tcp:5601
     ```
   * El servicio de notificaciones del teléfono redirige las alertas hacia el emulador de Wear OS emparejado emulando la radio Bluetooth.
3. **Disparo de Evento en Backend (Spring Boot):**
   * Al registrarse la compra de una prenda en `OrderService.checkout()`, se invoca `WearableNotificationService.sendSaleAlertToWearable()`.
   * El backend envía el payload FCM con prioridad `HIGH` y canal `vintagevibe_c2c_high_importance`.

#### 3. Protocolo de Demostración para el Docente
1. **Preparación:** Iniciar el emulador de smartphone y el emulador de Wear OS (verificar emparejamiento con `adb devices` y app Wear OS).
2. **Acceso en App:** En el emulador del smartphone, entrar a la pestaña **"Mi Perfil"** y tocar la opción **"Práctica 2: Probar Alerta Wearable"**.
3. **Paso Clave:** Tocar el botón **"Disparar en 5 seg (Para bloquear teléfono)"** y de inmediato presionar el botón de **Power/Bloqueo** del emulador del smartphone para apagar su pantalla.
   * *Justificación técnica:* Simula que el usuario tiene el teléfono en el bolsillo, forzando al sistema operativo a dirigir la notificación prioritaria al Smartwatch.
4. **Resultado esperado:**
   * A los 5 segundos, la pantalla del **emulador de Wear OS se enciende automáticamente**.
   * Se escucha el sonido de alerta y se despliega la tarjeta de notificación con el texto:
     * **Título:** `¡Prenda Vintage Vendida! 🧥`
     * **Cuerpo:** `Tu artículo 'Chaqueta Denim Vintage 90s' se ha vendido por $850.00 MXN. Prepara el envío.`

---

#### Checklist de Calificación — Prácticas de Laboratorio (Docente)
| Práctica Evaluada | Aspecto a Validar | Ponderación | Estado |
| :--- | :--- | :---: | :---: |
| **Práctica 1: Firmware** | Activación del sensor óptico, toma de fotografía, procesamiento y previsualización en el formulario. | 50% | `[ ]` Aprobado |
| **Práctica 1: Compresión** | Verificación de que la imagen capturada se procesa y comprime en memoria sin sobrecargar la RAM. | `(Incluido)` | `[ ]` Aprobado |
| **Práctica 2: Conexión Externa** | Configuración de canal de máxima importancia (`Importance.max`) y puente de emuladores activo. | 25% | `[ ]` Aprobado |
| **Práctica 2: Wearable Mirroring** | Recepción de la alerta en el Smartwatch (Wear OS), encendido de pantalla y contenido de la venta C2C. | 25% | `[ ]` Aprobado |

---

## 8. Resumen Global de Evaluación del Proyecto

| Bloque Académico | Componente Principal | Porcentaje Total |
| :--- | :--- | :---: |
| **Primer Parcial** | Análisis, Selección de Hardware, Arquitectura Clean y Wireframes | **20%** |
| **Segundo Parcial** | Desarrollo de Formulario C2C, Cámara, Multipart y Cloudinary | **30%** |
| **Tercer Parcial** | Sincronización Web-Móvil, Resiliencia de Red y Pruebas E2E | **20%** |
| **Prácticas de Laboratorio** | Práctica 1 (Firmware/Cámara) + Práctica 2 (Wearables/Bluetooth) | **30%** |
| **TOTAL** | **Calificación Final del Proyecto de Desarrollo Móvil** | **100%** |

