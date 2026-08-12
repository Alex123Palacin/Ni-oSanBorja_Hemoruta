from datetime import date, datetime, time, timedelta

from django.db.models import Prefetch
from django.utils import timezone
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from pacientes.permissions import SoloPacienteOResponsable, paciente_del_usuario

from .models import DosisProgramada, Prescripcion, ReporteDosis
from .services import registrar_reporte_dosis


class RegistrarTomaPacienteSerializer(serializers.Serializer):
    ocurrenciaId = serializers.UUIDField()
    respuesta = serializers.ChoiceField(choices=("TOMADA", "TOMADA_TARDE", "NO_TOMADA"))
    motivoNoToma = serializers.ChoiceField(
        choices=ReporteDosis.MotivoNoToma.choices,
        required=False,
        allow_blank=True,
    )

    def validate(self, attrs):
        if attrs["respuesta"] == "NO_TOMADA" and not attrs.get("motivoNoToma"):
            raise serializers.ValidationError({"motivoNoToma": "Indique por que no se tomo la dosis."})
        return attrs


class ConsultarMedicacionPacienteSerializer(serializers.Serializer):
    mes = serializers.RegexField(r"^\d{4}-(0[1-9]|1[0-2])$", required=False)

    def validate_mes(self, valor):
        try:
            return date.fromisoformat(f"{valor}-01")
        except ValueError as error:
            raise serializers.ValidationError("El mes no es valido.") from error


def _estado_dosis(dosis, *, es_hoy=False):
    if not dosis:
        return "SIN_DOSIS"
    estados = [item.estado for item in dosis]
    completadas = sum(
        estado in (DosisProgramada.Estado.TOMADA, DosisProgramada.Estado.TARDE)
        for estado in estados
    )
    omitidas = estados.count(DosisProgramada.Estado.OMITIDA)
    pendientes = estados.count(DosisProgramada.Estado.PENDIENTE)
    if completadas == len(estados):
        return "COMPLETADO"
    if omitidas == len(estados):
        return "NO_TOMADA"
    if completadas or omitidas:
        return "PARCIAL"
    if pendientes:
        return "HOY_PENDIENTE" if es_hoy else "PENDIENTE"
    return "SIN_DOSIS"


def _limites_periodo(fecha_inicio, fecha_fin):
    zona = timezone.get_current_timezone()
    inicio = timezone.make_aware(datetime.combine(fecha_inicio, time.min), zona)
    fin = timezone.make_aware(datetime.combine(fecha_fin, time.min), zona)
    return inicio, fin


def _limites_semana():
    hoy = timezone.localdate()
    inicio_fecha = hoy - timedelta(days=hoy.weekday())
    fin_fecha = inicio_fecha + timedelta(days=7)
    inicio, fin = _limites_periodo(inicio_fecha, fin_fecha)
    return hoy, inicio_fecha, inicio, fin


def _limites_mes(mes=None):
    inicio_fecha = mes or timezone.localdate().replace(day=1)
    if inicio_fecha.month == 12:
        fin_fecha = date(inicio_fecha.year + 1, 1, 1)
    else:
        fin_fecha = date(inicio_fecha.year, inicio_fecha.month + 1, 1)
    inicio, fin = _limites_periodo(inicio_fecha, fin_fecha)
    return inicio_fecha, fin_fecha, inicio, fin


def _serializar_ocurrencia(dosis):
    local = timezone.localtime(dosis.programada_para)
    reporte = getattr(dosis, "reporte", None)
    return {
        "id": str(dosis.id),
        "programadaPara": local.isoformat(),
        "fecha": local.date().isoformat(),
        "hora": local.time().isoformat(timespec="minutes"),
        "estado": dosis.estado,
        "respuesta": reporte.respuesta if reporte else None,
        "motivoNoToma": reporte.motivo_no_toma if reporte else None,
    }


def _serializar_dosis_hoy(dosis):
    ocurrencia = _serializar_ocurrencia(dosis)
    prescripcion = dosis.prescripcion
    return {
        **ocurrencia,
        "medicamentoId": str(prescripcion.id),
        "nombre": prescripcion.medicamento.nombre_generico,
        "dosis": f"{prescripcion.cantidad_dosis:g} {prescripcion.unidad_dosis}",
        "via": prescripcion.via,
    }


def _estado_hoy(dosis):
    estado = _estado_dosis(dosis, es_hoy=True)
    if estado == "COMPLETADO":
        if any(item.estado == DosisProgramada.Estado.TARDE for item in dosis):
            return "TOMADA_TARDE"
        return "TOMADA"
    return estado


class MedicacionPacienteAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloPacienteOResponsable)

    def get(self, request):
        consulta = ConsultarMedicacionPacienteSerializer(data=request.query_params)
        consulta.is_valid(raise_exception=True)
        paciente = paciente_del_usuario(request.user)
        if not paciente:
            return Response({"detalle": "La cuenta no esta vinculada a un paciente."}, status=404)
        hoy, _, inicio_semana, fin_semana = _limites_semana()
        inicio_mes_fecha, fin_mes_fecha, inicio_mes, fin_mes = _limites_mes(
            consulta.validated_data.get("mes")
        )
        queryset_dosis = (
            DosisProgramada.objects.filter(
                programada_para__gte=inicio_mes,
                programada_para__lt=fin_mes,
            )
            .exclude(estado=DosisProgramada.Estado.CANCELADA)
            .select_related("reporte")
            .order_by("programada_para")
        )
        prescripciones = list(
            Prescripcion.objects.filter(paciente=paciente, estado=Prescripcion.Estado.ACTIVA)
            .select_related("medicamento")
            .prefetch_related(
                "horarios__dias",
                Prefetch(
                    "dosis_programadas",
                    queryset=queryset_dosis,
                    to_attr="dosis_mes_prefetch",
                ),
            )
        )
        dosis_mes = [
            dosis
            for prescripcion in prescripciones
            for dosis in prescripcion.dosis_mes_prefetch
        ]
        dosis_semana = DosisProgramada.objects.filter(
            prescripcion__paciente=paciente,
            prescripcion__estado=Prescripcion.Estado.ACTIVA,
            programada_para__gte=inicio_semana,
            programada_para__lt=fin_semana,
        ).exclude(estado=DosisProgramada.Estado.CANCELADA)
        ahora = timezone.now()
        dosis_exigibles = dosis_semana.filter(programada_para__lte=ahora)
        total = dosis_exigibles.count()
        cumplidas = dosis_exigibles.filter(
            estado__in=(DosisProgramada.Estado.TOMADA, DosisProgramada.Estado.TARDE)
        ).count()
        cumplimiento = round(cumplidas / total * 100) if total else 0

        calendario = []
        fecha = inicio_mes_fecha
        while fecha < fin_mes_fecha:
            dosis_dia = [
                dosis
                for dosis in dosis_mes
                if timezone.localtime(dosis.programada_para).date() == fecha
            ]
            calendario.append(
                {
                    "fecha": fecha.isoformat(),
                    "diaSemana": fecha.weekday(),
                    "estado": _estado_dosis(dosis_dia, es_hoy=fecha == hoy),
                    "totalDosis": len(dosis_dia),
                    "completadas": sum(
                        dosis.estado in (DosisProgramada.Estado.TOMADA, DosisProgramada.Estado.TARDE)
                        for dosis in dosis_dia
                    ),
                    "omitidas": sum(
                        dosis.estado == DosisProgramada.Estado.OMITIDA for dosis in dosis_dia
                    ),
                    "pendientes": sum(
                        dosis.estado == DosisProgramada.Estado.PENDIENTE for dosis in dosis_dia
                    ),
                }
            )
            fecha += timedelta(days=1)

        inicio_hoy, fin_hoy = _limites_periodo(hoy, hoy + timedelta(days=1))
        dosis_hoy = list(
            DosisProgramada.objects.filter(
                prescripcion__paciente=paciente,
                prescripcion__estado=Prescripcion.Estado.ACTIVA,
                programada_para__gte=inicio_hoy,
                programada_para__lt=fin_hoy,
            )
            .exclude(estado=DosisProgramada.Estado.CANCELADA)
            .select_related("prescripcion__medicamento", "reporte")
            .order_by("programada_para", "prescripcion__medicamento__nombre_generico")
        )

        return Response(
            {
                "cumplimientoSemanal": cumplimiento,
                "mes": inicio_mes_fecha.strftime("%Y-%m"),
                "calendario": calendario,
                "dosisHoy": [_serializar_dosis_hoy(dosis) for dosis in dosis_hoy],
                "medicamentos": [
                    {
                        "id": str(prescripcion.id),
                        "nombre": prescripcion.medicamento.nombre_generico,
                        "dosis": f"{prescripcion.cantidad_dosis:g} {prescripcion.unidad_dosis}",
                        "via": prescripcion.via,
                        "estadoHoy": _estado_hoy(
                            [
                                dosis
                                for dosis in dosis_hoy
                                if dosis.prescripcion_id == prescripcion.id
                                if timezone.localtime(dosis.programada_para).date() == hoy
                            ]
                        ),
                        "ocurrenciaId": next(
                            (
                                str(dosis.id)
                                for dosis in dosis_hoy
                                if dosis.prescripcion_id == prescripcion.id
                                if timezone.localtime(dosis.programada_para).date() == hoy
                                and dosis.estado == DosisProgramada.Estado.PENDIENTE
                            ),
                            None,
                        ),
                        "ocurrencias": [
                            _serializar_ocurrencia(dosis)
                            for dosis in prescripcion.dosis_mes_prefetch
                        ],
                        "horarios": [
                            {
                                "hora": horario.hora.isoformat(timespec="minutes") if horario.hora else "",
                                "diasSemana": [dia.dia_semana for dia in horario.dias.all()],
                            }
                            for horario in prescripcion.horarios.all()
                        ],
                    }
                    for prescripcion in prescripciones
                ],
            }
        )


class RegistrarTomaPacienteAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloPacienteOResponsable)

    def post(self, request):
        serializer = RegistrarTomaPacienteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        paciente = paciente_del_usuario(request.user)
        if not paciente:
            return Response({"detalle": "La cuenta no esta vinculada a un paciente."}, status=404)
        dosis = DosisProgramada.objects.filter(
            pk=serializer.validated_data["ocurrenciaId"],
            prescripcion__paciente=paciente,
        ).first()
        if not dosis:
            return Response({"detalle": "La ocurrencia de dosis no existe."}, status=404)
        mapa_respuesta = {
            "TOMADA": ReporteDosis.Respuesta.TOMADA,
            "TOMADA_TARDE": ReporteDosis.Respuesta.TARDE,
            "NO_TOMADA": ReporteDosis.Respuesta.NO_TOMADA,
        }
        reporte = registrar_reporte_dosis(
            dosis_programada=dosis,
            reportada_por=request.user,
            respuesta=mapa_respuesta[serializer.validated_data["respuesta"]],
            motivo_no_toma=serializer.validated_data.get("motivoNoToma", ""),
            observacion="",
            ocurrida_en=timezone.now(),
            origen=ReporteDosis.Origen.APP,
        )
        return Response({"registroId": str(reporte.id), "registradoEn": reporte.reportada_en.isoformat()}, status=201)
