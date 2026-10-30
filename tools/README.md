# tools

## `build_bank.py`

Genera el banco compartido a partir de `data/models.json`, `data/legacy-raw.json` y las plantillas internas.

```powershell
python tools/build_bank.py
```

Salidas:

- `assets/js/bank.js`
- `data/bank-preview.json`
- `android/app/src/main/assets/bank.json`

El script valida que cada pregunta tenga textos en ES/EN/PT, respuestas, modelos y campos coherentes. También aplica correcciones técnicas localizadas (por ejemplo, el ancho de 53 mm de la 6330 frente a 53/107 mm de la 6420/6530).

## `make_assets.py`

Genera la tarjeta social (`assets/img/og.png`), el favicon, los iconos de lanzador Android y la marca del encabezado de la app a partir de `assets/img/factronics.png`.

```powershell
python tools/make_assets.py
```

Requiere Pillow. También crea las variantes blanca y transparente del logo conservando el canal alfa original.

## `export_ui.js`

Exporta el diccionario de `assets/js/i18n.js` a `android/app/src/main/assets/ui.json` y comprueba que los tres idiomas tengan las mismas claves.

```powershell
node tools/export_ui.js
node tools/export_ui.js --check   # solo verifica, no escribe
```

## `verify.py`

Verificación automática del repositorio: banco, i18n, enlaces, iconos, service worker, versiones, SHA-256 del APK y posibles secretos.

```powershell
python tools/verify.py
```

Sin dependencias externas. Si Node.js está disponible también ejecuta `export_ui.js --check`.

## `publish_github.py`

Publica el contenido en GitHub mediante la API REST, sin Git ni GitHub CLI. Requiere un token con permisos de repositorio:

```powershell
$env:GITHUB_TOKEN = "github_pat_..."
python tools/publish_github.py --owner emanuelindustri-source --repo factronics-tto-lab
```

El script crea el repositorio si falta, sube los archivos, activa GitHub Pages y crea/actualiza el release con el APK. No escribe el token en disco. Al terminar, revoca o rota el token.
