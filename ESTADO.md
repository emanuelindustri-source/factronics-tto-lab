# Estado actual · Factronics TTO Lab 1.5.0

**Fecha:** 2026-10-30  
**Estado:** publicado en GitHub, GitHub Pages y Releases.

## Enlaces

- Landing: https://emanuelindustri-source.github.io/factronics-tto-lab/
- Generador: https://emanuelindustri-source.github.io/factronics-tto-lab/generator/
- Repositorio: https://github.com/emanuelindustri-source/factronics-tto-lab
- Release: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/tag/v1.5.0
- APK: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/latest/download/Factronics-TTO-Lab.apk
- Versión para apps: https://raw.githubusercontent.com/emanuelindustri-source/factronics-tto-lab/main/version.json

## Lo que ya está hecho

- Identificación obligatoria: nombre, apellido y correo antes de iniciar.
- Informe A4 con logo, datos del participante, puntaje, desglose y detalle.
- Envío por correo a los dos destinatarios, con PDF adjunto en Android.
- Web: PDF desde el diálogo de impresión y correo con destinatarios precargados.
- 350 preguntas / 326 enunciados únicos; 22 preguntas nuevas de ribbons y soportes.
- Partículas, animaciones, contadores y soporte de movimiento reducido.
- Aviso de actualización web y Android mediante `version.json`.
- Histórico de versiones en `docs/versiones/` y `docs/notas/`.
- Verificación automática: `python tools/verify.py` → OK, 7.412 comprobaciones.
- APK 1.5.0, `versionCode 6`, 177,5 KB, SHA-256
  `74ec0217ceb62fefbd0032f74f2797c8d3483e1933fc1a7efad23bef8dcbf228`.

## Lo que se está trabajando / siguiente

1. Probar el envío real desde Gmail/Outlook en un teléfono físico.
2. Probar el aviso de actualización publicando una versión mayor temporal.
3. Revisar la confidencialidad de los PDFs de ribbon marcados “Company Confidential”.
4. Revisar los P/N y tensiones nuevos con un segundo técnico.

## Lo que queda pendiente

- Envío **100 % automático** sin que el participante pulse Enviar: requiere un
  backend/servicio de correo (FormSubmit, EmailJS o Worker con Resend). La versión
  actual abre el correo con todo listo y el PDF adjunto en Android.
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

Proyecto de Factronics Venezuela. Videojet Technologies no solicitó, patrocinó ni
autorizó este proyecto. La APK usa una clave de entrenamiento, no de producción.
