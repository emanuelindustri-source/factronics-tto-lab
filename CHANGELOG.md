# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
El histórico detallado, con auditoría y pruebas, vive en `docs/notas/`.

## [1.9.0] — 2026-11-04

### Añadido

- Escáner QR con cámara o imagen en `verificar/` (BarcodeDetector + jsQR).
- Seis preguntas nuevas de ribbons; banco 372/348.
- Workflow de GitHub Actions para verificar el proyecto.
- CTA de escaneo en la landing.

### Cambiado

- Versión web/PWA/Android a `1.9.0`; `versionCode` 10.
- Service Worker `factronics-tto-1.9.0`; jsQR en caché.
- Assets `?v=190`.

## [1.8.0] — 2026-11-04

### Añadido

- Calculadora integrada en preguntas de cálculo (web y Android).
- Certificado A4 nativo en Android (1240×1754) con sello, firma, QR y SHA-256.
- Diez preguntas nuevas de ribbons; banco 366/342.
- QR más grande en pantalla, informe y certificado.
- Assets versionados `?v=180` y service worker con coincidencia exacta.

### Cambiado

- Versión web/PWA/Android a `1.8.0`; `versionCode` 9.
- Service Worker `factronics-tto-1.8.0`.
- Documentación y notas de 1.8.0; se conserva el histórico anterior.

## [1.7.0] — 2026-10-31

### Añadido

- Página pública `verificar/` con certificado, sello FNV-1a, huella SHA-256 y
  descarga de PNG.
- **Certificado PNG A4** y tarjeta 1080×1350 con sello, firma y QR.
- **Código de referencia con QR** en pantalla, informe PDF y tarjeta.
- Panel de resultados con tarjetas para PDF, tarjeta, certificado y CSV.
- **CSV en Android** y apertura de la verificación desde la app.
- Seis preguntas de troubleshooting de ribbon; banco 356/332.
- Enlaces “Verificar” en la landing y en `resultado/`.

### Cambiado

- El QR nuevo apunta a `verificar/`; `resultado/` se mantiene para QR antiguos.
- Versión web/PWA/Android a `1.7.0`; `versionCode` 8.
- Service Worker `factronics-tto-1.7.0`.
- Textos de privacidad y del pie actualizados; sin envío por correo.

## [1.6.0] — 2026-10-30

### Añadido

- Resultado con **QR escaneable** al finalizar examen o estudio.
- **Tarjeta PNG** con nombre, correo, puntaje, fecha, equipos, código y QR.
- Página `resultado/` que lee el QR y muestra el resultado con verificación de checksum.
- QR también incluido en el **informe PDF** de Android y en el informe web.
- Compartición de PDF y PNG con la hoja del sistema; sin envío de correo ni servidores.
- `version.json` 1.6.0 y aviso de actualización para 1.5.0.

### Cambiado

- Se retiraron los botones de envío por correo; el flujo ahora es QR/PDF/PNG.
- Versión web/PWA/Android a `1.6.0`; `versionCode` 7.
- Service Worker `factronics-tto-1.6.0`.
- APK 1.6.0 con QR nativo y tarjeta PNG.

## [1.5.0] — 2026-10-30

### Añadido

- 22 preguntas nuevas de ribbons y soportes OEM/universales, con fuentes revisadas.
- Banco ampliado a 350 preguntas / 326 enunciados únicos.
- Aviso de actualización web mediante `version.json` y botón **Actualizar**.
- Comprobación de actualización Android cada 12 h y botón **Buscar actualizaciones**, con notas y enlace de descarga.
- `version.json` público con versión, `versionCode`, notas y enlaces.
- Ficha de versión y notas de fuentes en `docs/versiones/` y `docs/notas/`.

### Cambiado

- Versión web/PWA/Android a `1.5.0`; `versionCode` 6.
- Service Worker `factronics-tto-1.5.0`.
- La APK declara INTERNET solo para consultar `version.json`; no envía datos.
- La landing, el generador y la documentación usan los nuevos totales 350/326.

## [1.4.0] — 2026-10-30

### Añadido

- Identificación obligatoria del participante: nombre, apellido y correo.
- Informe A4 de calidad con logo, puntaje, desglose, equipos y detalle de preguntas.
- Envío por correo a `khristyan.hidalgo@factronics.com.ve` y `emanuel.industri@gmail.com`, con destinatarios precargados.
- Informe PDF nativo en Android y compartir con el PDF adjunto.
- Partículas, revelado al hacer scroll, contadores y transiciones suaves.
- Soporte de `prefers-reduced-motion` para desactivar animaciones.
- Identidad del participante en exportación/importación de progreso.
- `docs/versiones/` con ficha legible por versión.

### Cambiado

- Versión web/PWA/Android a `1.4.0`; `versionCode` 5.
- Service Worker `factronics-tto-1.4.0`.
- El botón «Imprimir / PDF» abre el informe diseñado en web.
- La constancia incluye el correo del participante.
- El APK incluye proveedor de archivos para compartir el PDF sin permisos de red.

## [1.3.0] — 2026-10-30

### Añadido

- Cantidad personalizada (5–100) y duración personalizada (0–180 min) en web y Android.
- Paginación “Mostrar más” en la biblioteca web y Android.
- Búsqueda de biblioteca en opciones, respuestas y explicaciones.
- Icono adaptativo Android para Android 8+.
- Enlace “Saltar al contenido”, foco visible y etiquetas ARIA traducidas.
- Guía de instalación PWA para Android/iOS y enlace al SHA-256 del APK.
- `tools/verify.py`, `tools/export_ui.js`, `VERSION` y este changelog.
- Notas históricas en `docs/notas/`.

### Corregido

- En modo Estudio, multi/completar/cálculo revelaban la respuesta al primer clic o carácter. Ahora se comprueba con **Comprobar**.
- El botón **Comprobar** ya no es un elemento muerto: se habilita al responder y actualiza el resultado.
- “Copiar resumen” no mostraba confirmación en resultados.
- El crédito parcial podía cambiar la nota de un examen ya iniciado; ahora se fija al crearlo.
- “Atrás” en resultados de Android cerraba la app; ahora vuelve a configuración.
- Durante el examen Android no había opción de guardar y salir; ahora sí.
- Los cálculos con respuesta `0` se mostraban como “Sin responder” en la revisión web.
- La landing y el README prometían valores personalizados que no existían.
- El tamaño del APK en la landing era incorrecto (~121 KB).
- La constancia se presentaba como “código de verificación” sin verificación en línea; ahora es “código de referencia”.

### Cambiado

- Versión web/PWA/Android a `1.3.0`; `versionCode` 4.
- Service Worker `factronics-tto-1.3.0` con recarga de caché.
- APK reconstruido con hash y tamaño publicados.
- Textos de “cálculos variables” corregidos a cálculos técnicos fijos por variante.

## [1.2.0] — 2026-10-23

### Añadido

- Modos Examen, Estudio y Repaso.
- Progreso local, historial, cuaderno de errores y repaso espaciado.
- Biblioteca de 304 enunciados con búsqueda y filtros.
- Reanudar sesión, PWA offline, constancia imprimible e import/export JSON.
- APK nativa 1.2.0 (`versionCode` 3) con tema oscuro y compartir resultado.

[1.9.0]: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/tag/v1.9.0
[1.8.0]: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/tag/v1.8.0
[1.7.0]: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/tag/v1.7.0
[1.6.0]: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/tag/v1.6.0
[1.5.0]: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/tag/v1.5.0
[1.4.0]: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/tag/v1.4.0
[1.3.0]: https://github.com/emanuelindustri-source/factronics-tto-lab/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/tag/v1.2.0
