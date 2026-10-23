# Android nativo · Factronics TTO Lab

Aplicación Java sin AndroidX, sin WebView y sin Gradle. La interfaz se construye con vistas estándar de Android y el banco se lee de `assets/bank.json`.

Proyecto de Factronics Venezuela, distribuidor oficial de Videojet. Desarrollado por Khristyan Hidalgo, técnico de campo certificado. Videojet Technologies no solicitó ni autorizó este proyecto.

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

- `android/build/Factronics-TTO-Lab.apk`
- `download/Factronics-TTO-Lab.apk`

La clave se genera en `android/build/debug.keystore` si no existe. Es una clave de entrenamiento, no una clave de producción. Si borras `android/build`, se generará una nueva y Android pedirá desinstalar la versión anterior antes de actualizar.

## Estructura

```text
android/
├── AndroidManifest.xml
├── build.py
└── app/src/main/
    ├── assets/bank.json     Banco compartido
    ├── assets/ui.json       Textos ES/EN/PT
    ├── assets/logo.png      Marca Factronics
    ├── java/.../Bank.java
    ├── java/.../I18n.java
    ├── java/.../MainActivity.java
    └── res/                 Tema e iconos
```

## Probar en emulador

```powershell
adb install -r download/Factronics-TTO-Lab.apk
adb shell am start -n com.factronics.tto.lab/.MainActivity
```

Probado en `Pixel_7_API_34` (Android 14, x86_64).
