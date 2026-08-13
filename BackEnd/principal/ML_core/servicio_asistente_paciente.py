from __future__ import annotations

import re
import unicodedata
from datetime import datetime, time, timedelta

from django.db.models import Prefetch, Q
from django.utils import timezone

from citas.models import Cita
from clinica.models import PlanTratamiento
from documentos.models import DocumentoPaciente
from medicacion.models import DiaHorarioPrescripcion, DosisProgramada, Prescripcion, ReporteDosis
from medicacion.services import registrar_reporte_dosis
from pacientes.models import Paciente
from seguimiento.models import ReporteSintomas

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
                "dosisId": str(item.id),
                "medicamento": item.prescripcion.medicamento.nombre_generico,
                "dosis": _texto_dosis(item.prescripcion),
                "fecha": timezone.localtime(item.programada_para).date().isoformat(),
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
                    "fecha": hoy.isoformat(),
                    "hora": horario.hora.strftime("%H:%M") if horario.hora else prescripcion.frecuencia_texto,
                    "estado": "Pendiente",
                }
            )
    return resultado


def _contexto_medicacion_proxima(paciente: Paciente) -> list[dict]:
    _, inicio, _ = _limites_hoy()
    fin = inicio + timedelta(days=8)
    dosis = (
        DosisProgramada.objects.filter(
            prescripcion__paciente=paciente,
            programada_para__gte=inicio,
            programada_para__lt=fin,
        )
        .exclude(estado=DosisProgramada.Estado.CANCELADA)
        .select_related("prescripcion__medicamento")
        .order_by("programada_para")[:40]
    )
    return [
        {
            "medicamento": item.prescripcion.medicamento.nombre_generico,
            "dosis": _texto_dosis(item.prescripcion),
            "fecha": timezone.localtime(item.programada_para).date().isoformat(),
            "hora": timezone.localtime(item.programada_para).strftime("%H:%M"),
            "estado": item.get_estado_display(),
        }
        for item in dosis
    ]


def _contexto_sintomas_recientes(paciente: Paciente) -> list[dict]:
    reportes = (
        ReporteSintomas.objects.filter(paciente=paciente)
        .prefetch_related("sintomas")
        .order_by("-observado_en")[:5]
    )
    return [
        {
            "fecha": timezone.localtime(reporte.observado_en).isoformat(),
            "sintomas": [sintoma.nombre for sintoma in reporte.sintomas.all()],
            "intensidad": reporte.get_intensidad_display(),
            "evolucion": reporte.get_evolucion_display(),
            "descripcion": reporte.descripcion,
        }
        for reporte in reportes
    ]


def _contexto_documentos_recientes(paciente: Paciente) -> list[dict]:
    documentos = DocumentoPaciente.objects.filter(paciente=paciente).order_by("-fecha_documento", "-creado_en")[:5]
    return [
        {
            "titulo": documento.titulo,
            "tipo": documento.get_tipo_display(),
            "fecha": documento.fecha_documento.isoformat() if documento.fecha_documento else "",
            "estado": documento.get_estado_display(),
        }
        for documento in documentos
    ]


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
        "paciente": {
            "nombre": paciente.nombre_completo,
            "edad": paciente.edad,
            "estado": paciente.get_estado_display(),
        },
        "fechaActual": timezone.localdate().isoformat(),
        "medicacionHoy": _contexto_medicacion(paciente),
        "medicacionProximosDias": _contexto_medicacion_proxima(paciente),
        "proximaCita": cita,
        "tratamientoVigente": tratamiento,
        "sintomasRecientes": _contexto_sintomas_recientes(paciente),
        "documentosRecientes": _contexto_documentos_recientes(paciente),
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
        fecha_consulta = contexto["fechaActual"]
        if "manana" in consulta:
            fecha_consulta = (timezone.localdate() + timedelta(days=1)).isoformat()
        medicamentos = (
            [item for item in contexto["medicacionProximosDias"] if item["fecha"] == fecha_consulta]
            if fecha_consulta != contexto["fechaActual"]
            else contexto["medicacionHoy"]
        )
        if not medicamentos:
            periodo = "mañana" if fecha_consulta != contexto["fechaActual"] else "hoy"
            return f"No encuentro dosis programadas para {periodo}. Puedes revisar la sección Medicación.", ruta
        detalle = "; ".join(
            f'{item["medicamento"]} {item["dosis"]} a las {item["hora"]} ({item["estado"]})'
            for item in medicamentos[:4]
        )
        periodo = "mañana" if fecha_consulta != contexto["fechaActual"] else "hoy"
        return f"Para {periodo} figura: {detalle}. Sigue siempre la indicación registrada por tu médico.", ruta
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
        recientes = contexto["sintomasRecientes"]
        if recientes and any(palabra in consulta for palabra in ("ultimo", "reciente", "registre", "registrado")):
            ultimo = recientes[0]
            nombres = ", ".join(ultimo["sintomas"]) or "síntomas sin detalle"
            return (
                f'Tu último registro indica {nombres}, intensidad {ultimo["intensidad"].lower()} '
                f'y evolución {ultimo["evolucion"].lower()}.',
                ruta,
            )
        return "Puedes registrar lo que sientes en Síntomas. Ante una emergencia, comunícate de inmediato con el hospital.", ruta
    if ruta == "/paciente/documentos":
        documentos = contexto["documentosRecientes"]
        if documentos and any(palabra in consulta for palabra in ("ultimo", "reciente", "cual", "ver")):
            detalle = "; ".join(
                f'{item["titulo"]} ({item["fecha"] or item["estado"]})' for item in documentos[:3]
            )
            return f"Tus documentos recientes son: {detalle}. Puedes abrirlos en Documentos.", ruta
        return "Puedes subir y revisar tus exámenes en la sección Documentos.", ruta
    if any(palabra in consulta for palabra in ("cuenta", "perfil", "contrasena", "foto")):
        return "Puedes actualizar tu foto o contraseña desde Inicio, en las opciones de tu perfil.", "/paciente/inicio"
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
        "dolor intenso",
        "dolor muy fuerte",
        "vomitos repetidos",
        "vomita todo",
        "labios morados",
        "inconsciente",
    )
    temperatura = re.search(r"(?:fiebre|temperatura)[^0-9]{0,12}(\d{2}(?:[.,]\d)?)", consulta)
    fiebre_alarma = bool(temperatura and float(temperatura.group(1).replace(",", ".")) >= 38)
    if any(frase in consulta for frase in emergencias) or "fiebre alta" in consulta or fiebre_alarma:
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
        "debo dejar",
        "debo tomar mas",
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


def _intencion_reporte_dosis(consulta: str) -> tuple[str, str] | None:
    if any(
        frase in consulta
        for frase in ("no la tome", "no lo tome", "no tome", "no pude tomar", "olvide tomar", "se me olvido")
    ):
        if any(frase in consulta for frase in ("no habia", "se termino", "sin medicamento")):
            motivo = ReporteDosis.MotivoNoToma.SIN_MEDICAMENTO
        elif any(frase in consulta for frase in ("malestar", "me hizo mal", "me senti mal")):
            motivo = ReporteDosis.MotivoNoToma.MALESTAR
        elif any(frase in consulta for frase in ("olvide", "se me olvido")):
            motivo = ReporteDosis.MotivoNoToma.OLVIDO
        else:
            motivo = ReporteDosis.MotivoNoToma.OTRO
        return ReporteDosis.Respuesta.NO_TOMADA, motivo
    if (
        "tarde" in consulta
        and any(palabra in consulta for palabra in ("tome", "tomada", "tomado"))
    ) or "con retraso" in consulta:
        return ReporteDosis.Respuesta.TARDE, ""
    if any(
        frase in consulta
        for frase in (
            "ya la tome",
            "ya lo tome",
            "la tome",
            "lo tome",
            "marcar tomada",
            "marcar como tomada",
            "marcala como tomada",
            "marcalo como tomado",
            "cumpli la dosis",
        )
    ):
        return ReporteDosis.Respuesta.TOMADA, ""
    return None


def _seleccionar_dosis_mencionada(dosis: list[DosisProgramada], consulta: str) -> list[DosisProgramada]:
    nombres_mencionados = [
        item
        for item in dosis
        if _normalizar_texto(item.prescripcion.medicamento.nombre_generico) in consulta
    ]
    candidatas = nombres_mencionados or dosis
    hora_mencionada = re.search(
        r"(?:\b(?:a|de)\s+las\s+)?\b([01]?\d|2[0-3])(?::([0-5]\d))\b",
        consulta,
    )
    if hora_mencionada:
        hora = int(hora_mencionada.group(1))
        minuto = int(hora_mencionada.group(2) or 0)
        candidatas = [
            item
            for item in candidatas
            if timezone.localtime(item.programada_para).hour == hora
            and timezone.localtime(item.programada_para).minute == minuto
        ]
    return candidatas


def _marcar_dosis_por_mensaje(*, paciente: Paciente, usuario, mensaje: str) -> dict | None:
    consulta = _normalizar_texto(mensaje)
    intencion = _intencion_reporte_dosis(consulta)
    if not intencion:
        return None
    respuesta_dosis, motivo_no_toma = intencion
    _, inicio, fin = _limites_hoy()
    pendientes = list(
        DosisProgramada.objects.filter(
            prescripcion__paciente=paciente,
            programada_para__gte=inicio,
            programada_para__lt=fin,
            estado=DosisProgramada.Estado.PENDIENTE,
        )
        .select_related("prescripcion__medicamento")
        .order_by("programada_para")
    )
    if not pendientes:
        return {
            "respuesta": "No encuentro dosis pendientes para reportar hoy. Puedes revisar Medicación para confirmar tus horarios.",
            "ruta": "/paciente/medicamento",
            "accion": None,
        }
    candidatas = _seleccionar_dosis_mencionada(pendientes, consulta)
    if not candidatas:
        return {
            "respuesta": "No encuentro una dosis pendiente que coincida con ese medicamento u horario. Revísala en Medicación.",
            "ruta": "/paciente/medicamento",
            "accion": None,
        }
    if len(candidatas) > 1:
        opciones = "; ".join(
            f"{item.prescripcion.medicamento.nombre_generico} de las "
            f"{timezone.localtime(item.programada_para).strftime('%H:%M')}"
            for item in candidatas[:4]
        )
        return {
            "respuesta": f"Tienes más de una dosis pendiente: {opciones}. Dime el medicamento o la hora para confirmar cuál deseas reportar.",
            "ruta": "/paciente/medicamento",
            "accion": None,
        }
    dosis = candidatas[0]
    registrar_reporte_dosis(
        dosis_programada=dosis,
        reportada_por=usuario,
        respuesta=respuesta_dosis,
        motivo_no_toma=motivo_no_toma,
        observacion="Registrado desde el asistente del paciente.",
        ocurrida_en=timezone.now(),
        origen=ReporteDosis.Origen.APP,
    )
    hora = timezone.localtime(dosis.programada_para).strftime("%H:%M")
    nombre = dosis.prescripcion.medicamento.nombre_generico
    estado_texto = {
        ReporteDosis.Respuesta.TOMADA: "tomada",
        ReporteDosis.Respuesta.TARDE: "tomada tarde",
        ReporteDosis.Respuesta.NO_TOMADA: "no tomada",
    }[respuesta_dosis]
    accion = {
        ReporteDosis.Respuesta.TOMADA: "MARCAR_DOSIS_TOMADA",
        ReporteDosis.Respuesta.TARDE: "MARCAR_DOSIS_TARDE",
        ReporteDosis.Respuesta.NO_TOMADA: "MARCAR_DOSIS_NO_TOMADA",
    }[respuesta_dosis]
    return {
        "respuesta": f"Listo, marqué {nombre} de las {hora} como {estado_texto}. Puedes verlo actualizado en Medicación.",
        "ruta": "/paciente/medicamento",
        "accion": accion,
    }


def _es_tema_permitido(mensaje: str) -> bool:
    consulta = _normalizar_texto(mensaje)
    palabras = (
        "medicamento",
        "medicamentos",
        "medicacion",
        "pastilla",
        "pastillas",
        "dosis",
        "tomar",
        "cita",
        "consulta",
        "control",
        "tratamiento",
        "indicacion",
        "sintoma",
        "sintomas",
        "fiebre",
        "dolor",
        "nausea",
        "vomito",
        "documento",
        "documentos",
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
        "hospital",
        "emergencia",
        "manana",
    )
    salud_general = ("me siento", "tengo", "me duele", "sangrado", "cansancio", "malestar")
    tokens = set(re.findall(r"[a-z0-9]+", consulta))
    return any(palabra in tokens for palabra in palabras) or any(frase in consulta for frase in salud_general)


def consultar_asistente_paciente(*, paciente: Paciente, mensaje: str, ruta_actual: str, usuario) -> dict:
    contexto = construir_contexto_asistente(paciente)
    accion = _marcar_dosis_por_mensaje(paciente=paciente, usuario=usuario, mensaje=mensaje)
    if accion:
        ruta = accion["ruta"]
        return {
            "respuesta": accion["respuesta"],
            "rutaSugerida": ruta,
            "etiquetaRuta": RUTAS_PACIENTE[ruta],
            "iaDisponible": True,
            "accionEjecutada": accion["accion"],
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
