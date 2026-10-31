# Notas de versión · Factronics TTO Lab

Este directorio es el **histórico del proyecto**. Las notas no se borran ni se
sobrescriben: cada revisión deja un archivo con fecha y versión. Así se puede
reconstruir qué se probó, qué se cambió y por qué.

## Convención

```text
docs/notas/
├── README.md                         Este índice y la convención
├── PENDIENTES.md                     Backlog vivo (se actualiza, no se borra)
├── AAAA-MM-DD-vX.Y.Z-estado.md       Foto de la versión al empezar la revisión
├── AAAA-MM-DD-vX.Y.Z-plan.md         Alcance y criterios de aceptación
└── AAAA-MM-DD-vX.Y.Z-resultado.md    Cambios, pruebas y evidencia
```

Reglas:

1. Una nota por versión y por etapa (`estado`, `plan`, `resultado`).
2. No se elimina una nota antigua aunque la versión ya no exista.
3. `PENDIENTES.md` es el único archivo que se reescribe; su historial queda en
   las notas de resultado de cada versión.
4. Toda afirmación de prueba debe indicar **cómo se comprobó** (comando,
   navegador, emulador o dispositivo).
5. Si una mejora se aplaza, se mueve a `PENDIENTES.md` con prioridad y motivo.

## Índice

| Fecha | Versión | Nota | Estado |
|---|---|---|---|
| 2026-10-30 | 1.2.0 | [Estado inicial y auditoría](2026-10-30-v1.2.0-estado.md) | Cerrada |
| 2026-10-30 | 1.3.0 | [Plan de trabajo](2026-10-30-v1.3.0-plan.md) | Cerrada |
| 2026-10-30 | 1.3.0 | [Resultado y pruebas](2026-10-30-v1.3.0-resultado.md) | Cerrada |
| 2026-10-30 | 1.4.0 | [Plan de trabajo](2026-10-30-v1.4.0-plan.md) | Cerrada |
| 2026-10-30 | 1.4.0 | [Resultado y pruebas](2026-10-30-v1.4.0-resultado.md) | Cerrada |
| 2026-10-30 | 1.5.0 | [Plan de trabajo](2026-10-30-v1.5.0-plan.md) | Cerrada |
| 2026-10-30 | 1.5.0 | [Resultado y pruebas](2026-10-30-v1.5.0-resultado.md) | Cerrada |
| 2026-10-30 | 1.6.0 | [Plan de trabajo](2026-10-30-v1.6.0-plan.md) | Cerrada |
| 2026-10-30 | 1.6.0 | [Resultado y pruebas](2026-10-30-v1.6.0-resultado.md) | Cerrada |
| 2026-10-31 | 1.7.0 | [Plan de trabajo](2026-10-31-v1.7.0-plan.md) | Cerrada |
| 2026-10-31 | 1.7.0 | [Resultado y pruebas](2026-10-31-v1.7.0-resultado.md) | Cerrada |
| — | — | [Pendientes](PENDIENTES.md) | Vivo |

## Versión publicada

- Sitio: https://emanuelindustri-source.github.io/factronics-tto-lab/
- Generador: https://emanuelindustri-source.github.io/factronics-tto-lab/generator/
- APK: https://github.com/emanuelindustri-source/factronics-tto-lab/releases/latest/download/Factronics-TTO-Lab.apk
