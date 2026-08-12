from __future__ import annotations

import re
import unicodedata
from datetime import datetime, time, timedelta

from django.db.models import Prefetch, Q
from django.utils import timezone

from citas.models import Cita
from clinica.models import PlanTratamiento
from medicacion.models import DiaHorarioPrescripcion, DosisProgramada, Prescripcion, ReporteDosis
from medicacion.services import registrar_reporte_dosis
from pacientes.models import Paciente

from .proveedor_asistente_paciente import obtener_cliente_asistente_paciente
from .proveedores import ErrorProveedorIA


RUTAS_PACIENTE = {
    "/paciente/inicio": "Inicio, perfil y próxima cita",
    "/paciente/medicamento": "Medicación, horarios y tomas",
    "/paciente/sintomas": "Registro de síntomas",
    "/paciente/tratamiento": "Tratamiento e indicaciones médicas",
    "/paciente/documentos": "Exámenes y documentos",
}

ALIAS_RUTAS = {
    "/paciente/medicacion": "/paciente/medicamento",
    "medicacion": "/paciente/medicamento",
    "medicamento": "/paciente/medicamento",
    "sintomas": "/paciente/sintomas",
    "tratamiento": "/paciente/tratamiento",
    "documentos": "/paciente/documentos",
    "inicio": "/paciente/inicio",
}


def _limites_hoy():
    hoy = timezone.localdate()
    zona = timezone.get_current_timezone()
    inicio = timezone.make_aware(datetime.combine(hoy, time.min), zona)
    fin = inicio + timedelta(days=1)
    return hoy, inicio, fin


def _texto_dosis(prescripcion: Prescripcion) -> str:
    return f"{prescripcion.cantidad_dosis:g} {prescripcion.unidad_dosis}".strip()


def _contexto_medicacion(paciente: Paciente) -> list[dict]:
    hoy, inicio, fin = _limites_hoy()
    dosis = list(
        DosisProgramada.objects.filter(
            prescripcion__paciente=paciente,
            programada_para__gte=inicio,
            programada_para__lt=fin,
        )
        .exclude(estado=DosisProgramada.Estado.CANCELADA)
        .select_related("prescripcion__medicamento")
        .order_by("programada_para")
    )
    if dosis:
        return [
            {
                "medicamento": item.prescripcion.medicamento.nombre_generico,
                "dosis": _texto_dosis(item.prescripcion),
                "hora": timezone.localtime(item.programada_para).strftime("%H:%M"),
                "estado": item.get_estado_display(),
            }
            for item in dosis
        ]

    horarios_hoy = Prefetch(
        "horarios__dias",
        queryset=DiaHorarioPrescripcion.objects.filter(dia_semana=hoy.weekday()),
        to_attr="dias_hoy",
    )
    prescripciones = (
        Prescripcion.objects.filter(
            paciente=paciente,
            estado=Prescripcion.Estado.ACTIVA,
            fecha_inicio__lte=hoy,
        )
        .filter(Q(fecha_fin__isnull=True) | Q(fecha_fin__gte=hoy))
        .select_related("medicamento")
        .prefetch_related(horarios_hoy)
    )
    resultado = []
    for prescripcion in prescripciones:
        for horario in prescripcion.horarios.all():
            if not horario.activo:
                continue
            if not getattr(horario, "dias_hoy", []):
                continue
            resultado.append(
                {
                    "medicamento": prescripcion.medicamento.nombre_generico,
                    "dosis": _texto_dosis(prescripcion),
                    "hora": horario.hora.strftime("%H:%M") if horario.hora else prescripcion.frecuencia_texto,
                    "estado": "Pendiente",
                }
            )
    return resultado


def construir_contexto_asistente(paciente: Paciente) -> dict:
    ahora = timezone.now()
    proxima_cita = (
        Cita.objects.filter(paciente=paciente, inicio__gte=ahora)
        .exclude(estado__in=(Cita.Estado.CANCELADA, Cita.Estado.NO_ASISTIO))
        .select_related("medico")
        .order_by("inicio")
        .first()
    )
    plan = (
        PlanTratamiento.objects.filter(
            paciente=paciente,
            estado=PlanTratamiento.Estado.VIGENTE,
        )
        .prefetch_related("items")
        .order_by("-vigente_desde", "-creado_en")
        .first()
    )
    cita = None
    if proxima_cita:
        inicio = timezone.localtime(proxima_cita.inicio)
        cita = {
            "fecha": inicio.date().isoformat(),
            "hora": inicio.strftime("%H:%M"),
            "tipo": proxima_cita.get_tipo_display(),
            "especialidad": proxima_cita.especialidad,
            "sede": proxima_cita.sede,
            "estado": proxima_cita.get_estado_display(),
        }
    tratamiento = None
    if plan:
        tratamiento = {
            "nombre": plan.nombre,
            "indicacionGeneral": plan.indicacion_general,
            "indicaciones": [
                {"tipo": item.get_tipo_display(), "titulo": item.titulo, "detalle": item.descripcion}
                for item in plan.items.all()
            ],
        }
    return {
        "paciente": paciente.nombre_completo,
        "fechaActual": timezone.localdate().isoformat(),
        "medicacionHoy": _contexto_medicacion(paciente),
        "proximaCita": cita,
        "tratamientoVigente": tratamiento,
        "navegacionPermitida": RUTAS_PACIENTE,
    }


def _normalizar_texto(texto: str) -> str:
    normalizado = unicodedata.normalize("NFKD", texto.lower())
    normalizado = "".join(caracter for caracter in normalizado if not unicodedata.combining(caracter))
    return re.sub(r"\s+", " ", normalizado).strip()


def _ruta_por_intencion(mensaje: str) -> str:
    consulta = _normalizar_texto(mensaje)
    reglas = (
        (("medicamento", "medicacion", "pastilla", "dosis", "tomar"), "/paciente/medicamento"),
        (("sintoma", "fiebre", "dolor", "nausea", "vomito"), "/paciente/sintomas"),
        (("tratamiento", "indicacion", "cuidado"), "/paciente/tratamiento"),
        (("documento", "examen", "archivo", "pdf", "resultado"), "/paciente/documentos"),
        (("cita", "consulta", "control", "perfil", "inicio"), "/paciente/inicio"),
    )
    return next((ruta for palabras, ruta in reglas if any(palabra in consulta for palabra in palabras)), "")


def _validar_ruta(valor, mensaje: str) -> str:
    candidata = str(valor or "").strip().lower().rstrip("/")
    candidata = ALIAS_RUTAS.get(candidata, candidata)
    if candidata in RUTAS_PACIENTE:
        return candidata
    return _ruta_por_intencion(mensaje)


def _respuesta_respaldo(mensaje: str, contexto: dict) -> tuple[str, str]:
    ruta = _ruta_por_intencion(mensaje)
    consulta = _normalizar_texto(mensaje)
    if ruta == "/paciente/medicamento":
        medicamentos = contexto["medicacionHoy"]
        if not medicamentos:
            return "No encuentro dosis programadas para hoy. Puedes revisar la sección Medicación.", ruta
        detalle = "; ".join(
            f'{item["medicamento"]} {item["dosis"]} a las {item["hora"]} ({item["estado"]})'
            for item in medicamentos[:4]
        )
        return f"Para hoy figura: {detalle}. Sigue siempre la indicación registrada por tu médico.", ruta
    if "cita" in consulta or "consulta" in consulta or "control" in consulta:
        cita = contexto["proximaCita"]
        if not cita:
            return "No encuentro una próxima cita registrada. Puedes revisar Inicio o consultarlo con el hospital.", "/paciente/inicio"
        return (
            f'Tu próxima cita figura para el {cita["fecha"]} a las {cita["hora"]}, '
            f'en {cita["sede"]}.',
            "/paciente/inicio",
        )
    if ruta == "/paciente/tratamiento":
        plan = contexto["tratamientoVigente"]
        if not plan:
            return "No encuentro un tratamiento vigente registrado. Consulta al hospital si esperabas una indicación.", ruta
        return f'El tratamiento vigente es "{plan["nombre"]}". Puedes consultar todas sus indicaciones en Tratamiento.', ruta
    if ruta == "/paciente/sintomas":
        return "Puedes registrar lo que sientes en Síntomas. Ante una emergencia, comunícate de inmediato con el hospital.", ruta
    if ruta == "/paciente/documentos":
        return "Puedes subir y revisar tus exámenes en la sección Documentos.", ruta
    return (
        "Puedo ayudarte a encontrar tu medicación, próxima cita, tratamiento, síntomas o documentos. ¿Qué deseas consultar?",
        "",
    )


def _respuesta_segura_obligatoria(mensaje: str, contexto: dict) -> tuple[str, str] | None:
    consulta = _normalizar_texto(mensaje)
    emergencias = (
        "no puede respirar",
        "no puedo respirar",
        "dificultad para respirar",
        "convulsion",
        "desmayo",
        "sangrado abundante",
        "inconsciente",
    )
    if any(frase in consulta for frase in emergencias):
        return (
            "Esto puede requerir atención inmediata. Comunícate ahora con el hospital o el servicio de emergencias; no esperes una respuesta de la aplicación.",
            "/paciente/sintomas",
        )
    consulta_medicacion = any(
        palabra in consulta for palabra in ("medicamento", "medicacion", "pastilla", "dosis", "tomar")
    )
    if consulta_medicacion and not contexto["medicacionHoy"]:
        return "No encuentro dosis programadas para hoy. Puedes revisar la sección Medicación.", "/paciente/medicamento"
    if any(palabra in consulta for palabra in ("cita", "consulta", "control")) and not contexto["proximaCita"]:
        return (
            "No encuentro una próxima cita registrada. Puedes revisar Inicio o consultarlo con el hospital.",
            "/paciente/inicio",
        )
    if "tratamiento" in consulta and not contexto["tratamientoVigente"]:
        return (
            "No encuentro un tratamiento vigente registrado. Consulta al hospital si esperabas una indicación.",
            "/paciente/tratamiento",
        )
    cambios_medicacion = (
        "puedo tomar",
        "debo tomar",
        "dejo de tomar",
        "dejar de tomar",
        "cambiar dosis",
        "aumentar dosis",
        "reducir dosis",
    )
    if any(frase in consulta for frase in cambios_medicacion):
        return (
            "No puedo indicar ni cambiar medicamentos. Revisa la prescripción registrada y consulta a tu médico antes de hacer cualquier cambio.",
            "/paciente/medicamento",
        )
    return None


def _marcar_dosis_por_mensaje(*, paciente: Paciente, usuario, mensaje: str) -> tuple[str, str] | None:
    consulta = _normalizar_texto(mensaje)
    accion_toma = any(
        frase in consulta
        for frase in (
            "ya la tome",
            "ya lo tome",
            "la tome",
            "lo tome",
            "marcar tomada",
            "marcala como tomada",
            "marcalo como tomado",
            "listo",
            "cumpli",
        )
    )
    if not accion_toma or any(frase in consulta for frase in ("tarde", "no la tome", "no lo tome", "no tome")):
        return None
    _, inicio, fin = _limites_hoy()
    dosis = (
        DosisProgramada.objects.filter(
            prescripcion__paciente=paciente,
            programada_para__gte=inicio,
            programada_para__lt=fin,
            estado=DosisProgramada.Estado.PENDIENTE,
        )
        .select_related("prescripcion__medicamento")
        .order_by("programada_para")
        .first()
    )
    if not dosis:
        return (
            "No encuentro dosis pendientes para marcar como tomada hoy. Puedes revisar Medicacion para confirmar tus horarios.",
            "/paciente/medicamento",
        )
    reporte = registrar_reporte_dosis(
        dosis_programada=dosis,
        reportada_por=usuario,
        respuesta=ReporteDosis.Respuesta.TOMADA,
        motivo_no_toma="",
        observacion="Registrado desde el asistente del paciente.",
        ocurrida_en=timezone.now(),
        origen=ReporteDosis.Origen.APP,
    )
    hora = timezone.localtime(dosis.programada_para).strftime("%H:%M")
    nombre = dosis.prescripcion.medicamento.nombre_generico
    return (
        f"Listo, marque {nombre} de las {hora} como tomada. Puedes verlo actualizado en Medicacion.",
        "/paciente/medicamento",
    )


def _es_tema_permitido(mensaje: str) -> bool:
    consulta = _normalizar_texto(mensaje)
    palabras = (
        "medicamento",
        "medicacion",
        "pastilla",
        "dosis",
        "tomar",
        "cita",
        "consulta",
        "control",
        "tratamiento",
        "indicacion",
        "sintoma",
        "fiebre",
        "dolor",
        "nausea",
        "vomito",
        "documento",
        "examen",
        "archivo",
        "pdf",
        "resultado",
        "cuenta",
        "perfil",
        "contrasena",
        "foto",
        "inicio",
        "hemoruta",
        "app",
        "portal",
        "subir",
        "registrar",
        "guardar",
        "listo",
        "tomada",
    )
    salud_general = ("me siento", "tengo", "me duele", "sangrado", "cansancio", "malestar")
    tokens = set(re.findall(r"[a-z0-9]+", consulta))
    return any(palabra in tokens for palabra in palabras) or any(frase in consulta for frase in salud_general)


def consultar_asistente_paciente(*, paciente: Paciente, mensaje: str, ruta_actual: str, usuario) -> dict:
    contexto = construir_contexto_asistente(paciente)
    accion = _marcar_dosis_por_mensaje(paciente=paciente, usuario=usuario, mensaje=mensaje)
    if accion:
        respuesta, ruta = accion
        return {
            "respuesta": respuesta,
            "rutaSugerida": ruta,
            "etiquetaRuta": RUTAS_PACIENTE[ruta],
            "iaDisponible": True,
            "accionEjecutada": "MARCAR_DOSIS_TOMADA" if "marque" in respuesta.lower() else None,
        }
    if not _es_tema_permitido(mensaje):
        return {
            "respuesta": (
                "Puedo ayudarte con tu cuenta de HemoRuta, medicacion, citas, sintomas, tratamiento o documentos. "
                "Para otros temas, consulta con el personal del hospital."
            ),
            "rutaSugerida": None,
            "etiquetaRuta": None,
            "iaDisponible": True,
        }
    respuesta_obligatoria = _respuesta_segura_obligatoria(mensaje, contexto)
    if respuesta_obligatoria:
        respuesta, ruta = respuesta_obligatoria
        return {
            "respuesta": respuesta,
            "rutaSugerida": ruta,
            "etiquetaRuta": RUTAS_PACIENTE[ruta],
            "iaDisponible": True,
        }
    try:
        resultado = obtener_cliente_asistente_paciente().responder(
            mensaje=mensaje,
            ruta_actual=ruta_actual,
            contexto=contexto,
        )
        respuesta = re.sub(r"\s+", " ", str(resultado.get("respuesta", ""))).strip()[:1200]
        if not respuesta:
            raise ErrorProveedorIA("Respuesta vacía")
        ruta = _validar_ruta(resultado.get("rutaSugerida"), mensaje)
        disponible = True
    except ErrorProveedorIA:
        respuesta, ruta = _respuesta_respaldo(mensaje, contexto)
        disponible = False
    return {
        "respuesta": respuesta,
        "rutaSugerida": ruta or None,
        "etiquetaRuta": RUTAS_PACIENTE.get(ruta, "") if ruta else None,
        "iaDisponible": disponible,
    }
