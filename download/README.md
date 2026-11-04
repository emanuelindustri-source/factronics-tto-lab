# APK Android

`Factronics-TTO-Lab.apk` es la aplicación nativa de entrenamiento de **Factronics TTO Lab**, proyecto de Factronics Venezuela y Khristyan Hidalgo.

- Paquete: `com.factronics.tto.lab`
- Versión: `1.9.0` (versionCode 10)
- Android mínimo: 7.0 (API 24)
- Objetivo: Android 14 (API 34)
- Firma: clave autofirmada de entrenamiento (v2/v3)
- Tamaño: ~206 KB (210.432 bytes)

Instalación: abre el archivo en el dispositivo y permite “instalar aplicaciones desconocidas” para el navegador o el explorador de archivos. No requiere conexión.

> **Actualización desde 1.3.0 o 1.2.0:** esta compilación puede usar una clave de
> entrenamiento distinta. Si Android muestra “Aplicación no instalada”, exporta el
> progreso, desinstala la versión anterior e instala de nuevo.

Esta versión incluye identificación del participante (nombre, apellido y correo),
certificado QR verificable, tarjeta PNG, informe PDF A4 con QR, CSV, escáner QR y 372
preguntas (22 de ribbons/soportes y 22 de gamas/troubleshooting). El PDF, la tarjeta y
el CSV se comparten con la hoja del sistema; la app abre `verificar/` para
comprobar el resultado. También consulta `version.json` para avisar de una
versión nueva; solo usa INTERNET para esa consulta.

Este APK se genera con `python android/build.py` y también se publica como asset en GitHub Releases.

> Videojet es una marca de Videojet Technologies; Factronics Venezuela es distribuidor oficial de Videojet. Material de entrenamiento de Factronics C.A.

SHA-256: `c04de8c15e60e30eee545081a5fdd1a2887101d6bb16c97d39e4855dd5b92ad2` (`Factronics-TTO-Lab.apk.sha256`).
