# Factronics TTO Lab

Entrenamiento técnico para impresoras **Videojet TTO** (Thermal Transfer Overprint): generador de evaluaciones para navegador y aplicación Android nativa, en español, inglés y portugués.

**Factronics TTO Lab** es un proyecto de **Factronics C.A. (Factronics Venezuela)**, distribuidor oficial de Videojet en Venezuela. Fue desarrollado por **Khristyan Hidalgo**, técnico de campo certificado de Factronics.

> **Alcance y autoría:** este material pertenece a Factronics Venezuela y a Khristyan Hidalgo. **Videojet Technologies no solicitó, patrocinó ni autorizó este proyecto.** “Videojet” y “DataFlex” son marcas de Videojet Technologies y se usan aquí para identificar los equipos estudiados. Consulta [NOTICE.md](NOTICE.md) antes de reutilizar el contenido.

## Enlaces

- **Sitio / landing:** https://emanuelindustri-source.github.io/factronics-tto-lab/
- **Generador web:** https://emanuelindustri-source.github.io/factronics-tto-lab/generator/
- **APK Android:** https://github.com/emanuelindustri-source/factronics-tto-lab/releases/latest/download/Factronics-TTO-Lab.apk
- **Código fuente:** https://github.com/emanuelindustri-source/factronics-tto-lab

## Qué incluye

| Componente | Estado |
|---|---|
| Landing page estática (GitHub Pages) | Sí |
| Generador de exámenes offline | Sí |
| PWA instalable con service worker offline | Sí |
| Progreso, historial, cuaderno de errores y repaso espaciado | Sí |
| Biblioteca de preguntas con búsqueda y filtros | Sí |
| Constancia de aprovechamiento imprimible | Sí |
| Identificación del participante (nombre, apellido, correo) | Sí |
| Informe A4 con logo, puntaje, desglose y detalle | Sí |
| Envío del informe por correo con destinatarios precargados | Sí |
| Partículas y animaciones modernas (con movimiento reducido) | Sí |
| Aplicación Android nativa (Java, sin WebView) | Sí |
| APK firmado y descargable | Sí |
| Español / English / Português | Sí |
| Banco técnico compartido web + Android | Sí |

### Modelos cubiertos

| Modelo | Ancho | Ribbon | Rendimiento | Interfaz |
|---|---:|---:|---:|---|
| Videojet 6210 | 32 mm | 600 m | 125 ppm | RS232 |
| Videojet 6230 | 32 mm | 700 m | 150 ppm | Ethernet |
| DataFlex 6320 | 32/53 mm | 1200 m | 250 ppm | Ethernet |
| DataFlex 6330 | 53 mm | 1200 m | 250 ppm | Ethernet |
| DataFlex 6420 | 53/107 mm | 1200 m | 400 ppm | Ethernet |
| DataFlex 6530 | 53/107 mm | 1200 m | 700 ppm | Ethernet |

### Siete tipos de pregunta

1. Selección simple.
2. Selección múltiple con crédito parcial configurable.
3. Completar la frase (escenarios de servicio, sin opciones).
4. Descripción de componentes (abierta, con rúbrica).
5. Cálculos técnicos con valores variables.
6. Significado de errores / primera acción.
7. Corrección de fallas (caso abierto, con rúbrica).

El banco generado contiene **328 preguntas y variantes**; al filtrar por modelo y tipo se eliminan duplicados de enunciado, por lo que el pool visible para “todos los modelos” es de **304 enunciados únicos**. Cada sesión prioriza preguntas no vistas y equilibra los tipos seleccionados.

## Generador web

1. Abre `generator/` o el enlace de GitHub Pages.
2. Marca modelos y tipos.
3. Elige cantidad (10–50, o valor personalizado) y duración (10–90 min o sin límite).
4. Genera, responde y revisa el solucionario.

Características:

- 100 % offline; no hay backend ni registro.
- PWA instalable (`manifest.webmanifest` + `sw.js`): abre sin conexión desde el primer uso.
- Modos **Examen**, **Estudio** (corrección al pulsar Comprobar) y **Repaso** (solo falladas o pendientes).
- Cantidad personalizada de 5 a 100 preguntas y duración de 0 a 180 minutos, además de los valores rápidos.
- Guarda configuración, examen en curso, preguntas vistas y progreso en `localStorage` (`tto.progress.v2`).
- Historial de intentos, promedio, mejor nota, racha, cuaderno de errores y repaso espaciado con vencimientos.
- Biblioteca de preguntas con búsqueda por texto, opciones, tipo y modelo, con paginación completa.
- Constancia de aprovechamiento imprimible con código de referencia y aviso legal.
- **Identificación del participante:** nombre, apellido y correo obligatorios antes de iniciar.
- **Informe para el jefe:** documento A4 con logo, puntaje, desglose por tipo y detalle de preguntas.
- **Envío por correo:** abre la app de correo con los destinatarios precargados; en Android adjunta el PDF.
- **Partículas y animaciones:** movimiento suave, contadores y revelado al hacer scroll, con respeto a `prefers-reduced-motion`.
- Exportar/importar progreso en JSON entre perfiles y dispositivos.
- Cronómetro, mapa de preguntas, marcado para revisar y navegación.
- Resultados con desglose por tipo, autoevaluación de preguntas abiertas, CSV e impresión/PDF.
- Enlace compartible con la configuración (`?models=6530&types=single,multi&count=20&minutes=30`).
- Interfaz adaptable a móvil, tema claro/oscuro y estilos de impresión.

## Aplicación Android

- Java nativo, sin AndroidX, sin WebView y sin dependencias externas.
- Pantallas de configuración, examen y resultados construidas programáticamente.
- Identificación obligatoria: nombre, apellido y correo.
- Modos **Examen**, **Estudio** y **Repaso**, igual que la versión web.
- Estudio con botón **Comprobar** en selección múltiple, completar y cálculo.
- Progreso local: historial, promedio, mejor nota, racha, cuaderno de errores y repaso espaciado.
- Guardado automático y **reanudar sesión** tras cerrar o reiniciar la app; durante el examen se puede **guardar y salir**.
- Biblioteca de preguntas con búsqueda por texto, tipo y modelo, y **Mostrar más**.
- Cantidad y duración personalizadas, además de los valores rápidos.
- **Informe PDF A4** con logo, puntaje, desglose y detalle; se comparte con los destinatarios precargados y el PDF adjunto.
- Tema claro/oscuro con detección del tema del sistema y botón de cambio.
- Icono adaptativo para Android 8+.
- Compartir resultado, exportar progreso por hoja de compartir e importar un JSON con `ACTION_OPEN_DOCUMENT`.
- Cronómetro, mapa de preguntas, navegación, marcado para revisar y autoevaluación.
- Banco local en `assets/bank.json` y textos en `assets/ui.json`.
- Funciona sin conexión.
- `minSdk 24` (Android 7.0), `targetSdk 34`, versión `1.4.0`.

### Instalar el APK

Descarga `Factronics-TTO-Lab.apk` desde [Releases](https://github.com/emanuelindustri-source/factronics-tto-lab/releases/latest/download/Factronics-TTO-Lab.apk) o desde `download/Factronics-TTO-Lab.apk`.

Android puede pedir permiso para instalar aplicaciones de origen desconocido. El APK está firmado con una clave de entrenamiento autofirmada; no se distribuye por Play Store.

### Compilar el APK

Requisitos: JDK 17, Android SDK con `platforms/android-34` y `build-tools/34.0.0`.

```powershell
# Desde la raíz del repositorio
python android/build.py
```

El script usa `aapt2`, `javac`, `d8`, `zipalign` y `apksigner` directamente; no necesita Gradle. Genera:

- `android/build/Factronics-TTO-Lab.apk`
- `download/Factronics-TTO-Lab.apk` (copia para el sitio)

Variables opcionales: `ANDROID_HOME` / `ANDROID_SDK_ROOT` y `JAVA_HOME`.

## Novedades 1.4

- **Identificación del participante:** nombre, apellido y correo obligatorios antes de iniciar; aparecen en resultados, constancia e informe.
- **Informe A4 de calidad:** logo, puntaje, resultado, desglose por tipo, equipos, detalle de preguntas y código de referencia. En web se guarda como PDF desde el diálogo de impresión; en Android se genera un PDF real.
- **Envío por correo:** el botón abre la app de correo con `khristyan.hidalgo@factronics.com.ve` y `emanuel.industri@gmail.com` precargados; en Android el PDF va adjunto.
- **Partículas y animaciones:** canvas de partículas, revelado al hacer scroll, contadores y transiciones suaves; se desactivan con `prefers-reduced-motion`.
- **APK 1.4.0:** identificación, informe PDF, transiciones de pantalla, icono adaptativo y todo lo de 1.3.
- **Progreso enriquecido:** la identidad viaja en el JSON de exportación/importación de web y Android.

La base de 1.3 (comprobación explícita, cantidad/duración personalizadas, biblioteca paginada, accesibilidad y verificación automática) se mantiene.

> **Envío automático:** el proyecto es estático y no guarda credenciales. El correo se abre con todo preparado y el PDF adjunto en Android; el participante pulsa Enviar. Un envío totalmente automático requiere un backend o servicio de correo, documentado en `docs/notas/PENDIENTES.md`.

## Banco de preguntas

```powershell
python tools/build_bank.py
```

Entradas:

- `data/models.json`: fichas técnicas de los seis equipos.
- `data/legacy-raw.json`: 100 preguntas originales.
- Ajustes y generadores dentro de `tools/build_bank.py`.

Salidas:

- `assets/js/bank.js` (`window.TTO_BANK`) para la web.
- `data/bank-preview.json` para inspección.
- `android/app/src/main/assets/bank.json` para Android.

Los textos de interfaz viven en `assets/js/i18n.js`; `android/app/src/main/assets/ui.json` se exporta con `node tools/export_ui.js` para mantener paridad.

## Estructura

```text
.
├── index.html                  Landing
├── generator/index.html        Generador web
├── assets/
│   ├── css/site.css
│   ├── js/bank.js              Banco generado
│   ├── js/i18n.js              ES / EN / PT
│   ├── js/landing.js
│   ├── js/motion.js             Partículas y animaciones
│   └── js/generator.js
├── data/                       Fuentes y banco legible
├── docs/notas/                 Histórico de versiones (no se borra)
├── docs/versiones/             Ficha legible de cada versión
├── tools/build_bank.py         Generador del banco
├── tools/export_ui.js          Exporta i18n.js → ui.json
├── tools/verify.py             Verificación automática
├── tools/make_assets.py        OG, favicon e iconos de la app
├── tools/publish_github.py     Publicación por API
├── android/                    App nativa + build.py
├── download/Factronics-TTO-Lab.apk
├── VERSION                     Versión única (1.4.0)
└── CHANGELOG.md
```

## Ejecutar en local

El sitio usa rutas relativas, pero para probar `bank.js` y el generador con `fetch`/assets se recomienda un servidor estático:

```powershell
python -m http.server 8765
# http://127.0.0.1:8765/
```

También se puede abrir `index.html` directamente; el generador no necesita red.

## Verificación rápida

```powershell
python tools/verify.py
```

Comprueba, sin dependencias externas:

- 328 preguntas, 304 enunciados únicos y paridad entre web y Android.
- Textos ES/EN/PT completos y claves `data-i18n` usadas en el HTML.
- Enlaces y recursos locales, iconos del manifiesto y lista del service worker.
- Coherencia de versión entre `VERSION`, `sw.js`, `AndroidManifest.xml` y release.
- SHA-256 del APK contra `download/Factronics-TTO-Lab.apk.sha256`.
- Ausencia de tokens o credenciales evidentes en el árbol publicado.

Las pruebas funcionales y de navegador se registran en [QA.md](QA.md) y en
[docs/notas/](docs/notas/).

## Seguridad y privacidad

- No hay tokens, credenciales ni telemetría en el repositorio.
- El APK no solicita permisos de red.
- Los datos de sesión se guardan localmente (navegador o `SharedPreferences`).
- Para publicar cambios, usa `tools/publish_github.py` con un token en la variable de entorno `GITHUB_TOKEN`; nunca lo escribas en un archivo ni lo compartas en el chat. Rota el token después de publicar.

## Autoría, licencia y aviso

- **Titularidad del proyecto:** Factronics C.A. (Factronics Venezuela) y Khristyan Hidalgo.
- **Desarrollo y contenido técnico:** Khristyan Hidalgo, técnico de campo certificado de Factronics Venezuela.
- **Relación comercial:** Factronics Venezuela es distribuidor oficial de Videojet en Venezuela. Videojet es la marca de los equipos.
- **Autorización de Videojet:** Videojet Technologies no solicitó, patrocinó ni autorizó este proyecto ni su publicación.

Código bajo licencia MIT. El contenido técnico, marcas y material de referencia pertenecen a sus respectivos titulares. Ver [NOTICE.md](NOTICE.md).
