# Android nativo

Aplicación Java sin AndroidX, sin WebView y sin Gradle. La interfaz se construye con vistas estándar de Android y el banco se lee de `assets/bank.json`.

## Requisitos

- JDK 17 (`JAVA_HOME`).
- Android SDK con `platforms/android-34` y `build-tools/34.0.0`.
- `ANDROID_HOME` o `ANDROID_SDK_ROOT`.

## Compilar

```powershell
python android/build.py
```

El script:

1. Compila recursos con `aapt2`.
2. Enlaza manifiesto, recursos y assets.
3. Compila Java con `javac`.
4. Convierte a DEX con `d8`.
5. Añade `classes.dex` al APK.
6. Alinea con `zipalign`.
7. Firma con `apksigner` y verifica.

Salida:

- `android/build/VideojetTTO-Lab.apk`
- `download/VideojetTTO-Lab.apk`

La clave se genera en `android/build/debug.keystore` si no existe. Es una clave de entrenamiento, no una clave de producción. Si borras `android/build`, se generará una nueva y Android pedirá desinstalar la versión anterior antes de actualizar.

## Estructura

```text
android/
├── AndroidManifest.xml
├── build.py
└── app/src/main/
    ├── assets/bank.json     Banco compartido
    ├── assets/ui.json       Textos ES/EN/PT
    ├── assets/logo.png
    ├── java/.../Bank.java
    ├── java/.../I18n.java
    ├── java/.../MainActivity.java
    └── res/                 Tema e iconos
```

## Probar en emulador

```powershell
adb install -r download/VideojetTTO-Lab.apk
adb shell am start -n com.videojet.tto.lab/.MainActivity
```

Probado en `Pixel_7_API_34` (Android 14, x86_64).
