# Estado actual · Factronics TTO Lab 1.9.0

**Fecha:** 2026-11-04  
**Estado:** preparado para publicar en GitHub, GitHub Pages y Releases.

## Enlaces

- Landing: https://emanuelindustri-source.github.io/factronics-tto-lab/
- Generador: https://emanuelindustri-source.github.io/factronics-tto-lab/generator/
- Verificación: https://emanuelindustri-source.github.io/factronics-tto-lab/verificar/
- Resultado (QR antiguos): https://emanuelindustri-source.github.io/factronics-tto-lab/resultado/
- Repositorio: https://github.com/emanuelindustri-source/factronics-tto-lab
- Release: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/tag/v1.9.0
- APK: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/latest/download/Factronics-TTO-Lab.apk
- Versión para apps: https://raw.githubusercontent.com/emanuelindustri-source/factronics-tto-lab/main/version.json

## Lo que ya está hecho

- **Escáner QR** en `verificar/`: cámara, carga de imagen o arrastrar/soltar;
  BarcodeDetector con respaldo jsQR. Sin subir archivos a servidores.
- Calculadora integrada en web y Android.
- Certificado QR verificable, tarjeta PNG y certificado A4 (web y Android).
- Código de referencia con QR en pantalla, PDF y tarjeta.
- **372 preguntas / 348 enunciados únicos**; 16 nuevas de ribbons desde 1.7.
- CSV, PDF, tarjeta, verificación pública y avisos de actualización.
- **CI** con GitHub Actions (`tools/verify.py` y `export_ui --check`).
- Partículas, animaciones y movimiento reducido.
- Histórico de versiones en `docs/versiones/` y `docs/notas/`.
- APK 1.9.0, `versionCode 10`, 205,5 KB, SHA-256
  `c04de8c15e60e30eee545081a5fdd1a2887101d6bb16c97d39e4855dd5b92ad2`.

## Lo que se está trabajando / siguiente

1. Probar la cámara en un teléfono físico con buena y poca luz.
2. Medir el rendimiento de jsQR en móviles de gama baja.
3. Revisar las preguntas nuevas con un segundo técnico.
4. Revisar el certificado A4 impreso en otro equipo.

## Lo que queda pendiente

- Firma criptográfica del resultado si se necesita autenticidad formal.
- PDF descargable directo en web sin pasar por el diálogo de impresión.
- Tema oscuro real en diálogos Android.
- Más preguntas de CLARiSUITE/CLARiTY y casos de diagnóstico.
- Pruebas E2E automatizadas además de la verificación estática.

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
