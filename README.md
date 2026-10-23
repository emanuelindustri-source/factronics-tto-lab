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
- Modos **Examen**, **Estudio** (corrección inmediata) y **Repaso** (solo falladas o pendientes).
- Guarda configuración, examen en curso, preguntas vistas y progreso en `localStorage` (`tto.progress.v2`).
- Historial de intentos, promedio, mejor nota, racha, cuaderno de errores y repaso espaciado con vencimientos.
- Biblioteca de preguntas con búsqueda por texto, tipo y modelo, más respuesta y explicación.
- Constancia de aprovechamiento imprimible con código de verificación y aviso legal.
- Exportar/importar progreso en JSON entre perfiles y dispositivos.
- Cronómetro, mapa de preguntas, marcado para revisar y navegación.
- Resultados con desglose por tipo, autoevaluación de preguntas abiertas, CSV e impresión/PDF.
- Enlace compartible con la configuración (`?models=6530&types=single,multi&count=20&minutes=30`).
- Interfaz adaptable a móvil, tema claro/oscuro y estilos de impresión.

## Aplicación Android

- Java nativo, sin AndroidX, sin WebView y sin dependencias externas.
- Pantallas de configuración, examen y resultados construidas programáticamente.
- Modos **Examen**, **Estudio** y **Repaso**, igual que la versión web.
- Progreso local: historial, promedio, mejor nota, racha, cuaderno de errores y repaso espaciado.
- Guardado automático y **reanudar sesión** tras cerrar o reiniciar la app.
- Biblioteca de preguntas con búsqueda por texto, tipo y modelo.
- Tema claro/oscuro con detección del tema del sistema y botón de cambio.
- Compartir resultado, exportar progreso por hoja de compartir e importar un JSON con `ACTION_OPEN_DOCUMENT`.
- Cronómetro, mapa de preguntas, navegación, marcado para revisar y autoevaluación.
- Banco local en `assets/bank.json` y textos en `assets/ui.json`.
- Funciona sin conexión.
- `minSdk 24` (Android 7.0), `targetSdk 34`, versión `1.2.0`.

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

## Novedades 1.2

- **Modos de sesión:** examen con cronómetro, estudio con corrección inmediata y repaso de fallos/pendientes.
- **Progreso local:** perfiles, historial de intentos, estadísticas, cuaderno de errores y repetición espaciada.
- **Biblioteca técnica:** búsqueda de las 304 preguntas únicas por texto, tipo y modelo, con respuesta y explicación.
- **Reanudar sesión:** el examen en curso se guarda solo y se retoma en web y Android.
- **PWA offline:** manifest, service worker, iconos e instalación desde el navegador.
- **Constancia de aprovechamiento:** documento imprimible con código de verificación y aviso legal.
- **Importar/exportar:** el progreso viaja en JSON entre navegador y APK.
- **APK 1.2.0:** paridad de modos, progreso, biblioteca, tema oscuro y compartir resultado.

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

Los textos de interfaz viven en `assets/js/i18n.js`; `android/app/src/main/assets/ui.json` se exporta desde ese mismo diccionario para mantener paridad.

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
│   └── js/generator.js
├── data/                       Fuentes y banco legible
├── tools/build_bank.py         Generador del banco
├── tools/make_assets.py        OG, favicon e iconos de la app
├── tools/publish_github.py     Publicación por API
├── android/                    App nativa + build.py
└── download/Factronics-TTO-Lab.apk
```

## Ejecutar en local

El sitio usa rutas relativas, pero para probar `bank.js` y el generador con `fetch`/assets se recomienda un servidor estático:

```powershell
python -m http.server 8765
# http://127.0.0.1:8765/
```

También se puede abrir `index.html` directamente; el generador no necesita red.

## Verificación rápida

- `python tools/build_bank.py` → 328 preguntas, 304 enunciados únicos.
- Web: examen de 12 preguntas con respuestas correctas → 100 %.
- Web: selección múltiple parcial → puntaje fraccionario (prueba: 4,08/10 = 41 %).
- Android: instalación, configuración, examen, resultados y autoevaluación probados en emulador Pixel 7 / API 34.
- APK verificado con `apksigner verify` (esquemas v2/v3).

## Seguridad y privacidad

- No hay tokens, credenciales ni telemetría en el repositorio.
- El APK no solicita permisos de red.
- Los datos de sesión se guardan localmente (navegador o `SharedPreferences`).
- Para publicar cambios, usa `tools/publish_github.py` con un token en la variable de entorno `GITHUB_TOKEN`; nunca lo escribas en un archivo.

## Autoría, licencia y aviso

- **Titularidad del proyecto:** Factronics C.A. (Factronics Venezuela) y Khristyan Hidalgo.
- **Desarrollo y contenido técnico:** Khristyan Hidalgo, técnico de campo certificado de Factronics Venezuela.
- **Relación comercial:** Factronics Venezuela es distribuidor oficial de Videojet en Venezuela. Videojet es la marca de los equipos.
- **Autorización de Videojet:** Videojet Technologies no solicitó, patrocinó ni autorizó este proyecto ni su publicación.

Código bajo licencia MIT. El contenido técnico, marcas y material de referencia pertenecen a sus respectivos titulares. Ver [NOTICE.md](NOTICE.md).
