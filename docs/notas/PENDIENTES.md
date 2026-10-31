# Pendientes · Factronics TTO Lab

Backlog vivo. Se actualiza en cada versión; el historial de lo hecho queda en
`docs/notas/`. Prioridad: **P1** rompe o engaña; **P2** función incompleta;
**P3** pulido, accesibilidad o mantenimiento.

## P1 · Antes de una entrega formal

- [ ] **Rotar el token de GitHub** usado para publicar y comprobar que no quedó
      en ningún archivo, log o historial. El token compartido por chat debe
      revocarse.
- [ ] **Revisión técnica externa** del banco por un segundo técnico certificado:
      contrastar P/N, tensiones, firmware y procedimientos contra documentación
      oficial vigente.
- [ ] **Probar el QR con cámara real** en Android/iPhone y varios lectores;
      confirmar que el visor abre en móvil y que el checksum coincide.
- [ ] **Probar el aviso de actualización** publicando una versión mayor temporal
      y confirmando el banner web y el diálogo Android en un dispositivo real.
- [ ] **Revisar las 22 preguntas de ribbons y soportes + las 6 de troubleshooting**
      con un segundo técnico; los P/N y tensiones deben contrastarse con la
      revisión vigente.
- [x] **Permiso de Videojet:** el usuario confirmó el 2026-10-30 que cuenta con
      permiso para usar el material de las fuentes revisadas.
- [ ] **Firma criptográfica del resultado** si se necesita autenticidad formal;
      hoy el QR usa checksum para detectar alteraciones accidentales.
- [ ] **Probar el certificado en un móvil real:** escanear el QR de la tarjeta,
      abrir `verificar/`, descargar el PNG y comprobar el sello y la huella.
- [ ] **Firma de producción** si el APK se distribuirá de forma masiva: crear
      keystore propia, custodiar contraseñas y documentar el proceso. La clave
      actual es de entrenamiento.

## P2 · Funciones incompletas

- [ ] **PDF descargable directo en web:** hoy se usa el diálogo de impresión
      («Guardar como PDF»). Evaluar generar el PDF con una librería local.
- [ ] **Constancia PDF nativa en Android** además del informe de evaluación.
- [x] **Exportación CSV nativa en Android** (web y Android).
- [ ] **Importar progreso con opción reemplazar/combinar** en web y Android.
- [ ] **Tema oscuro real en diálogos Android.**
- [ ] **Orientación/tablet:** la actividad está fija en vertical; evaluar
      landscape y tablets con reflow.
- [ ] **Historial completo de intentos** (la web muestra 6 y Android 4; permitir
      "ver todos" y borrar un intento).
- [ ] **Preguntas con imágenes/diagramas** de componentes y errores.
- [ ] **Más preguntas de CLARiSUITE/CLARiTY** y casos de diagnóstico.

## P3 · Calidad y mantenimiento

- [ ] **CI en GitHub Actions:** ejecutar `tools/verify.py` y `node tools/export_ui.js --check`
      en cada push; publicar Pages solo si pasa.
- [ ] **Pruebas E2E automatizadas** (Playwright) para landing, examen multi,
      cálculo, biblioteca, QR, idioma y PWA.
- [ ] **Pruebas unitarias del motor** extrayendo `gradeQuestion`,
      `matchField`, `pickQuestions` y `buildPool` a un módulo testeable.
- [ ] **Auditoría de accesibilidad** con lector de pantalla real (TalkBack /
      NVDA), contraste y navegación por teclado.
- [ ] **Internacionalizar textos fijos** que aún quedan en Android
      (“DISTRIB. VIDEOJET”, “Bank error”) y revisar traducciones PT.
- [ ] **PWA:** estrategia de actualización visible (“nueva versión disponible”),
      no solo recarga silenciosa.
- [ ] **SEO:** `hreflang` si se separan versiones por idioma; revisar Rich
      Results de FAQ/SoftwareApplication.
- [ ] **Rendimiento:** medir Lighthouse móvil y tamaño del banco (496 KB);
      evaluar carga diferida en la landing.
- [ ] **Licencia y marca:** revisar `NOTICE.md` antes de cualquier uso comercial
      o distribución fuera de Factronics.
- [ ] **Documentación:** añadir capturas actualizadas de landing, generador, QR y
      APK; mantener `QA.md` al día.

## Ideas descartadas por ahora

- Backend/cuentas: el valor del proyecto es offline y sin registro.
- Envío de resultados por correo: se sustituyó por QR/PDF/PNG local.
- Migrar a React Native/Flutter: la app Java nativa funciona y pesa ~190 KB.
- Reemplazar el banco por una API: rompería el uso sin conexión.
