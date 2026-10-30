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
- [ ] **Firma de producción** si el APK se distribuirá de forma masiva: crear
      keystore propia, custodiar contraseñas y documentar el proceso. La clave
      actual es de entrenamiento.
- [ ] **Aviso de actualización 1.2.0 → 1.3.0:** la firma cambió; verificar en un
      dispositivo real el flujo desinstalar/instalar/importar progreso.

## P2 · Funciones incompletas

- [ ] **Constancia PDF nativa en Android** (hoy solo se comparte texto) y
      exportación CSV nativa. Requiere `PdfDocument` + proveedor de archivos o
      `MediaStore`.
- [ ] **Verificación real del código de constancia:** endpoint o algoritmo
      comprobable; hoy es solo una referencia local.
- [ ] **Importar progreso con opción reemplazar/combinar** en web y Android
      (la clave `import_replace` ya existe, pero no se usa).
- [ ] **Tema oscuro real en diálogos Android:** hoy los `AlertDialog` y spinners
      usan tema claro aunque la app esté en oscuro.
- [ ] **Orientación/tablet:** la actividad está fija en vertical; evaluar
      landscape y tablets con reflow.
- [ ] **Trampa de foco y restauración** en los modales web (biblioteca, avisos).
- [ ] **Cache offline del APK** en la PWA o aviso claro de que la descarga
      requiere red.
- [ ] **Historial completo de intentos** (la web muestra 6 y Android 4; permitir
      "ver todos" y borrar un intento).
- [ ] **Preguntas con imágenes/diagramas** de componentes y errores; hoy todo es
      texto.

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
