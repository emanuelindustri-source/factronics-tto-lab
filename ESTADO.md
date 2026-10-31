# Estado actual · Factronics TTO Lab 1.6.0

**Fecha:** 2026-10-30  
**Estado:** publicado en GitHub, GitHub Pages y Releases.

## Enlaces

- Landing: https://emanuelindustri-source.github.io/factronics-tto-lab/
- Generador: https://emanuelindustri-source.github.io/factronics-tto-lab/generator/
- Resultado QR: https://emanuelindustri-source.github.io/factronics-tto-lab/resultado/
- Repositorio: https://github.com/emanuelindustri-source/factronics-tto-lab
- Release: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/tag/v1.6.0
- APK: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/latest/download/Factronics-TTO-Lab.apk
- Versión para apps: https://raw.githubusercontent.com/emanuelindustri-source/factronics-tto-lab/main/version.json

## Lo que ya está hecho

- Identificación obligatoria: nombre, apellido y correo antes de iniciar.
- **Resultado con QR**: tarjeta PNG y página `resultado/` para escanear.
- **Informe A4** con logo, datos del técnico, puntaje, desglose, detalle y QR.
- Compartición de PDF y PNG con la hoja del sistema; sin envío por correo.
- 350 preguntas / 326 enunciados únicos; 22 preguntas nuevas de ribbons y soportes.
- Partículas, animaciones, contadores y soporte de movimiento reducido.
- Aviso de actualización web y Android mediante `version.json`.
- Histórico de versiones en `docs/versiones/` y `docs/notas/`.
- Verificación automática: `python tools/verify.py` → OK, 7.427 comprobaciones.
- APK 1.6.0, `versionCode 7`, 189,5 KB, SHA-256
  `d3388d928b1104904806af97f419489cb6bc491e57139adedaa083b42dd864d0`.

## Lo que se está trabajando / siguiente

1. Probar el escaneo del QR con cámara real (Android/iPhone y varios lectores).
2. Revisar el visor `resultado/` en móvil y accesibilidad.
3. Revisar los P/N y tensiones nuevos con un segundo técnico.
4. Probar el aviso de actualización publicando una versión mayor temporal.

## Lo que queda pendiente

- Firma criptográfica del resultado si se necesita autenticidad formal; hoy el QR
  usa checksum para detectar alteraciones accidentales.
- PDF descargable directo en web sin pasar por el diálogo de impresión.
- Constancia PDF y CSV nativos en Android.
- Tema oscuro real en diálogos Android.
- Más preguntas de CLARiSUITE/CLARiTY y casos de diagnóstico.
- CI con GitHub Actions y pruebas E2E.

El detalle completo está en `docs/notas/PENDIENTES.md`.

## Cómo probar rápido

```powershell
python tools/verify.py
python tools/build_bank.py
python android/build.py
```

Web local:

```powershell
python -m http.server 8765
# http://127.0.0.1:8765/
```

## Aviso

Proyecto de Factronics Venezuela. El usuario confirmó permiso de Videojet para el
material de las fuentes. La APK usa una clave de entrenamiento, no de producción.
