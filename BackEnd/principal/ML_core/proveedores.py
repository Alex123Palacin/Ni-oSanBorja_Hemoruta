from __future__ import annotations

import json
import re
import tempfile
from functools import lru_cache
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings


class ErrorProveedorIA(RuntimeError):
    pass


class ErrorTranscripcion(RuntimeError):
    pass


class ClienteOllama:
    def __init__(self, *, url: str | None = None, modelo: str | None = None, timeout: int | None = None):
        self.url = (url or settings.ML_OLLAMA_URL).rstrip("/")
        self.modelo = modelo or settings.ML_OLLAMA_MODELO
        self.timeout = timeout or settings.ML_OLLAMA_TIMEOUT

    def estructurar(
        self,
        *,
        datos_actuales: dict,
        intervenciones: list[dict],
        pregunta_actual: str = "",
        preguntas_omitidas: list[str] | None = None,
    ) -> dict:
        esquema = {
            "secciones": {
                "motivoConsulta": "texto",
                "evolucionClinica": "texto",
                "tratamientoIndicado": "texto",
                "medicacionIndicada": [
                    {
                        "nombre": "texto",
                        "dosisCantidad": "numero",
                        "dosisUnidad": "mg, ml, tableta u otra unidad",
                        "via": "ORAL|INTRAVENOSA|SUBCUTANEA|INTRAMUSCULAR|TOPICA|OTRA",
                        "frecuenciaTexto": "texto",
                        "diasSemana": [0, 1, 2, 3, 4, 5, 6],
                        "horas": ["HH:MM"],
                        "duracionDias": "número de días o 0 si no fue indicado",
                        "indicaciones": "texto",
                    }
                ],
                "indicacionesCasa": "texto",
                "proximoControl": {"fecha": "AAAA-MM-DD", "hora": "HH:MM", "detalle": "texto"},
            },
            "preguntaSiguiente": "una sola pregunta breve en español o cadena vacía",
            "listo": False,
        }
        prompt = (
            "Eres un asistente de documentación clínica pediátrica. No diagnostiques ni inventes datos. "
            "Resume exclusivamente la información clínica importante expresada por el médico, con frases "
            "breves, precisas y sin saludos, muletillas, repeticiones ni comentarios de la conversación. "
            "Nunca incorpores comandos para avanzar como siguiente, pasa, continuar u omitir. "
            "Conserva lo ya registrado si no se contradice. Para cada medicamento extrae nombre, cantidad, "
            "unidad, duración, días y todas las horas mencionadas; no completes datos que no fueron dichos. "
            "Si se indica por N días sin mencionar días de la semana, representa que es diario con "
            "diasSemana=[0,1,2,3,4,5,6] y duracionDias=N. "
            "Los días usan 0=lunes y 6=domingo. Responde solo JSON válido, sin razonamiento ni Markdown.\n"
            f"Esquema obligatorio: {json.dumps(esquema, ensure_ascii=False)}\n"
            f"Datos actuales: {json.dumps(datos_actuales, ensure_ascii=False)}\n"
            f"Pregunta actual: {json.dumps(pregunta_actual, ensure_ascii=False)}\n"
            f"Secciones omitidas: {json.dumps(preguntas_omitidas or [], ensure_ascii=False)}\n"
            f"Conversación: {json.dumps(intervenciones, ensure_ascii=False)}"
        )
        payload = json.dumps(
            {
                "model": self.modelo,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.1},
            }
        ).encode("utf-8")
        solicitud = Request(
            f"{self.url}/api/generate",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urlopen(solicitud, timeout=self.timeout) as respuesta:
                envoltorio = json.loads(respuesta.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
            raise ErrorProveedorIA("No se pudo consultar el asistente de IA.") from exc
        contenido = envoltorio.get("response", "")
        if not isinstance(contenido, str):
            raise ErrorProveedorIA("El asistente de IA devolvió una respuesta inesperada.")
        contenido = re.sub(r"<think>.*?</think>", "", contenido, flags=re.DOTALL).strip()
        try:
            return json.loads(contenido)
        except json.JSONDecodeError as exc:
            inicio, fin = contenido.find("{"), contenido.rfind("}")
            if inicio >= 0 and fin > inicio:
                try:
                    return json.loads(contenido[inicio : fin + 1])
                except json.JSONDecodeError:
                    pass
            raise ErrorProveedorIA("El asistente de IA no devolvió una respuesta válida.") from exc

    def orientar_medico(
        self,
        *,
        datos_actuales: dict,
        mensaje_medico: str,
        pregunta_actual: str = "",
    ) -> str:
        prompt = (
            "Eres un copiloto de documentacion clinica pediatrica para un medico. "
            "Tu prioridad es ayudar a completar el formulario de consulta por voz. "
            "Puedes responder dudas breves del medico, sugerir que detalle dosis, frecuencia, duracion, "
            "evolucion o control, y luego invitarlo a continuar con la pregunta actual. "
            "No contradigas la decision del medico, no prescribas por tu cuenta y no agregues datos no dichos. "
            "Responde en maximo 45 palabras, sin Markdown.\n"
            f"Pregunta actual: {pregunta_actual}\n"
            f"Resumen actual: {json.dumps(datos_actuales, ensure_ascii=False)}\n"
            f"Mensaje del medico: {mensaje_medico}"
        )
        payload = json.dumps(
            {
                "model": self.modelo,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.25},
            }
        ).encode("utf-8")
        solicitud = Request(
            f"{self.url}/api/generate",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urlopen(solicitud, timeout=self.timeout) as respuesta:
                envoltorio = json.loads(respuesta.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
            raise ErrorProveedorIA("No se pudo consultar el copiloto medico.") from exc
        contenido = envoltorio.get("response", "")
        if not isinstance(contenido, str):
            raise ErrorProveedorIA("El copiloto medico devolvio una respuesta inesperada.")
        contenido = re.sub(r"<think>.*?</think>", "", contenido, flags=re.DOTALL).strip()
        return re.sub(r"\s+", " ", contenido)[:600]


class TranscriptorLocal:
    def transcribir(self, archivo, *, texto_alternativo: str = "") -> str:
        texto_alternativo = texto_alternativo.strip()
        if texto_alternativo:
            return texto_alternativo
        if archivo is None:
            raise ErrorTranscripcion("Adjunte un audio o envíe la transcripción del navegador.")
        try:
            modelo = _obtener_modelo_whisper(
                settings.ML_STT_MODELO,
                settings.ML_STT_DISPOSITIVO,
                settings.ML_STT_COMPUTE_TYPE,
            )
        except ImportError as exc:
            raise ErrorTranscripcion(
                "No hay un servicio de transcripción disponible. Envíe la transcripción del navegador."
            ) from exc
        except Exception as exc:
            raise ErrorTranscripcion(
                "No se pudo iniciar la transcripción. Envíe la transcripción del navegador."
            ) from exc

        sufijo = Path(getattr(archivo, "name", "audio.webm")).suffix.lower()
        if sufijo not in {".wav", ".mp3", ".m4a", ".ogg", ".webm", ".mp4"}:
            sufijo = ".webm"
        ruta = None
        try:
            with tempfile.NamedTemporaryFile(suffix=sufijo, delete=False) as temporal:
                for bloque in archivo.chunks():
                    temporal.write(bloque)
                ruta = Path(temporal.name)
            segmentos, _ = modelo.transcribe(str(ruta), language="es", vad_filter=True)
            texto = " ".join(segmento.text.strip() for segmento in segmentos).strip()
            if not texto:
                raise ErrorTranscripcion("No se detectó voz en el audio.")
            return texto
        except ErrorTranscripcion:
            raise
        except Exception as exc:
            raise ErrorTranscripcion("No se pudo transcribir el audio.") from exc
        finally:
            if ruta:
                ruta.unlink(missing_ok=True)


def obtener_cliente_ollama() -> ClienteOllama:
    return ClienteOllama()


def obtener_transcriptor() -> TranscriptorLocal:
    return TranscriptorLocal()


@lru_cache(maxsize=1)
def _obtener_modelo_whisper(nombre: str, dispositivo: str, tipo_computo: str):
    from faster_whisper import WhisperModel

    return WhisperModel(nombre, device=dispositivo, compute_type=tipo_computo)
