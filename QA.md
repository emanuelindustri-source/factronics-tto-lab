# Verificación funcional

Fecha: 2026-10-23 · Entorno: Windows 11, Python 3.13, JDK 17, Android SDK 34, emulador Pixel 7 API 34.

## Banco

| Comprobación | Resultado |
|---|---|
| Preguntas generadas | 328 |
| Enunciados únicos (todos los modelos) | 304 |
| Cobertura por modelo | 6210: 120 · 6230: 167 · 6320: 122 · 6330: 199 · 6420: 145 · 6530: 200 |
| Tipos | 118 simple · 32 múltiple · 48 completar · 100 cálculo · 12 descripción · 11 corrección · 7 error |
| Idiomas por pregunta | ES / EN / PT |
| Respuestas y rúbricas | Presentes y validadas por el generador |

## Web

- Landing: 6 tarjetas de modelo, cambio ES/EN/PT, tema claro/oscuro, logo Factronics claro/oscuro, metadatos OG, FAQ, PWA y sin errores de consola.
- Generador: parámetros por URL (`models`, `types`, `count`, `minutes`, `lang`).
- Examen de 12 preguntas con los siete tipos y respuestas correctas: **12/12 = 100 %**.
- Examen de 5 preguntas grabado en progreso: 20 %, historial, promedio y cuaderno de errores visibles en el panel.
- Preguntas abiertas: autoevaluación “Completa” × 3 → **100 %**, pendientes 0.
- Selección múltiple parcial: 10 preguntas, una opción correcta por pregunta → **4,08/10 = 41 %** (crédito parcial activo).
- Modos: Estudio con corrección inmediata (opción incorrecta → feedback con respuesta y explicación) y Repaso que genera una sesión con las falladas guardadas.
- Biblioteca: 304 resultados, búsqueda “encoder” → 31 coincidencias y filtro por tipo; respuesta y explicación visibles.
- Constancia: se abre en pestaña nueva con nombre, puntaje, fecha, código de verificación y aviso legal de no certificación Videojet.
- PWA: `service worker` registrado, caché `factronics-tto-1.2.0` con 19 recursos (incluye banco, generador e iconos). Con el servidor local detenido, landing y generador abrieron desde la caché y conservaron su contenido.
- Lighthouse en landing: mejor práctica 100, SEO 100, accesibilidad 100 (contraste de texto secundario corregido a `#556b7e`).
- Cambio de idioma durante el examen y en resultados conserva respuestas y puntaje.
- Banco: 328 registros, 304 enunciados únicos; el pool filtra duplicados por modelo/tipo.
- APK servido desde `download/Factronics-TTO-Lab.apk`: HTTP 200 y SHA-256 verificado.

## Android

- APK: `com.factronics.tto.lab` 1.2.0 (versionCode 3), minSdk 24, targetSdk 34, 137 KB.
- Firma verificada con `apksigner`: esquemas **v2 y v3**.
- Instalación limpia y actualización sobre la misma clave: correctas.
- Modos: Estudio mostró corrección inmediata con respuesta y explicación; Repaso abrió 15 preguntas desde el cuaderno de errores.
- Progreso: tras dos sesiones, panel con 2 intentos, promedio 0 %, 15 errores, racha 1 e historial con “Repasar fallos”.
- Reanudar: app cerrada con examen en curso → tarjeta “Sesión en curso”; “Continuar” restauró la pregunta 1 de 15 con estado guardado.
- Biblioteca: 304 resultados; búsqueda “encoder” → 31 resultados con respuesta y explicación.
- Tema claro/oscuro: botón en cabecera cambia el tema y persiste; se probó en oscuro con contraste legible.
- Cambio ES/EN/PT en la app: correcto; “progreso” usa “dispositivo” (no “navegador”) y las nuevas cadenas de biblioteca/progreso están traducidas.
- Autoevaluación abierta: actualiza el puntaje en sitio y sincroniza el cuaderno de errores.
- “Anterior” se desactiva en la primera pregunta; Fin muestra confirmación si hay preguntas en blanco.
- Exportar abre la hoja de compartir; importar usa `ACTION_OPEN_DOCUMENT` y combina perfiles, intentos y errores.
- SHA-256 del APK final: `915dab2905cfb0ca444400ba0e2c633facb772e9a7589b20ccfee32a634cf474`.
- Sin permisos de red; funciona offline.
- Identidad de la app: Factronics TTO Lab; cabecera con logo Factronics + marca Videojet y aviso de distribuidor.

## Limitaciones conocidas

- Es material de estudio: verificar siempre contra documentación oficial y firmware/P-N del equipo.
- La clave del APK es de entrenamiento (autofirmada), no de producción.
- Si se borra `android/build/debug.keystore`, una reinstalación puede requerir desinstalar la versión previa.
