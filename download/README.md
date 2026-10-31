# APK Android

`Factronics-TTO-Lab.apk` es la aplicación nativa de entrenamiento de **Factronics TTO Lab**, proyecto de Factronics Venezuela y Khristyan Hidalgo.

- Paquete: `com.factronics.tto.lab`
- Versión: `1.6.0` (versionCode 7)
- Android mínimo: 7.0 (API 24)
- Objetivo: Android 14 (API 34)
- Firma: clave autofirmada de entrenamiento (v2/v3)
- Tamaño: ~190 KB (194.048 bytes)

Instalación: abre el archivo en el dispositivo y permite “instalar aplicaciones desconocidas” para el navegador o el explorador de archivos. No requiere conexión.

> **Actualización desde 1.3.0 o 1.2.0:** esta compilación puede usar una clave de
> entrenamiento distinta. Si Android muestra “Aplicación no instalada”, exporta el
> progreso, desinstala la versión anterior e instala de nuevo.

Esta versión incluye identificación del participante (nombre, apellido y correo),
resultado con QR escaneable, tarjeta PNG, 350 preguntas (22 nuevas de ribbons y
soportes) e informe PDF A4 con logo, puntaje, desglose, detalle y QR. El informe
y la tarjeta se comparten con la hoja del sistema. También consulta `version.json`
para avisar de una versión nueva; solo usa INTERNET para esa consulta.

Este APK se genera con `python android/build.py` y también se publica como asset en GitHub Releases.

> Videojet Technologies no solicitó ni autorizó este proyecto. Videojet es una marca de Videojet Technologies; Factronics Venezuela es distribuidor oficial de Videojet.

SHA-256: `d3388d928b1104904806af97f419489cb6bc491e57139adedaa083b42dd864d0` (`Factronics-TTO-Lab.apk.sha256`).
