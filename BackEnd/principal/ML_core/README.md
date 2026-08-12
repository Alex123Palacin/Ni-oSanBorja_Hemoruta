# ML Core

Este módulo administra el dictado de una consulta clínica. La transcripción y
la estructuración permanecen como borrador hasta que el médico revisa y publica
el contenido.

## Servicios

- IA generativa: Ollama con `deepseek-r1:8b` en `http://127.0.0.1:11434`.
- Voz: `faster-whisper` recibe el audio; cuando el navegador también ofrece una
  transcripción, se utiliza como respuesta inmediata.

La dependencia se instala junto con el resto del backend mediante
`requirements.txt`.

```powershell
pip install -r requirements.txt
```

Las variables `ML_OLLAMA_*` y `ML_STT_*` están documentadas en `.env.example`.
Las pruebas sustituyen ambos proveedores con dobles y nunca requieren Ollama ni
un modelo STT activos.

## Flujo API

Las rutas de consulta por voz exigen token y rol `MEDICO`:

- `POST /api/v1/ml/consultas-voz/`
- `GET|PATCH /api/v1/ml/consultas-voz/{id}/`
- `POST /api/v1/ml/consultas-voz/{id}/transcribir/`
- `POST /api/v1/ml/consultas-voz/{id}/publicar/`

El asistente independiente exige token y rol `PACIENTE`:

- `POST /api/v1/ml/asistente-paciente/consultar/`

Al publicar se crean la consulta y sus secciones, el plan vigente, las
prescripciones con horarios y dosis programadas, la próxima cita y el evento de
seguimiento. Por ello las vistas del paciente reciben los datos inmediatamente.

El asistente del paciente usa un contexto separado y limitado a su medicación,
próxima cita, tratamiento y rutas permitidas.
