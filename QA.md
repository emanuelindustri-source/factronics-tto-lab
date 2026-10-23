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

- Landing: 6 tarjetas de modelo, cambio ES/EN/PT, tema claro/oscuro, logo Factronics claro/oscuro, metadatos OG, sin errores de consola.
- Generador: parámetros por URL (`models`, `types`, `count`, `minutes`, `lang`).
- Examen de 12 preguntas con los siete tipos y respuestas correctas: **12/12 = 100 %**.
- Preguntas abiertas: autoevaluación “Completa” × 3 → **100 %**, pendientes 0.
- Selección múltiple parcial: 10 preguntas, una opción correcta por pregunta → **4,08/10 = 41 %** (crédito parcial activo; ninguna respuesta marcada como totalmente correcta).
- Cambio de idioma durante el examen y en resultados conserva respuestas y puntaje.
- Banco: 328 registros, 304 enunciados únicos; el pool filtra duplicados por modelo/tipo.
- APK servido desde `download/Factronics-TTO-Lab.apk`: HTTP 200, 123.872 bytes, SHA-256 verificado.

## Android

- APK: `com.factronics.tto.lab` 1.1.0, minSdk 24, targetSdk 34, ~121 KB.
- Firma verificada con `apksigner`: esquemas **v2 y v3**.
- Instalación limpia y actualización sobre la misma clave: correctas.
- Pantallas probadas en esta ronda: configuración, examen, mapa de preguntas, finalización, resultados, desglose y autoevaluación. La revisión y el solucionario se validaron en la versión base.
- Cambio ES/EN/PT en la app: correcto; el texto de sesión usa “dispositivo” (no “navegador”).
- La autoevaluación actualiza el puntaje en sitio (prueba: 1 respuesta completa → 5 %, 1/20, pendientes 4).
- “Anterior” se desactiva en la primera pregunta.
- Sin permisos de red; funciona offline.
- Identidad de la app: Factronics TTO Lab; cabecera con logo Factronics + marca Videojet y aviso de distribuidor.

## Limitaciones conocidas

- Es material de estudio: verificar siempre contra documentación oficial y firmware/P-N del equipo.
- La clave del APK es de entrenamiento (autofirmada), no de producción.
- Si se borra `android/build/debug.keystore`, una reinstalación puede requerir desinstalar la versión previa.
