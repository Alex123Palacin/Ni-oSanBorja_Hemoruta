from __future__ import annotations

import json
import re
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings

from .proveedores import ErrorProveedorIA


class ClienteAsistentePaciente:
    """Cliente independiente para orientar al paciente dentro de HemoRuta."""

    def __init__(self, *, url: str | None = None, modelo: str | None = None, timeout: int | None = None):
        self.url = (url or settings.ML_OLLAMA_URL).rstrip("/")
        self.modelo = modelo or getattr(
            settings,
            "ML_ASISTENTE_PACIENTE_MODELO",
            settings.ML_OLLAMA_MODELO,
        )
        self.timeout = timeout or settings.ML_OLLAMA_TIMEOUT

    def responder(self, *, mensaje: str, ruta_actual: str, contexto: dict) -> dict:
        esquema = {
            "respuesta": "respuesta breve, clara y amable en español",
            "rutaSugerida": "una ruta permitida o cadena vacía",
        }
        prompt = (
            "Eres el asistente exclusivo del portal del paciente de HemoRuta Pediátrica. "
            "Habla con tono familiar, claro y tranquilo. Ayudas a encontrar secciones y a consultar "
            "exclusivamente los datos proporcionados del paciente autenticado; nunca menciones, solicites "
            "ni supongas información de otra persona. Responde con los horarios, citas, tratamiento, síntomas "
            "o documentos concretos del contexto cuando te los pregunten, no te limites a redirigir. "
            "No diagnostiques, no prescribas, no cambies dosis y no inventes información. "
            "No respondas temas ajenos a la cuenta, la app, medicación, citas, síntomas, tratamiento o documentos. "
            "Si un dato no está disponible, dilo claramente. Si describen una posible emergencia, "
            "indica que deben comunicarse de inmediato con el hospital o servicio de emergencias. "
            "No afirmes que ejecutaste una acción; las acciones seguras se procesan fuera del modelo. "
            "Responde en un máximo de 80 palabras y sugiere una ruta solo cuando sea útil. "
            "Responde únicamente JSON válido, sin Markdown ni razonamiento.\n"
            f"Esquema obligatorio: {json.dumps(esquema, ensure_ascii=False)}\n"
            f"Ruta actual: {ruta_actual}\n"
            f"Contexto autorizado: {json.dumps(contexto, ensure_ascii=False)}\n"
            f"Consulta del paciente: {mensaje}"
        )
        payload = json.dumps(
            {
                "model": self.modelo,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.15},
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
            raise ErrorProveedorIA("No fue posible consultar el asistente en este momento.") from exc

        contenido = envoltorio.get("response", "")
        if not isinstance(contenido, str):
            raise ErrorProveedorIA("El asistente devolvió una respuesta inesperada.")
        contenido = re.sub(r"<think>[\s\S]*?</think>", "", contenido, flags=re.IGNORECASE).strip()
        inicio, fin = contenido.find("{"), contenido.rfind("}")
        if inicio >= 0 and fin > inicio:
            contenido = contenido[inicio : fin + 1]
        try:
            resultado = json.loads(contenido)
        except json.JSONDecodeError as exc:
            raise ErrorProveedorIA("El asistente no devolvió una respuesta válida.") from exc
        if not isinstance(resultado, dict):
            raise ErrorProveedorIA("El asistente devolvió una respuesta inesperada.")
        return resultado


def obtener_cliente_asistente_paciente() -> ClienteAsistentePaciente:
    return ClienteAsistentePaciente()
