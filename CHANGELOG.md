# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
El histórico detallado, con auditoría y pruebas, vive en `docs/notas/`.

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

[1.3.0]: https://github.com/emanuelindustri-source/factronics-tto-lab/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/tag/v1.2.0
