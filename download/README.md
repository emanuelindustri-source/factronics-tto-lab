# APK Android

`Factronics-TTO-Lab.apk` es la aplicación nativa de entrenamiento de **Factronics TTO Lab**, proyecto de Factronics Venezuela y Khristyan Hidalgo.

- Paquete: `com.factronics.tto.lab`
- Versión: `1.7.0` (versionCode 8)
- Android mínimo: 7.0 (API 24)
- Objetivo: Android 14 (API 34)
- Firma: clave autofirmada de entrenamiento (v2/v3)
- Tamaño: ~194 KB (198.144 bytes)

Instalación: abre el archivo en el dispositivo y permite “instalar aplicaciones desconocidas” para el navegador o el explorador de archivos. No requiere conexión.

> **Actualización desde 1.3.0 o 1.2.0:** esta compilación puede usar una clave de
> entrenamiento distinta. Si Android muestra “Aplicación no instalada”, exporta el
> progreso, desinstala la versión anterior e instala de nuevo.

Esta versión incluye identificación del participante (nombre, apellido y correo),
certificado QR verificable, tarjeta PNG, informe PDF A4 con QR, CSV y 356
preguntas (22 de ribbons/soportes y 6 de troubleshooting). El PDF, la tarjeta y
el CSV se comparten con la hoja del sistema; la app abre `verificar/` para
comprobar el resultado. También consulta `version.json` para avisar de una
versión nueva; solo usa INTERNET para esa consulta.

Este APK se genera con `python android/build.py` y también se publica como asset en GitHub Releases.

> Videojet es una marca de Videojet Technologies; Factronics Venezuela es distribuidor oficial de Videojet. Material de entrenamiento de Factronics C.A.

SHA-256: `429c66da60bdeff5cb328e6da1ee8f1ffa48bf072aa3d9696bb98a89ecf9a8ce` (`Factronics-TTO-Lab.apk.sha256`).
