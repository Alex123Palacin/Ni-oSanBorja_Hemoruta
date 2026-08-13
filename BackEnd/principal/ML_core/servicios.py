from __future__ import annotations

from datetime import datetime, time, timedelta
from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_time
from rest_framework.exceptions import ValidationError

from citas.models import Cita
from clinica.models import (
    ConsultaClinica,
    ItemPlanTratamiento,
    ItemSeccionConsulta,
    PlanTratamiento,
    SeccionConsulta,
)
from medicacion.models import (
    DiaHorarioPrescripcion,
    DosisProgramada,
    HorarioPrescripcion,
    Medicamento,
    Prescripcion,
)
from seguimiento.models import EventoSeguimiento

from .esquemas import (
    CLAVES_PREGUNTAS,
    ETIQUETAS_SECCIONES,
    combinar_estructura,
    clave_siguiente_pregunta,
    detectar_instruccion_seccion,
    detectar_omision_seccion,
    es_comando_siguiente,
    es_confirmacion_afirmativa,
    es_confirmacion_negativa,
    es_duda_del_medico,
    es_peticion_volver_preguntas,
    estructura_lista,
    normalizar_texto_intencion,
    normalizar_estructura,
    normalizar_preguntas_omitidas,
    siguiente_pregunta,
    validar_para_publicar,
)
from .models import SesionConsultaVoz
from .proveedores import ErrorProveedorIA, obtener_cliente_ollama


PREGUNTA_INICIAL = "¿Cuál es el motivo de consulta?"

SECCIONES_TEXTO = {
    "motivoConsulta",
    "evolucionClinica",
    "tratamientoIndicado",
    "indicacionesCasa",
}


def _confirmacion_pendiente(intervenciones: list[dict]) -> tuple[int, dict] | None:
    for indice in range(len(intervenciones) - 1, -1, -1):
        intervencion = intervenciones[indice]
        if intervencion.get("tipo") == "confirmacion" and intervencion.get("estado") == "PENDIENTE":
            return indice, intervencion
    return None


def _ultima_pregunta_adicional(intervenciones: list[dict]) -> dict | None:
    for intervencion in reversed(intervenciones):
        if intervencion.get("rol") == "IA" and intervencion.get("tipo") == "pregunta":
            return intervencion if intervencion.get("adicional") else None
    return None


def _ultima_respuesta_clinica(intervenciones: list[dict]) -> str:
    for intervencion in reversed(intervenciones):
        if intervencion.get("rol") == "MEDICO" and intervencion.get("tipo") == "dato_clinico":
            return str(intervencion.get("texto", "")).strip()
    return ""


def _valor_vacio_seccion(clave: str):
    if clave == "medicacionIndicada":
        return []
    if clave == "proximoControl":
        return {"fecha": "", "hora": "", "detalle": ""}
    return ""


def _seccion_tiene_datos(estructura: dict, clave: str) -> bool:
    valor = normalizar_estructura(estructura).get(clave)
    if isinstance(valor, dict):
        return any(valor.values())
    return bool(valor)


def _resumen_valor_confirmacion(valor: object) -> str:
    if isinstance(valor, str):
        return valor
    if isinstance(valor, list):
        nombres = [str(item.get("nombre", "")).strip() for item in valor if isinstance(item, dict)]
        return ", ".join(nombre for nombre in nombres if nombre) or "la medicación ya registrada"
    if isinstance(valor, dict):
        partes = [str(valor.get(clave, "")).strip() for clave in ("fecha", "hora", "detalle")]
        return " ".join(parte for parte in partes if parte) or "el control ya registrado"
    return ""


def _propuesta_referencia_ambigua(sesion: SesionConsultaVoz, clave: str) -> dict | None:
    estructura = normalizar_estructura(sesion.datos_estructurados)
    valor_actual = estructura.get(clave)
    if (
        valor_actual
        and (not isinstance(valor_actual, dict) or any(valor_actual.values()))
        and clave_siguiente_pregunta(estructura, []) != clave
    ):
        return {"seccion": clave, "cambios": {clave: valor_actual}}
    anterior = _ultima_respuesta_clinica(sesion.intervenciones)
    if anterior:
        return {"seccion": clave, "contenido": anterior}
    return None


def _pregunta_adicional_desde_resultado(
    resultado: object,
    intervenciones: list[dict],
) -> tuple[str, str] | None:
    if not isinstance(resultado, dict):
        return None
    adicional = resultado.get("preguntaAdicional")
    if not isinstance(adicional, dict):
        return None
    seccion = str(adicional.get("seccion", "")).strip()
    pregunta = " ".join(str(adicional.get("pregunta", "")).split()).strip()
    if seccion not in CLAVES_PREGUNTAS or not pregunta or len(pregunta) > 240:
        return None
    if "?" not in pregunta:
        pregunta = f"{pregunta.rstrip('.')}?"
    if sum(
        bool(item.get("rol") == "IA" and item.get("adicional") and item.get("seccion") == seccion)
        for item in intervenciones
    ) >= 2:
        return None
    pregunta_normalizada = normalizar_texto_intencion(pregunta)
    if any(
        item.get("rol") == "IA"
        and normalizar_texto_intencion(str(item.get("texto", ""))) == pregunta_normalizada
        for item in intervenciones
    ):
        return None
    return seccion, pregunta


def _estructura_desde_instruccion(
    *,
    sesion: SesionConsultaVoz,
    seccion: str,
    contenido: str,
) -> tuple[dict, dict, bool]:
    estructura_actual = normalizar_estructura(sesion.datos_estructurados)
    intervenciones_clinicas = [
        item
        for item in sesion.intervenciones
        if (item.get("rol") == "IA" and item.get("tipo", "pregunta") == "pregunta")
        or (item.get("rol") == "MEDICO" and item.get("tipo", "dato_clinico") == "dato_clinico")
    ]
    intervenciones_clinicas.append(
        {"rol": "MEDICO", "texto": contenido, "tipo": "dato_clinico", "seccionObjetivo": seccion}
    )
    resultado: dict = {}
    try:
        resultado = obtener_cliente_ollama().estructurar(
            datos_actuales=estructura_actual,
            intervenciones=intervenciones_clinicas,
            pregunta_actual=f"Registre únicamente {ETIQUETAS_SECCIONES[seccion]}.",
            preguntas_omitidas=normalizar_preguntas_omitidas(sesion.preguntas_omitidas),
            seccion_objetivo=seccion,
        )
        secciones = resultado.get("secciones", {}) if isinstance(resultado, dict) else {}
        if isinstance(secciones, dict) and seccion in secciones:
            return combinar_estructura(estructura_actual, {seccion: secciones[seccion]}), resultado, True
    except ErrorProveedorIA:
        pass
    if seccion in SECCIONES_TEXTO:
        return combinar_estructura(estructura_actual, {seccion: contenido}), resultado, False
    return estructura_actual, resultado, False


@transaction.atomic
def crear_sesion(*, paciente, medico) -> SesionConsultaVoz:
    consulta = ConsultaClinica.objects.create(
        paciente=paciente,
        medico=medico,
        titulo="Consulta por voz",
        origen=ConsultaClinica.Origen.VOZ,
        estado=ConsultaClinica.Estado.BORRADOR,
    )
    ahora = timezone.now().isoformat()
    return SesionConsultaVoz.objects.create(
        consulta=consulta,
        pregunta_actual=PREGUNTA_INICIAL,
        intervenciones=[
            {
                "rol": "IA",
                "texto": PREGUNTA_INICIAL,
                "fecha": ahora,
                "tipo": "pregunta",
                "seccion": "motivoConsulta",
            }
        ],
    )


@transaction.atomic
def incorporar_respuesta(*, sesion: SesionConsultaVoz, texto: str) -> SesionConsultaVoz:
    sesion = SesionConsultaVoz.objects.select_for_update().get(pk=sesion.pk)
    texto = texto.strip()
    if not texto:
        raise ValidationError({"texto": "La transcripción está vacía."})
    if len(texto) > 12000:
        raise ValidationError({"texto": "La transcripción no puede superar 12000 caracteres."})
    if sesion.estado == SesionConsultaVoz.Estado.PUBLICADO:
        raise ValidationError({"detalle": "La consulta ya fue publicada."})

    ahora = timezone.now()
    estructura_actual = normalizar_estructura(sesion.datos_estructurados)

    confirmacion = _confirmacion_pendiente(sesion.intervenciones)
    if confirmacion:
        indice_confirmacion, pendiente = confirmacion
        if es_confirmacion_afirmativa(texto):
            intervenciones = [dict(item) for item in sesion.intervenciones]
            intervenciones[indice_confirmacion] = {**pendiente, "estado": "CONFIRMADA"}
            propuesta = pendiente.get("propuesta", {})
            seccion = str(propuesta.get("seccion", ""))
            resultado: dict = {}
            ia_disponible = True
            if isinstance(propuesta.get("cambios"), dict):
                estructura = combinar_estructura(estructura_actual, propuesta["cambios"])
            else:
                estructura, resultado, ia_disponible = _estructura_desde_instruccion(
                    sesion=sesion,
                    seccion=seccion,
                    contenido=str(propuesta.get("contenido", "")),
                )
            omitidas = normalizar_preguntas_omitidas(sesion.preguntas_omitidas)
            if _seccion_tiene_datos(estructura, seccion) and seccion in omitidas:
                omitidas.remove(seccion)
            pregunta = siguiente_pregunta(estructura, omitidas)
            estado = (
                SesionConsultaVoz.Estado.LISTO
                if estructura_lista(estructura, omitidas)
                else SesionConsultaVoz.Estado.BORRADOR
            )
            intervenciones.extend(
                [
                    {"rol": "MEDICO", "texto": texto, "fecha": ahora.isoformat(), "tipo": "control"},
                    {
                        "rol": "IA",
                        "texto": f"Confirmado. Actualicé {ETIQUETAS_SECCIONES.get(seccion, 'la sección')}.",
                        "fecha": ahora.isoformat(),
                        "tipo": "confirmacion_resuelta",
                    },
                    {"rol": "IA", "texto": pregunta, "fecha": ahora.isoformat(), "tipo": "pregunta"},
                ]
            )
            SesionConsultaVoz.objects.filter(pk=sesion.pk).update(
                datos_estructurados=estructura,
                preguntas_omitidas=omitidas,
                pregunta_actual=pregunta,
                intervenciones=intervenciones,
                estado=estado,
                ia_disponible=ia_disponible,
                mensaje_ia=(
                    "Cambio confirmado e incorporado al resumen clínico."
                    if ia_disponible or _seccion_tiene_datos(estructura, seccion)
                    else "No pude interpretar el cambio. Indíquelo nuevamente con más detalle."
                ),
                actualizado_en=ahora,
            )
            return SesionConsultaVoz.objects.select_related("consulta__paciente").get(pk=sesion.pk)
        if es_confirmacion_negativa(texto):
            intervenciones = [dict(item) for item in sesion.intervenciones]
            intervenciones[indice_confirmacion] = {**pendiente, "estado": "CANCELADA"}
            seccion = str(pendiente.get("propuesta", {}).get("seccion", ""))
            pregunta = f"De acuerdo. ¿Qué desea registrar en {ETIQUETAS_SECCIONES.get(seccion, 'esa sección')}?"
            intervenciones.extend(
                [
                    {"rol": "MEDICO", "texto": texto, "fecha": ahora.isoformat(), "tipo": "control"},
                    {"rol": "IA", "texto": pregunta, "fecha": ahora.isoformat(), "tipo": "pregunta"},
                ]
            )
            SesionConsultaVoz.objects.filter(pk=sesion.pk).update(
                pregunta_actual=pregunta,
                intervenciones=intervenciones,
                ia_disponible=True,
                mensaje_ia="Cambio cancelado; indique el contenido correcto.",
                actualizado_en=ahora,
            )
            return SesionConsultaVoz.objects.select_related("consulta__paciente").get(pk=sesion.pk)
        intervenciones = [dict(item) for item in sesion.intervenciones]
        intervenciones[indice_confirmacion] = {**pendiente, "estado": "REEMPLAZADA"}
        sesion.intervenciones = intervenciones

    if es_peticion_volver_preguntas(texto):
        pregunta = siguiente_pregunta(estructura_actual, sesion.preguntas_omitidas)
        intervenciones = [
            *sesion.intervenciones,
            {"rol": "MEDICO", "texto": texto, "fecha": ahora.isoformat(), "tipo": "control"},
            {"rol": "IA", "texto": pregunta, "fecha": ahora.isoformat(), "tipo": "pregunta"},
        ]
        SesionConsultaVoz.objects.filter(pk=sesion.pk).update(
            pregunta_actual=pregunta,
            intervenciones=intervenciones,
            ia_disponible=True,
            mensaje_ia="Retomando la entrevista.",
            actualizado_en=ahora,
        )
        return SesionConsultaVoz.objects.select_related("consulta__paciente").get(pk=sesion.pk)

    seccion_omitida = detectar_omision_seccion(texto)
    if seccion_omitida:
        omitidas = normalizar_preguntas_omitidas(sesion.preguntas_omitidas)
        if seccion_omitida not in omitidas:
            omitidas.append(seccion_omitida)
        estructura = combinar_estructura(
            estructura_actual,
            {seccion_omitida: _valor_vacio_seccion(seccion_omitida)},
        )
        pregunta = siguiente_pregunta(estructura, omitidas)
        estado = (
            SesionConsultaVoz.Estado.LISTO
            if estructura_lista(estructura, omitidas)
            else SesionConsultaVoz.Estado.BORRADOR
        )
        intervenciones = [
            *sesion.intervenciones,
            {
                "rol": "MEDICO",
                "texto": texto,
                "fecha": ahora.isoformat(),
                "tipo": "control",
                "seccion": seccion_omitida,
            },
            {"rol": "IA", "texto": pregunta, "fecha": ahora.isoformat(), "tipo": "pregunta"},
        ]
        SesionConsultaVoz.objects.filter(pk=sesion.pk).update(
            datos_estructurados=estructura,
            preguntas_omitidas=omitidas,
            pregunta_actual=pregunta,
            intervenciones=intervenciones,
            estado=estado,
            ia_disponible=True,
            mensaje_ia=f"Se registró que no aplica {ETIQUETAS_SECCIONES[seccion_omitida]}.",
            actualizado_en=ahora,
        )
        return SesionConsultaVoz.objects.select_related("consulta__paciente").get(pk=sesion.pk)

    instruccion = detectar_instruccion_seccion(texto)
    if instruccion:
        seccion = str(instruccion["seccion"])
        contenido = str(instruccion["contenido"])
        if instruccion["ambigua"]:
            propuesta = _propuesta_referencia_ambigua(sesion, seccion)
            if propuesta:
                valor = propuesta.get("cambios", {}).get(seccion) or propuesta.get("contenido", "")
                resumen = _resumen_valor_confirmacion(valor)
                pregunta = (
                    f"¿Confirmo que {ETIQUETAS_SECCIONES[seccion]} quede como «{resumen[:180]}»?"
                )
                intervencion_ia = {
                    "rol": "IA",
                    "texto": pregunta,
                    "fecha": ahora.isoformat(),
                    "tipo": "confirmacion",
                    "estado": "PENDIENTE",
                    "propuesta": propuesta,
                }
                mensaje_ia = "Necesito su confirmación antes de modificar el resumen."
            else:
                pregunta = f"¿Qué contenido desea registrar en {ETIQUETAS_SECCIONES[seccion]}?"
                intervencion_ia = {
                    "rol": "IA",
                    "texto": pregunta,
                    "fecha": ahora.isoformat(),
                    "tipo": "pregunta",
                    "seccion": seccion,
                }
                mensaje_ia = "La referencia no era suficientemente clara; solicité el dato exacto."
            intervenciones = [
                *sesion.intervenciones,
                {
                    "rol": "MEDICO",
                    "texto": texto,
                    "fecha": ahora.isoformat(),
                    "tipo": "instruccion",
                    "seccion": seccion,
                },
                intervencion_ia,
            ]
            SesionConsultaVoz.objects.filter(pk=sesion.pk).update(
                pregunta_actual=pregunta,
                intervenciones=intervenciones,
                ia_disponible=True,
                mensaje_ia=mensaje_ia,
                actualizado_en=ahora,
            )
            return SesionConsultaVoz.objects.select_related("consulta__paciente").get(pk=sesion.pk)

        estructura, resultado, ia_disponible = _estructura_desde_instruccion(
            sesion=sesion,
            seccion=seccion,
            contenido=contenido,
        )
        omitidas = normalizar_preguntas_omitidas(sesion.preguntas_omitidas)
        if _seccion_tiene_datos(estructura, seccion) and seccion in omitidas:
            omitidas.remove(seccion)
        adicional = _pregunta_adicional_desde_resultado(resultado, sesion.intervenciones)
        pregunta = adicional[1] if adicional else siguiente_pregunta(estructura, omitidas)
        estado = (
            SesionConsultaVoz.Estado.BORRADOR
            if adicional
            else (
                SesionConsultaVoz.Estado.LISTO
                if estructura_lista(estructura, omitidas)
                else SesionConsultaVoz.Estado.BORRADOR
            )
        )
        intervencion_pregunta = {
            "rol": "IA",
            "texto": pregunta,
            "fecha": ahora.isoformat(),
            "tipo": "pregunta",
        }
        if adicional:
            intervencion_pregunta.update({"adicional": True, "seccion": adicional[0]})
        intervenciones = [
            *sesion.intervenciones,
            {
                "rol": "MEDICO",
                "texto": texto,
                "fecha": ahora.isoformat(),
                "tipo": "instruccion",
                "seccion": seccion,
            },
            intervencion_pregunta,
        ]
        SesionConsultaVoz.objects.filter(pk=sesion.pk).update(
            datos_estructurados=estructura,
            preguntas_omitidas=omitidas,
            pregunta_actual=pregunta,
            intervenciones=intervenciones,
            estado=estado,
            ia_disponible=ia_disponible,
            mensaje_ia=(
                f"Actualicé únicamente {ETIQUETAS_SECCIONES[seccion]}."
                if _seccion_tiene_datos(estructura, seccion)
                else f"Necesito más detalle para completar {ETIQUETAS_SECCIONES[seccion]}."
            ),
            actualizado_en=ahora,
        )
        return SesionConsultaVoz.objects.select_related("consulta__paciente").get(pk=sesion.pk)

    if es_comando_siguiente(texto):
        omitidas = normalizar_preguntas_omitidas(sesion.preguntas_omitidas)
        pregunta_adicional = _ultima_pregunta_adicional(sesion.intervenciones)
        clave_actual = clave_siguiente_pregunta(estructura_actual, omitidas)
        if not pregunta_adicional and clave_actual and clave_actual not in omitidas:
            omitidas.append(clave_actual)
        pregunta = siguiente_pregunta(estructura_actual, omitidas)
        estado = (
            SesionConsultaVoz.Estado.LISTO
            if estructura_lista(estructura_actual, omitidas)
            else SesionConsultaVoz.Estado.BORRADOR
        )
        intervenciones = [
            *sesion.intervenciones,
            {"rol": "MEDICO", "texto": texto, "fecha": ahora.isoformat(), "tipo": "control"},
            {"rol": "IA", "texto": pregunta, "fecha": ahora.isoformat(), "tipo": "pregunta"},
        ]
        SesionConsultaVoz.objects.filter(pk=sesion.pk).update(
            preguntas_omitidas=omitidas,
            pregunta_actual=pregunta,
            intervenciones=intervenciones,
            estado=estado,
            ia_disponible=True,
            mensaje_ia=(
                "Pregunta adicional omitida. La entrevista continúa con el siguiente punto."
                if pregunta_adicional
                else "Pregunta omitida. La entrevista continúa con el siguiente punto."
            ),
            actualizado_en=ahora,
        )
        return SesionConsultaVoz.objects.select_related("consulta__paciente").get(pk=sesion.pk)

    if es_duda_del_medico(texto):
        try:
            respuesta = obtener_cliente_ollama().orientar_medico(
                datos_actuales=estructura_actual,
                mensaje_medico=texto,
                pregunta_actual=sesion.pregunta_actual,
            )
        except ErrorProveedorIA:
            respuesta = (
                "Puede responder con los datos clinicos disponibles. Si falta informacion, indique dosis, "
                "frecuencia, duracion o control, y continuamos con la pregunta actual."
            )
        intervenciones = [
            *sesion.intervenciones,
            {"rol": "MEDICO", "texto": texto, "fecha": ahora.isoformat(), "tipo": "consulta"},
            {"rol": "IA", "texto": respuesta, "fecha": timezone.now().isoformat(), "tipo": "orientacion"},
            {"rol": "IA", "texto": sesion.pregunta_actual, "fecha": timezone.now().isoformat(), "tipo": "pregunta"},
        ]
        SesionConsultaVoz.objects.filter(pk=sesion.pk).update(
            intervenciones=intervenciones,
            ia_disponible=True,
            mensaje_ia="Orientacion del copiloto medico. La entrevista sigue en el mismo punto.",
            actualizado_en=timezone.now(),
        )
        return SesionConsultaVoz.objects.select_related("consulta__paciente").get(pk=sesion.pk)

    intervenciones = [
        *sesion.intervenciones,
        {"rol": "MEDICO", "texto": texto, "fecha": ahora.isoformat(), "tipo": "dato_clinico"},
    ]
    transcripcion = "\n".join(
        item["texto"]
        for item in intervenciones
        if item.get("rol") == "MEDICO"
        and item.get("tipo", "dato_clinico") == "dato_clinico"
        and item.get("texto")
    )
    SesionConsultaVoz.objects.filter(pk=sesion.pk).update(
        intervenciones=intervenciones,
        transcripcion=transcripcion,
        actualizado_en=ahora,
    )

    try:
        intervenciones_clinicas = [
            item
            for item in intervenciones
            if (item.get("rol") == "IA" and item.get("tipo", "pregunta") == "pregunta")
            or (item.get("rol") == "MEDICO" and item.get("tipo", "dato_clinico") == "dato_clinico")
        ]
        resultado = obtener_cliente_ollama().estructurar(
            datos_actuales=normalizar_estructura(sesion.datos_estructurados),
            intervenciones=intervenciones_clinicas,
            pregunta_actual=sesion.pregunta_actual,
            preguntas_omitidas=normalizar_preguntas_omitidas(sesion.preguntas_omitidas),
        )
        cambios = resultado.get("secciones", {}) if isinstance(resultado, dict) else {}
        estructura = combinar_estructura(sesion.datos_estructurados, cambios)
        adicional = _pregunta_adicional_desde_resultado(resultado, intervenciones)
        pregunta = adicional[1] if adicional else siguiente_pregunta(estructura, sesion.preguntas_omitidas)
        pregunta = pregunta[:300]
        estado = (
            SesionConsultaVoz.Estado.BORRADOR
            if adicional
            else (
                SesionConsultaVoz.Estado.LISTO
                if estructura_lista(estructura, sesion.preguntas_omitidas)
                else SesionConsultaVoz.Estado.BORRADOR
            )
        )
        if estado != SesionConsultaVoz.Estado.LISTO:
            intervencion_pregunta = {
                "rol": "IA",
                "texto": pregunta,
                "fecha": timezone.now().isoformat(),
                "tipo": "pregunta",
            }
            if adicional:
                intervencion_pregunta.update({"adicional": True, "seccion": adicional[0]})
            intervenciones.append(intervencion_pregunta)
        else:
            pregunta = "El resumen está listo. Revíselo y edítelo antes de guardarlo."
            intervenciones.append(
                {"rol": "IA", "texto": pregunta, "fecha": timezone.now().isoformat(), "tipo": "pregunta"}
            )
        SesionConsultaVoz.objects.filter(pk=sesion.pk).update(
            datos_estructurados=estructura,
            pregunta_actual=pregunta,
            intervenciones=intervenciones,
            estado=estado,
            ia_disponible=True,
            mensaje_ia="Respuesta incorporada al resumen clínico.",
            actualizado_en=timezone.now(),
        )
    except ErrorProveedorIA as exc:
        SesionConsultaVoz.objects.filter(pk=sesion.pk).update(
            ia_disponible=False,
            mensaje_ia=f"{exc} Puede completar el resumen manualmente.",
            actualizado_en=timezone.now(),
        )
    return SesionConsultaVoz.objects.select_related("consulta__paciente").get(pk=sesion.pk)


@transaction.atomic
def editar_estructura(*, sesion: SesionConsultaVoz, cambios: dict) -> SesionConsultaVoz:
    sesion = SesionConsultaVoz.objects.select_for_update().get(pk=sesion.pk)
    if sesion.estado == SesionConsultaVoz.Estado.PUBLICADO:
        raise ValidationError({"detalle": "La consulta publicada ya no se puede editar."})
    sesion.datos_estructurados = combinar_estructura(sesion.datos_estructurados, cambios)
    sesion.pregunta_actual = siguiente_pregunta(
        sesion.datos_estructurados,
        sesion.preguntas_omitidas,
    )
    sesion.estado = (
        SesionConsultaVoz.Estado.LISTO
        if estructura_lista(sesion.datos_estructurados, sesion.preguntas_omitidas)
        else SesionConsultaVoz.Estado.BORRADOR
    )
    sesion.save(update_fields=("datos_estructurados", "pregunta_actual", "estado", "actualizado_en"))
    return sesion


@transaction.atomic
def publicar_sesion(*, sesion: SesionConsultaVoz, cambios: dict | None = None) -> dict:
    sesion = SesionConsultaVoz.objects.select_for_update().select_related("consulta__paciente", "consulta__medico").get(
        pk=sesion.pk
    )
    if sesion.estado == SesionConsultaVoz.Estado.PUBLICADO:
        raise ValidationError({"detalle": "La consulta ya fue publicada."})
    if cambios is not None:
        sesion.datos_estructurados = combinar_estructura(sesion.datos_estructurados, cambios)
    datos = validar_para_publicar(sesion.datos_estructurados)
    consulta = sesion.consulta
    paciente = consulta.paciente
    medico = consulta.medico
    ahora = timezone.now()

    consulta.resumen = _resumen_consulta(datos)
    consulta.estado = ConsultaClinica.Estado.COMPLETADA
    consulta.completada_en = ahora
    consulta.save(update_fields=("resumen", "estado", "completada_en", "actualizado_en"))
    _crear_secciones(consulta, datos)
    plan = _crear_plan(paciente, medico, consulta, datos)
    prescripciones = _crear_prescripciones(paciente, medico, consulta, plan, datos["medicacionIndicada"])
    cita = _crear_proximo_control(paciente, medico, datos["proximoControl"])
    EventoSeguimiento.objects.create(
        paciente=paciente,
        tipo=EventoSeguimiento.Tipo.CONSULTA,
        origen=EventoSeguimiento.Origen.MEDICO,
        estado=EventoSeguimiento.Estado.REVISADO,
        resumen="Consulta clínica registrada por voz",
        detalle=consulta.resumen,
        ocurrido_en=ahora,
        registrado_por=medico,
        consulta=consulta,
    )

    sesion.datos_estructurados = datos
    sesion.estado = SesionConsultaVoz.Estado.PUBLICADO
    sesion.pregunta_actual = ""
    sesion.publicado_en = ahora
    sesion.save(
        update_fields=("datos_estructurados", "estado", "pregunta_actual", "publicado_en", "actualizado_en")
    )
    return {
        "consultaId": str(consulta.id),
        "planTratamientoId": str(plan.id) if plan else None,
        "prescripcionesIds": [str(item.id) for item in prescripciones],
        "citaId": str(cita.id) if cita else None,
        "publicadoEn": ahora.isoformat(),
    }


def _crear_secciones(consulta: ConsultaClinica, datos: dict) -> None:
    configuracion = (
        (SeccionConsulta.Tipo.MOTIVO, "Motivo de consulta", datos["motivoConsulta"]),
        (SeccionConsulta.Tipo.EVOLUCION, "Evolución clínica", datos["evolucionClinica"]),
        (SeccionConsulta.Tipo.TRATAMIENTO, "Tratamiento indicado", datos["tratamientoIndicado"]),
        (SeccionConsulta.Tipo.MEDICACION, "Medicación indicada", _texto_medicacion(datos["medicacionIndicada"])),
        (SeccionConsulta.Tipo.INDICACIONES, "Indicaciones para casa", datos["indicacionesCasa"]),
        (SeccionConsulta.Tipo.PROXIMO_CONTROL, "Próximo control", _texto_control(datos["proximoControl"])),
    )
    for orden, (tipo, titulo, contenido) in enumerate(configuracion, start=1):
        seccion = SeccionConsulta.objects.create(
            consulta=consulta,
            tipo=tipo,
            titulo=titulo,
            contenido=contenido,
            orden=orden,
        )
        if tipo == SeccionConsulta.Tipo.MEDICACION:
            ItemSeccionConsulta.objects.bulk_create(
                [
                    ItemSeccionConsulta(
                        seccion=seccion,
                        etiqueta=medicamento["nombre"][:140],
                        descripcion=_descripcion_medicamento(medicamento),
                        valor=medicamento["dosisCantidad"],
                        unidad=medicamento["dosisUnidad"],
                        orden=indice,
                    )
                    for indice, medicamento in enumerate(datos["medicacionIndicada"], start=1)
                ]
            )


def _crear_plan(paciente, medico, consulta, datos: dict) -> PlanTratamiento | None:
    hay_plan = any(
        (
            datos["tratamientoIndicado"],
            datos["medicacionIndicada"],
            datos["indicacionesCasa"],
            datos["proximoControl"].get("detalle"),
            datos["proximoControl"].get("fecha"),
        )
    )
    if not hay_plan:
        return None
    PlanTratamiento.objects.filter(paciente=paciente, estado=PlanTratamiento.Estado.VIGENTE).update(
        estado=PlanTratamiento.Estado.FINALIZADO,
        vigente_hasta=timezone.localdate(),
    )
    Prescripcion.objects.filter(paciente=paciente, estado=Prescripcion.Estado.ACTIVA).update(
        estado=Prescripcion.Estado.FINALIZADA,
        fecha_fin=timezone.localdate(),
    )
    plan = PlanTratamiento.objects.create(
        paciente=paciente,
        consulta_origen=consulta,
        medico=medico,
        nombre="Tratamiento actual",
        indicacion_general=datos["tratamientoIndicado"],
        estado=PlanTratamiento.Estado.VIGENTE,
    )
    items = []
    if datos["tratamientoIndicado"]:
        items.append((ItemPlanTratamiento.Tipo.TRATAMIENTO, "Tratamiento indicado", datos["tratamientoIndicado"]))
    for medicamento in datos["medicacionIndicada"]:
        items.append((ItemPlanTratamiento.Tipo.MEDICACION, medicamento["nombre"], _descripcion_medicamento(medicamento)))
    if datos["indicacionesCasa"]:
        items.append((ItemPlanTratamiento.Tipo.CUIDADO_CASA, "Indicaciones para casa", datos["indicacionesCasa"]))
    if datos["proximoControl"].get("fecha") or datos["proximoControl"].get("detalle"):
        items.append((ItemPlanTratamiento.Tipo.CONTROL, "Próximo control", _texto_control(datos["proximoControl"])))
    ItemPlanTratamiento.objects.bulk_create(
        [
            ItemPlanTratamiento(plan=plan, tipo=tipo, titulo=titulo, descripcion=descripcion, orden=orden)
            for orden, (tipo, titulo, descripcion) in enumerate(items, start=1)
        ]
    )
    return plan


def _crear_prescripciones(paciente, medico, consulta, plan, medicamentos: list[dict]) -> list[Prescripcion]:
    creadas = []
    hoy = timezone.localdate()
    for datos in medicamentos:
        medicamento, _ = Medicamento.objects.get_or_create(
            nombre_generico=datos["nombre"],
            forma_farmaceutica="",
            concentracion="",
        )
        fecha_fin = hoy + timedelta(days=datos["duracionDias"] - 1)
        prescripcion = Prescripcion.objects.create(
            paciente=paciente,
            medicamento=medicamento,
            consulta=consulta,
            plan_tratamiento=plan,
            medico=medico,
            cantidad_dosis=Decimal(datos["dosisCantidad"]),
            unidad_dosis=datos["dosisUnidad"],
            via=datos["via"] if datos["via"] in Prescripcion.Via.values else Prescripcion.Via.OTRA,
            frecuencia_texto=datos["frecuenciaTexto"] or _frecuencia_desde_horario(datos),
            indicaciones=datos["indicaciones"],
            fecha_inicio=hoy,
            fecha_fin=fecha_fin,
            estado=Prescripcion.Estado.ACTIVA,
        )
        for hora_texto in datos["horas"]:
            hora = parse_time(hora_texto)
            horario = HorarioPrescripcion.objects.create(prescripcion=prescripcion, hora=hora)
            DiaHorarioPrescripcion.objects.bulk_create(
                [DiaHorarioPrescripcion(horario=horario, dia_semana=dia) for dia in datos["diasSemana"]]
            )
            dosis = []
            for desplazamiento in range(datos["duracionDias"]):
                fecha = hoy + timedelta(days=desplazamiento)
                if fecha.weekday() not in datos["diasSemana"]:
                    continue
                instante = timezone.make_aware(datetime.combine(fecha, hora), timezone.get_current_timezone())
                dosis.append(
                    DosisProgramada(
                        prescripcion=prescripcion,
                        horario=horario,
                        programada_para=instante,
                    )
                )
            DosisProgramada.objects.bulk_create(dosis)
        creadas.append(prescripcion)
    return creadas


def _crear_proximo_control(paciente, medico, control: dict) -> Cita | None:
    fecha = parse_date(control.get("fecha", ""))
    if not fecha:
        return None
    hora = parse_time(control.get("hora", "")) or time(hour=9)
    inicio = timezone.make_aware(datetime.combine(fecha, hora), timezone.get_current_timezone())
    return Cita.objects.create(
        paciente=paciente,
        medico=medico,
        tipo=Cita.Tipo.CONTROL,
        inicio=inicio,
        estado=Cita.Estado.PENDIENTE,
        origen=Cita.Origen.HOSPITAL,
        especialidad=getattr(getattr(medico, "perfil_medico", None), "especialidad", ""),
        motivo=control.get("detalle", "") or "Próximo control clínico",
        creada_por=medico,
    )


def _resumen_consulta(datos: dict) -> str:
    partes = [datos["motivoConsulta"], datos["evolucionClinica"], datos["tratamientoIndicado"]]
    return "\n\n".join(parte for parte in partes if parte)


def _descripcion_medicamento(datos: dict) -> str:
    horarios = ", ".join(datos["horas"])
    frecuencia = datos["frecuenciaTexto"] or f"a las {horarios}"
    return f'{datos["dosisCantidad"]} {datos["dosisUnidad"]} vía {datos["via"].lower()}, {frecuencia}'.strip()


def _texto_medicacion(medicamentos: list[dict]) -> str:
    return "\n".join(f'• {item["nombre"]}: {_descripcion_medicamento(item)}' for item in medicamentos)


def _texto_control(control: dict) -> str:
    fecha = control.get("fecha", "")
    hora = control.get("hora", "")
    detalle = control.get("detalle", "")
    return " ".join(parte for parte in (fecha, hora, detalle) if parte)


def _frecuencia_desde_horario(datos: dict) -> str:
    return f'{len(datos["horas"])} dosis al día en los días indicados'
