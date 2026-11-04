# Estado actual · Factronics TTO Lab 1.8.0

**Fecha:** 2026-11-04  
**Estado:** preparado para publicar en GitHub, GitHub Pages y Releases.

## Enlaces

- Landing: https://emanuelindustri-source.github.io/factronics-tto-lab/
- Generador: https://emanuelindustri-source.github.io/factronics-tto-lab/generator/
- Verificación: https://emanuelindustri-source.github.io/factronics-tto-lab/verificar/
- Resultado (QR antiguos): https://emanuelindustri-source.github.io/factronics-tto-lab/resultado/
- Repositorio: https://github.com/emanuelindustri-source/factronics-tto-lab
- Release: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/tag/v1.8.0
- APK: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/latest/download/Factronics-TTO-Lab.apk
- Versión para apps: https://raw.githubusercontent.com/emanuelindustri-source/factronics-tto-lab/main/version.json

## Lo que ya está hecho

- Identificación obligatoria: nombre, apellido y correo antes de iniciar.
- **Calculadora integrada** en preguntas de cálculo, web y Android; inserta el
  resultado en el campo activo.
- **Certificado QR verificable:** `verificar/` comprueba el checksum, muestra el
  certificado y permite descargar PNG o imprimir.
- **Código de referencia con QR** en la pantalla final, el informe PDF y la
  tarjeta.
- **Tarjeta PNG 1080×1350** y **certificado A4 1240×1754** con sello, firma,
  FNV-1a y huella SHA-256; certificado A4 también en Android.
- **Panel de resultados:** Informe PDF, Tarjeta QR, Certificado PNG, CSV y
  acciones secundarias.
- **CSV en Android** y apertura de la verificación desde la app.
- **366 preguntas / 342 enunciados únicos**; 10 nuevas de ribbons (PET,
  cabezales, vida útil, grados APR/AXR, bobinado, backcoat y diagnóstico).
- Partículas, animaciones, movimiento reducido y avisos de actualización.
- Histórico de versiones en `docs/versiones/` y `docs/notas/`.
- Verificación automática con `python tools/verify.py`.
- APK 1.8.0, `versionCode 9`, 201,5 KB, SHA-256
  `b41f0326042317a3284808dd8f88e74513436808a00d26c4b4724b8dc7b04f79`.

## Lo que se está trabajando / siguiente

1. Probar el escaneo del QR con cámara real en el dispositivo físico.
2. Revisar el certificado A4 de Android en otro equipo/impresión.
3. Revisar las preguntas nuevas con un segundo técnico.
4. Medir el rendimiento de la calculadora en móviles de gama baja.

## Lo que queda pendiente

- Firma criptográfica del resultado si se necesita autenticidad formal; hoy el
  QR usa checksum para detectar alteraciones accidentales.
- PDF descargable directo en web sin pasar por el diálogo de impresión.
- Tema oscuro real en diálogos Android.
- Más preguntas de CLARiSUITE/CLARiTY y casos de diagnóstico.
- CI con GitHub Actions y pruebas E2E.

El detalle completo está en `docs/notas/PENDIENTES.md`.

## Cómo probar rápido

```powershell
python tools/verify.py
node tools/export_ui.js --check
python tools/build_bank.py
python android/build.py
```

Web local:

```powershell
python -m http.server 8765
# http://127.0.0.1:8765/
# http://127.0.0.1:8765/verificar/
```

## Aviso

Proyecto de Factronics Venezuela. El usuario confirmó permiso de Videojet para el
material de las fuentes. La APK usa una clave de entrenamiento, no de producción.
La verificación comprueba integridad, no identidad ni supervisión del examen.
