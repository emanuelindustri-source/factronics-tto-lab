# Estado actual · Factronics TTO Lab 1.7.0

**Fecha:** 2026-10-31  
**Estado:** preparado para publicar en GitHub, GitHub Pages y Releases.

## Enlaces

- Landing: https://emanuelindustri-source.github.io/factronics-tto-lab/
- Generador: https://emanuelindustri-source.github.io/factronics-tto-lab/generator/
- Verificación: https://emanuelindustri-source.github.io/factronics-tto-lab/verificar/
- Resultado (QR 1.6): https://emanuelindustri-source.github.io/factronics-tto-lab/resultado/
- Repositorio: https://github.com/emanuelindustri-source/factronics-tto-lab
- Release: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/tag/v1.7.0
- APK: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/latest/download/Factronics-TTO-Lab.apk
- Versión para apps: https://raw.githubusercontent.com/emanuelindustri-source/factronics-tto-lab/main/version.json

## Lo que ya está hecho

- Identificación obligatoria: nombre, apellido y correo antes de iniciar.
- **Certificado QR verificable:** `verificar/` comprueba el checksum, muestra el
  certificado y permite descargar PNG o imprimir.
- **Código de referencia con QR** en la pantalla final, el informe PDF y la
  tarjeta.
- **Tarjeta PNG 1080×1350** y **certificado A4 1240×1754** con sello, firma,
  FNV-1a y huella SHA-256.
- **Panel de resultados renovado:** Informe PDF, Tarjeta QR, Certificado PNG,
  CSV y acciones secundarias.
- **CSV en Android** y apertura de la verificación desde la app.
- **356 preguntas / 332 enunciados únicos**; 6 nuevas de troubleshooting de
  ribbon.
- Partículas, animaciones, movimiento reducido y avisos de actualización.
- Histórico de versiones en `docs/versiones/` y `docs/notas/`.
- Verificación automática con `python tools/verify.py` → OK, 7.669 comprobaciones.
- APK 1.7.0, `versionCode 8`, 193,5 KB, SHA-256
  `68e025a5f0b66ac62d50776b301d02d8cf3df99511fb2ea12328e18315fda79a`.

## Lo que se está trabajando / siguiente

1. Compilar el APK 1.7.0 final y actualizar hash/tamaño en la documentación.
2. Probar el escaneo del QR con cámara real en Android/iPhone.
3. Revisar el certificado y la página `verificar/` en móvil.
4. Revisar las preguntas nuevas con un segundo técnico.

## Lo que queda pendiente

- Firma criptográfica del resultado si se necesita autenticidad formal; hoy el
  QR usa checksum para detectar alteraciones accidentales.
- PDF descargable directo en web sin pasar por el diálogo de impresión.
- Constancia PDF nativa en Android además del informe.
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
# http://127.0.0.1:8765/verificar/
```

## Aviso

Proyecto de Factronics Venezuela. El usuario confirmó permiso de Videojet para el
material de las fuentes. La APK usa una clave de entrenamiento, no de producción.
La verificación comprueba integridad, no identidad ni supervisión del examen.
