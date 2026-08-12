from __future__ import annotations

import re
import unicodedata
from copy import deepcopy
from decimal import Decimal, InvalidOperation

from django.utils.dateparse import parse_date, parse_time
from rest_framework.exceptions import ValidationError

from .models import estructura_consulta_vacia


PREGUNTAS = (
    ("motivoConsulta", "¿Cuál es el motivo de consulta?"),
    ("evolucionClinica", "¿Cómo ha evolucionado clínicamente el paciente?"),
    ("tratamientoIndicado", "¿Qué tratamiento desea indicar?"),
    ("medicacionIndicada", "¿Qué medicamentos, dosis, días y horas debe seguir el paciente?"),
    ("indicacionesCasa", "¿Qué indicaciones debe seguir la familia en casa?"),
    ("proximoControl", "¿Cuándo será el próximo control?"),
)

CLAVES_PREGUNTAS = tuple(clave for clave, _ in PREGUNTAS)


def normalizar_estructura(datos: object) -> dict:
    base = estructura_consulta_vacia()
    if not isinstance(datos, dict):
        return base
    for clave in ("motivoConsulta", "evolucionClinica", "tratamientoIndicado", "indicacionesCasa"):
        valor = datos.get(clave)
        if isinstance(valor, str):
            base[clave] = valor.strip()

    medicamentos = datos.get("medicacionIndicada")
    if isinstance(medicamentos, list):
        base["medicacionIndicada"] = [
            normalizar_medicamento(item) for item in medicamentos if isinstance(item, dict)
        ]

    control = datos.get("proximoControl")
    if isinstance(control, dict):
        base["proximoControl"] = {
            "fecha": _texto(control.get("fecha")),
            "hora": _texto(control.get("hora")),
            "detalle": _texto(control.get("detalle")),
        }
    return base


def normalizar_medicamento(datos: dict) -> dict:
    dias = datos.get("diasSemana", [])
    if not isinstance(dias, list):
        dias = []
    dias_normalizados = []
    for dia in dias:
        try:
            numero = int(dia)
        except (TypeError, ValueError):
            continue
        if 0 <= numero <= 6 and numero not in dias_normalizados:
            dias_normalizados.append(numero)

    horas = datos.get("horas", [])
    if not isinstance(horas, list):
        horas = []
    horas_normalizadas = []
    for hora in horas:
        valor = _texto(hora)
        parsed = parse_time(valor)
        if parsed and parsed.replace(second=0, microsecond=0) not in horas_normalizadas:
            horas_normalizadas.append(parsed.replace(second=0, microsecond=0))

    try:
        duracion = int(datos.get("duracionDias") or 0)
    except (TypeError, ValueError):
        duracion = 0
    duracion = min(max(duracion, 0), 365)

    try:
        cantidad = Decimal(str(datos.get("dosisCantidad") or "0"))
        if not cantidad.is_finite():
            cantidad = Decimal("0")
    except (InvalidOperation, TypeError, ValueError):
        cantidad = Decimal("0")

    return {
        "nombre": _texto(datos.get("nombre")),
        "dosisCantidad": format(cantidad, "f"),
        "dosisUnidad": _texto(datos.get("dosisUnidad")),
        "via": _texto(datos.get("via") or "ORAL").upper(),
        "frecuenciaTexto": _texto(datos.get("frecuenciaTexto")),
        "diasSemana": sorted(dias_normalizados),
        "horas": [hora.strftime("%H:%M") for hora in sorted(horas_normalizadas)],
        "duracionDias": duracion,
        "indicaciones": _texto(datos.get("indicaciones")),
    }


def combinar_estructura(actual: dict, cambios: dict) -> dict:
    combinado = deepcopy(normalizar_estructura(actual))
    if not isinstance(cambios, dict):
        return combinado
    for clave in ("motivoConsulta", "evolucionClinica", "tratamientoIndicado", "indicacionesCasa"):
        if clave in cambios:
            combinado[clave] = _texto(cambios[clave])
    if "medicacionIndicada" in cambios:
        combinado["medicacionIndicada"] = normalizar_estructura(cambios)["medicacionIndicada"]
    if "proximoControl" in cambios:
        control = cambios.get("proximoControl")
        if isinstance(control, dict):
            combinado["proximoControl"].update(
                {clave: _texto(control[clave]) for clave in ("fecha", "hora", "detalle") if clave in control}
            )
    return combinado


def normalizar_preguntas_omitidas(preguntas: object) -> list[str]:
    if not isinstance(preguntas, list):
        return []
    return [
        clave
        for clave in CLAVES_PREGUNTAS
        if clave in preguntas
    ]


def es_comando_siguiente(texto: str) -> bool:
    """Reconoce intenciones breves de avanzar sin enviarlas al modelo clínico."""

    normalizado = unicodedata.normalize("NFKD", texto.lower())
    normalizado = "".join(caracter for caracter in normalizado if not unicodedata.combining(caracter))
    palabras = re.findall(r"[a-z0-9]+", normalizado)
    if not palabras or len(palabras) > 12:
        return False
    frase = " ".join(palabras)
    comandos_exactos = {
        "avanza",
        "continuar",
        "continua",
        "continuemos",
        "omite",
        "omitir",
        "pasa",
        "pasar",
        "pasamos",
        "pasemos",
        "salta",
        "saltar",
        "siguiente",
    }
    if frase in comandos_exactos or frase in {"no aplica", "sin informacion"}:
        return True
    verbos_control = {
        "avanza",
        "continuar",
        "continua",
        "continuamos",
        "continuemos",
        "omite",
        "omitir",
        "pasa",
        "pasamos",
        "pasar",
        "pasemos",
        "salta",
        "saltar",
    }
    palabras_control = verbos_control | {
        "a",
        "adelante",
        "ahora",
        "con",
        "el",
        "esta",
        "favor",
        "la",
        "otra",
        "otro",
        "podemos",
        "por",
        "pregunta",
        "puede",
        "puedes",
        "punto",
        "siguiente",
        "tema",
        "vamos",
        "ya",
    }
    if any(palabra in verbos_control for palabra in palabras) and all(
        palabra in palabras_control for palabra in palabras
    ):
        return True
    if "siguiente" in palabras and any(
        palabra in palabras
        for palabra in ("avanza", "continua", "continuar", "continuemos", "pasa", "pasar", "pasemos")
    ):
        return True
    if "pregunta" in palabras and any(
        palabra in palabras
        for palabra in ("omite", "omitir", "pasa", "pasar", "pasemos", "salta", "saltar", "siguiente")
    ):
        return True
    return frase.startswith(("vamos con la siguiente", "puedes pasar", "podemos pasar"))


def normalizar_texto_intencion(texto: str) -> str:
    normalizado = unicodedata.normalize("NFKD", texto.lower())
    normalizado = "".join(caracter for caracter in normalizado if not unicodedata.combining(caracter))
    return " ".join(re.findall(r"[a-z0-9]+", normalizado))


def es_peticion_volver_preguntas(texto: str) -> bool:
    frase = normalizar_texto_intencion(texto)
    return bool(
        frase
        and any(palabra in frase for palabra in ("volvamos", "volver", "regresa", "regresar", "continuemos"))
        and any(palabra in frase for palabra in ("pregunta", "entrevista", "formulario", "consulta"))
    )


def es_duda_del_medico(texto: str) -> bool:
    frase = normalizar_texto_intencion(texto)
    if not frase or len(frase.split()) > 45:
        return False
    inicios = (
        "como puedo",
        "como lo digo",
        "como deberia",
        "que me falta",
        "que falta",
        "esta bien",
        "me ayudas",
        "ayudame",
        "puedes explicarme",
        "puedo poner",
        "deberia poner",
        "que pregunta sigue",
    )
    if frase.startswith(inicios):
        return True
    return "?" in texto and any(
        palabra in frase
        for palabra in (
            "como",
            "que",
            "cual",
            "puedo",
            "deberia",
            "falta",
            "decir",
            "redactar",
            "dosis",
            "frecuencia",
        )
    )


def clave_siguiente_pregunta(datos: dict, preguntas_omitidas: object = None) -> str | None:
    datos = normalizar_estructura(datos)
    omitidas = set(normalizar_preguntas_omitidas(preguntas_omitidas))
    for clave, pregunta in PREGUNTAS:
        if clave in omitidas:
            continue
        valor = datos[clave]
        if clave == "medicacionIndicada":
            if not valor or not all(_medicamento_completo(item) for item in valor):
                return clave
        elif clave == "proximoControl":
            if not valor.get("fecha"):
                return clave
        elif not valor:
            return clave
    return None


def siguiente_pregunta(datos: dict, preguntas_omitidas: object = None) -> str:
    clave = clave_siguiente_pregunta(datos, preguntas_omitidas)
    if clave:
        if clave == "medicacionIndicada":
            return _pregunta_medicacion(datos)
        return dict(PREGUNTAS)[clave]
    return "El resumen está completo. Revíselo y edítelo antes de guardarlo."


def estructura_lista(datos: dict, preguntas_omitidas: object = None) -> bool:
    return clave_siguiente_pregunta(datos, preguntas_omitidas) is None


def validar_para_publicar(datos: dict) -> dict:
    datos = normalizar_estructura(datos)
    errores: dict[str, object] = {}
    if not datos["motivoConsulta"]:
        errores["motivoConsulta"] = "Indique el motivo de consulta."
    for indice, medicamento in enumerate(datos["medicacionIndicada"]):
        campos = {}
        if not medicamento["nombre"]:
            campos["nombre"] = "Indique el medicamento."
        elif len(medicamento["nombre"]) > 160:
            campos["nombre"] = "El nombre no puede superar 160 caracteres."
        try:
            cantidad = Decimal(medicamento["dosisCantidad"])
            if not cantidad.is_finite() or cantidad <= 0 or cantidad > Decimal("999999.99"):
                campos["dosisCantidad"] = "Indique una dosis válida mayor que cero."
        except InvalidOperation:
            campos["dosisCantidad"] = "La dosis no es válida."
        if not medicamento["dosisUnidad"]:
            campos["dosisUnidad"] = "Indique la unidad de la dosis."
        elif len(medicamento["dosisUnidad"]) > 30:
            campos["dosisUnidad"] = "La unidad no puede superar 30 caracteres."
        if len(medicamento["frecuenciaTexto"]) > 160:
            campos["frecuenciaTexto"] = "La frecuencia no puede superar 160 caracteres."
        if not medicamento["diasSemana"]:
            campos["diasSemana"] = "Seleccione al menos un día."
        if not medicamento["horas"]:
            campos["horas"] = "Indique al menos una hora."
        if medicamento["duracionDias"] <= 0:
            campos["duracionDias"] = "Indique la duración del tratamiento."
        if campos:
            errores.setdefault("medicacionIndicada", {})[indice] = campos

    control = datos["proximoControl"]
    if control["fecha"] and not parse_date(control["fecha"]):
        errores.setdefault("proximoControl", {})["fecha"] = "Use una fecha válida en formato AAAA-MM-DD."
    if control["hora"] and not parse_time(control["hora"]):
        errores.setdefault("proximoControl", {})["hora"] = "Use una hora válida en formato HH:MM."
    if len(control["detalle"]) > 240:
        errores.setdefault("proximoControl", {})["detalle"] = "El detalle no puede superar 240 caracteres."
    if errores:
        raise ValidationError({"secciones": errores})
    return datos


def _texto(valor: object) -> str:
    return valor.strip() if isinstance(valor, str) else ""


def _medicamento_completo(medicamento: dict) -> bool:
    try:
        cantidad_valida = Decimal(medicamento["dosisCantidad"]) > 0
    except (InvalidOperation, KeyError):
        cantidad_valida = False
    return bool(
        medicamento.get("nombre")
        and cantidad_valida
        and medicamento.get("dosisUnidad")
        and medicamento.get("duracionDias", 0) > 0
        and medicamento.get("diasSemana")
        and medicamento.get("horas")
    )


def _pregunta_medicacion(datos: dict) -> str:
    medicamentos = normalizar_estructura(datos)["medicacionIndicada"]
    if not medicamentos:
        return dict(PREGUNTAS)["medicacionIndicada"]
    for medicamento in medicamentos:
        nombre = medicamento["nombre"] or "el medicamento indicado"
        try:
            cantidad_valida = Decimal(medicamento["dosisCantidad"]) > 0
        except InvalidOperation:
            cantidad_valida = False
        if not cantidad_valida or not medicamento["dosisUnidad"]:
            return f"¿Qué dosis de {nombre} debe tomar el paciente?"
        if medicamento["duracionDias"] <= 0:
            return f"¿Durante cuántos días debe tomar {nombre}?"
        if not medicamento["diasSemana"]:
            return f"¿Qué días debe tomar {nombre}?"
        if not medicamento["horas"]:
            return f"¿A qué horas debe tomar {nombre}?"
    return dict(PREGUNTAS)["medicacionIndicada"]
