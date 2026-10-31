# Verificación funcional

## v1.5.0 · 2026-10-30

Entorno: Windows 11, Python 3.13, Node.js 24, JDK 17, Android SDK 34/36,
emulador Pixel 7 API 34, navegador Chromium integrado.

### Automática

| Comprobación | Resultado |
|---|---|
| `python tools/verify.py` | **OK**, 7.412 comprobaciones |
| Banco | 350 preguntas · 326 enunciados únicos |
| Preguntas nuevas | 22 de ribbons y soportes, todas en ES/EN/PT |
| i18n | 416 claves × ES/EN/PT, sin faltantes |
| `ui.json` vs `i18n.js` | Idénticos |
| `version.json` | Versión y `versionCode` coinciden con web/Android |
| Enlaces, iconos, service worker | Todos los recursos existen |
| APK | 177,5 KB · `versionCode 6` · SHA-256 `74ec0217ceb62fefbd0032f74f2797c8d3483e1933fc1a7efad23bef8dcbf228` |
| Secretos evidentes | Ninguno |

### Web

- Nuevo aviso de actualización: al publicar `version.json` con una versión
  superior, aparece un banner con “Actualizar”. Probado subiendo temporalmente
  `1.5.1`; el banner se mostró con el enlace de novedades.
- El aviso se consulta al cargar, cada 15 minutos y al volver a la pestaña;
  se puede cerrar por sesión.
- Landing y generador sin errores de consola.
- El pool y la biblioteca muestran 350/326 y las 22 preguntas nuevas.
- `version.json` no se sirve desde la caché del service worker: se consulta a la
  red y se usa la copia cacheada solo si no hay conexión.

### Android

- APK `com.factronics.tto.lab` **1.5.0** (`versionCode 6`), 177,5 KB.
- Barra de identificación, informe PDF y envío por correo se mantienen.
- Botón **Buscar actualizaciones** visible al pie.
- Consulta `version.json` cada 12 horas y muestra un diálogo con las novedades y
  el enlace de descarga cuando `versionCode` es mayor.
- Solo usa `INTERNET` para leer `version.json`; no envía datos.
- Instalación y arranque sin errores; `apksigner` verifica v2/v3.

### Limitaciones conocidas

- El aviso de actualización no instala solo el APK: abre la descarga; el usuario
  confirma la instalación (Android exige esa confirmación).
- El envío de correo se completa desde la app de correo del participante.
- La constancia web se guarda como PDF desde el diálogo de impresión.
- La clave del APK es de entrenamiento, no de producción.

---

## v1.4.0 · 2026-10-30

Entorno: Windows 11, Python 3.13, Node.js 24, JDK 17, Android SDK 34/36,
emulador Pixel 7 API 34, navegador Chromium integrado.

### Automática

| Comprobación | Resultado |
|---|---|
| `python tools/verify.py` | **OK**, 6.864 comprobaciones |
| Banco | 328 preguntas · 304 enunciados únicos |
| i18n | 408 claves × ES/EN/PT, sin faltantes |
| `ui.json` vs `i18n.js` | Idénticos (`node tools/export_ui.js --check`) |
| Enlaces, iconos, service worker | Todos los recursos existen |
| Versiones | `VERSION`, `sw.js`, AndroidManifest y release en 1.4.0 |
| APK | 169,5 KB · `versionCode 5` · SHA-256 `410f2464f18b597cc7752589e5fb92f2d2cb27af451c83a4265bd7e9f2044b1f` |
| Secretos evidentes | Ninguno en el árbol publicado |

### Web

- Identificación: nombre, apellido y correo obligatorios; sin datos o con correo
  inválido no inicia el examen.
- Los datos aparecen en resultados, constancia e informe.
- Informe A4 generado en pestaña nueva con logo, puntaje, desglose, equipos y
  detalle de preguntas; botón **Descargar PDF** y enlace de correo con los dos
  destinatarios precargados.
- Partículas, revelado al hacer scroll y contadores; sin errores de consola.
- `prefers-reduced-motion` desactiva partículas y animaciones.
- Lighthouse: accesibilidad 100, buenas prácticas 100, SEO 100.

### Android

- APK `com.factronics.tto.lab` **1.4.0** (`versionCode 5`), minSdk 24,
  targetSdk 34, 169,5 KB.
- `apksigner verify`: esquemas **v2 y v3** correctos; sin permiso de red.
- Identificación: campos nombre/apellido/correo, persistencia y validación.
- Informe PDF generado en caché, 2 páginas, compartido mediante el proveedor
  `ReportProvider`; la hoja de compartir muestra el archivo PDF.
- El PDF incluye logo, participante, correo, puntaje, métricas, desglose y
  detalle de preguntas; se corrigió el solapamiento de la columna de respuesta.
- Botón **Enviar informe por correo** con destinatarios precargados.
- Transiciones suaves entre configuración, examen y resultados.
- Instalación limpia y actualización sobre la misma clave de entrenamiento.

### Limitaciones conocidas

- El envío se completa desde la app de correo del participante; no hay envío
  silencioso sin backend.
- La constancia web se guarda como PDF desde el diálogo de impresión.
- La clave del APK es de entrenamiento, no de producción.
- Los diálogos Android siguen usando tema claro aunque la app esté en oscuro.

---

## v1.3.0 · 2026-10-30

Entorno: Windows 11, Python 3.13, Node.js 24, JDK 17, Android SDK 34/36,
emulador Pixel 7 API 34, navegador Chromium integrado.

### Automática

| Comprobación | Resultado |
|---|---|
| `python tools/verify.py` | **OK**, 6.861 comprobaciones |
| Banco | 328 preguntas · 304 enunciados únicos |
| Paridad web/Android | `bank.js` = `bank.json` |
| i18n | 358 claves × ES/EN/PT, sin faltantes |
| `ui.json` vs `i18n.js` | Idénticos (`node tools/export_ui.js --check`) |
| Enlaces, iconos, service worker | Todos los recursos existen |
| Versiones | `VERSION`, `sw.js`, AndroidManifest y release en 1.3.0 |
| APK | 157,5 KB · `versionCode 4` · SHA-256 `f953d4d571ff25fc8e2a2cdc8d757bbf66da444e3046658a7efc9a08356970f5` |
| Secretos evidentes | Ninguno en el árbol publicado |

### Web

- Landing: 6 tarjetas, resumen “328 variantes · 304 enunciados únicos”, enlace SHA-256, guía de instalación PWA y sin errores de consola. Lighthouse: accesibilidad 100, buenas prácticas 100, SEO 100.
- Generador: Lighthouse accesibilidad 100, buenas prácticas 100, SEO 100.
- ES/EN/PT: textos, `aria-label`, `aria-pressed` y resumen del banco cambian
  correctamente; el tema claro/oscuro actualiza su etiqueta accesible.
- Generador: cantidad personalizada 37 y duración 45 guardadas en
  `tto.config.v1`; el resumen y el enlace compartido las reflejan
  (`count=37&minutes=45&lang=es`).
- Estudio + selección múltiple: tras el primer clic **no** aparece feedback;
  aparece el botón **Comprobar** habilitado. Al pulsarlo se muestra el
  resultado y la explicación; al cambiar una opción el feedback desaparece.
- Estudio + cálculo: el botón empieza deshabilitado, se habilita al escribir,
  no revela nada antes de **Comprobar** y el feedback se retira al editar.
- Biblioteca: 304 resultados, 60 visibles, “Mostrar más (244)” → 120 visibles.
- Constancia: código `REF-…`, rótulo “Código de referencia” y aviso de que no
  se verifica en línea.
- Copiar resumen: modal de confirmación visible en resultados.
- Enlace directo `?minutes=0` interpretado como “Sin límite”.
- Guardado: `beforeunload`/`pagehide` escriben el examen de forma síncrona.

### Android

- APK `com.factronics.tto.lab` **1.3.0** (`versionCode 4`), minSdk 24,
  targetSdk 34, 157,5 KB.
- `apksigner verify`: esquemas **v2 y v3** correctos.
- Instalación limpia en emulador Pixel 7 / API 34. La actualización desde 1.2.0
  requiere desinstalar por cambio de clave de entrenamiento.
- Icono adaptativo presente en `mipmap-anydpi-v26`.
- Configuración: cantidad personalizada 37 aplicada; diálogo con
  **Cancelar/OK**; versión visible al pie.
- Estudio + selección múltiple: responder una opción no revela la respuesta;
  **Comprobar** muestra “Parcial”, respuesta correcta y explicación.
- Chips de modelo en desplazamiento horizontal; ya no se comprimen en vertical
  con fuente grande.
- Biblioteca: 304 resultados y **Mostrar más (264)**; al ampliar se cargan más.
- Atrás durante el examen: **Finalizar**, **Seguir respondiendo** o
  **Guardar y salir**. Guardar y salir muestra la tarjeta de sesión en curso;
  **Continuar sesión** restaura la pregunta, la respuesta y el feedback.
- Atrás desde resultados vuelve a la configuración, no cierra la app.
- Cambio ES/EN/PT y tema oscuro/claro conservan el estado.

### Limitaciones conocidas

- Material de estudio: verificar siempre contra documentación oficial y
  firmware/P-N del equipo.
- La clave del APK es de entrenamiento (autofirmada), no de producción.
- La constancia es un documento de práctica; el código es una referencia local.
- El APK no incluye todavía constancia PDF ni exportación CSV nativa.
- Los diálogos de Android usan tema claro aunque la app esté en oscuro.

---

## Histórico · v1.2.0 · 2026-10-23

Entorno: Windows 11, Python 3.13, JDK 17, Android SDK 34, emulador Pixel 7 API 34.

### Banco

| Comprobación | Resultado |
|---|---|
| Preguntas generadas | 328 |
| Enunciados únicos (todos los modelos) | 304 |
| Cobertura por modelo | 6210: 120 · 6230: 167 · 6320: 122 · 6330: 199 · 6420: 145 · 6530: 200 |
| Tipos | 118 simple · 32 múltiple · 48 completar · 100 cálculo · 12 descripción · 11 corrección · 7 error |
| Idiomas por pregunta | ES / EN / PT |
| Respuestas y rúbricas | Presentes y validadas por el generador |

### Web

- Landing: 6 tarjetas de modelo, cambio ES/EN/PT, tema claro/oscuro, logo Factronics claro/oscuro, metadatos OG, FAQ, PWA y sin errores de consola.
- Generador: parámetros por URL (`models`, `types`, `count`, `minutes`, `lang`).
- Examen de 12 preguntas con los siete tipos y respuestas correctas: **12/12 = 100 %**.
- Examen de 5 preguntas grabado en progreso: 20 %, historial, promedio y cuaderno de errores visibles en el panel.
- Preguntas abiertas: autoevaluación “Completa” × 3 → **100 %**, pendientes 0.
- Selección múltiple parcial: 10 preguntas, una opción correcta por pregunta → **4,08/10 = 41 %** (crédito parcial activo).
- Modos: Estudio con corrección inmediata y Repaso que genera una sesión con las falladas guardadas.
- Biblioteca: 304 resultados, búsqueda “encoder” → 31 coincidencias y filtro por tipo; respuesta y explicación visibles.
- Constancia: se abre en pestaña nueva con nombre, puntaje, fecha, código y aviso legal.
- PWA: service worker registrado, caché `factronics-tto-1.2.0` con 19 recursos.
- Lighthouse en landing: mejor práctica 100, SEO 100, accesibilidad 100.
- Cambio de idioma durante el examen y en resultados conserva respuestas y puntaje.
- APK servido desde `download/Factronics-TTO-Lab.apk`: HTTP 200 y SHA-256 verificado.

### Android

- APK: `com.factronics.tto.lab` 1.2.0 (versionCode 3), minSdk 24, targetSdk 34, 137 KB.
- Firma verificada con `apksigner`: esquemas **v2 y v3**.
- Instalación limpia y actualización sobre la misma clave: correctas.
- Modos: Estudio mostró corrección inmediata; Repaso abrió 15 preguntas desde el cuaderno de errores.
- Progreso: 2 intentos, promedio 0 %, 15 errores, racha 1 e historial con “Repasar fallos”.
- Reanudar: app cerrada con examen en curso → tarjeta “Sesión en curso”; “Continuar” restauró la pregunta 1 de 15.
- Biblioteca: 304 resultados; búsqueda “encoder” → 31 resultados con respuesta y explicación.
- Tema claro/oscuro, ES/EN/PT y autoevaluación abierta: correctos.
- Exportar/importar: hoja de compartir y `ACTION_OPEN_DOCUMENT`.
- SHA-256 del APK 1.2.0: `915dab2905cfb0ca444400ba0e2c633facb772e9a7589b20ccfee32a634cf474`.
- Sin permisos de red; funciona offline.

### Limitaciones conocidas (1.2.0)

- Es material de estudio: verificar siempre contra documentación oficial y firmware/P-N del equipo.
- La clave del APK es de entrenamiento (autofirmada), no de producción.
- Si se borra `android/build/debug.keystore`, una reinstalación puede requerir desinstalar la versión previa.
