# Verificación funcional

Fecha: 2026-10-22 · Entorno: Windows 11, Python 3.13, JDK 17, Android SDK 34, emulador Pixel 7 API 34.

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

- Landing: 6 tarjetas de modelo, cambio ES/EN/PT, tema claro/oscuro, metadatos OG, sin errores de consola.
- Generador: parámetros por URL (`models`, `types`, `count`, `minutes`, `lang`).
- Examen de 12 preguntas con los siete tipos y respuestas correctas: **12/12 = 100 %**.
- Preguntas abiertas: autoevaluación “Completa” × 3 → **100 %**, pendientes 0.
- Selección múltiple parcial: 1 opción correcta de 3/4/2 → **2,08/6 = 35 %** (crédito parcial activo).
- Cambio de idioma durante el examen y en resultados conserva respuestas y puntaje.
- Banco: 328 registros, 304 enunciados únicos; el pool filtra duplicados por modelo/tipo.

## Android

- APK: `com.videojet.tto.lab` 1.0.0, minSdk 24, targetSdk 34, ~193 KB.
- Firma verificada con `apksigner`: esquemas **v2 y v3**.
- Instalación limpia y actualización sobre la misma clave: correctas.
- Pantallas probadas: configuración, examen, mapa de preguntas, finalización, resultados, desglose, autoevaluación y revisión.
- Cambio ES/EN/PT en la app: correcto; el texto de sesión usa “dispositivo” (no “navegador”).
- La autoevaluación conserva la posición de desplazamiento y actualiza el puntaje.
- “Anterior” se desactiva en la primera pregunta.
- Sin permisos de red; funciona offline.

## Limitaciones conocidas

- Es material de estudio: verificar siempre contra documentación oficial y firmware/P-N del equipo.
- La clave del APK es de entrenamiento (autofirmada), no de producción.
- Si se borra `android/build/debug.keystore`, una reinstalación puede requerir desinstalar la versión previa.
