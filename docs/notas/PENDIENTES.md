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
- [ ] **Probar el envío real del informe** desde Gmail/Outlook en un teléfono
      físico con la APK 1.5.0 y confirmar que llega a los dos destinatarios con
      el PDF adjunto.
- [ ] **Probar el aviso de actualización** publicando una versión mayor temporal
      y confirmando el banner web y el diálogo Android en un dispositivo real.
- [ ] **Revisar las 22 preguntas nuevas** de ribbons y soportes con un segundo
      técnico; los P/N y tensiones deben contrastarse con la revisión vigente.
- [ ] **Revisar la confidencialidad de las fuentes de ribbon:** los PDFs de
      entrenamiento revisados están marcados “Company Confidential”. Las 22
      preguntas nuevas son paráfrasis de datos técnicos, pero antes de mantenerlas
      en un repositorio público conviene confirmar que el acuerdo con Videojet
      permite publicar ese contenido.
- [ ] **Firma de producción** si el APK se distribuirá de forma masiva: crear
      keystore propia, custodiar contraseñas y documentar el proceso. La clave
      actual es de entrenamiento.

## P2 · Funciones incompletas

- [ ] **Envío 100 % automático:** hoy se abre la app de correo con todo listo y
      el PDF adjunto en Android. Para enviar sin intervención hace falta un
      backend/Worker o un servicio tipo FormSubmit/EmailJS con activación. No
      se hardcodearon credenciales.
- [ ] **PDF descargable directo en web:** hoy se usa el diálogo de impresión
      («Guardar como PDF»). Evaluar generar el PDF con una librería local.
- [ ] **Constancia PDF nativa en Android** además del informe de evaluación.
- [ ] **Exportación CSV nativa en Android** (la web ya la tiene).
- [ ] **Importar progreso con opción reemplazar/combinar** en web y Android.
- [ ] **Tema oscuro real en diálogos Android.**
- [ ] **Orientación/tablet:** la actividad está fija en vertical; evaluar
      landscape y tablets con reflow.
- [ ] **Historial completo de intentos** (la web muestra 6 y Android 4; permitir
      "ver todos" y borrar un intento).
- [ ] **Preguntas con imágenes/diagramas** de componentes y errores.

## P3 · Calidad y mantenimiento

- [ ] **CI en GitHub Actions:** ejecutar `tools/verify.py` y `node tools/export_ui.js --check`
      en cada push; publicar Pages solo si pasa.
- [ ] **Pruebas E2E automatizadas** (Playwright) para landing, examen multi,
      cálculo, biblioteca, idioma y PWA.
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
- [ ] **Rendimiento:** medir Lighthouse móvil y tamaño del banco; evaluar carga
      diferida de `bank.js` (465 KB) en la landing.
- [ ] **Licencia y marca:** revisar `NOTICE.md` antes de cualquier uso comercial
      o distribución fuera de Factronics.
- [ ] **Documentación:** añadir capturas actualizadas de landing, generador y
      APK; mantener `QA.md` al día.

## Ideas descartadas por ahora

- Backend/cuentas: el valor del proyecto es offline y sin registro.
- Migrar a React Native/Flutter: la app Java nativa funciona y pesa ~158 KB.
- Reemplazar el banco por una API: rompería el uso sin conexión.
