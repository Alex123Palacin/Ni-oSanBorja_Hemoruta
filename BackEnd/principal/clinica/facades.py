from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from medicacion.models import Prescripcion
from pacientes.paginacion import paginar_resultados
from pacientes.permissions import SoloMedico, SoloPacienteOResponsable, paciente_del_usuario, pacientes_visibles_para

from .models import ConsultaClinica, PlanTratamiento


def _serializar_consulta(consulta):
    return {
        "id": str(consulta.id),
        "titulo": consulta.titulo,
        "resumen": consulta.resumen,
        "estado": consulta.estado,
        "origen": consulta.origen,
        "iniciadaEn": consulta.iniciada_en.isoformat(),
        "completadaEn": consulta.completada_en.isoformat() if consulta.completada_en else None,
        "medico": {
            "id": str(consulta.medico_id),
            "nombre": consulta.medico.get_full_name() or consulta.medico.get_username(),
            "especialidad": getattr(getattr(consulta.medico, "perfil_medico", None), "especialidad", ""),
        },
        "secciones": [
            {
                "id": str(seccion.id),
                "tipo": seccion.tipo,
                "titulo": seccion.titulo,
                "contenido": seccion.contenido,
                "orden": seccion.orden,
                "items": [
                    {
                        "id": str(item.id),
                        "etiqueta": item.etiqueta,
                        "descripcion": item.descripcion,
                        "valor": item.valor,
                        "unidad": item.unidad,
                        "orden": item.orden,
                    }
                    for item in seccion.items.all()
                ],
            }
            for seccion in consulta.secciones.all()
        ],
    }


class HistorialPacienteMedicoAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloMedico)

    def get(self, request, paciente_id):
        get_object_or_404(pacientes_visibles_para(request.user), pk=paciente_id)
        queryset = (
            ConsultaClinica.objects.filter(paciente_id=paciente_id)
            .select_related("medico", "medico__perfil_medico")
            .prefetch_related("secciones__items")
            .order_by("-iniciada_en")
        )
        return paginar_resultados(request, queryset, _serializar_consulta)


class TratamientoPacienteAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloPacienteOResponsable)

    def get(self, request):
        paciente = paciente_del_usuario(request.user)
        if not paciente:
            return Response({"detalle": "La cuenta no esta vinculada a un paciente."}, status=404)
        plan = (
            PlanTratamiento.objects.filter(paciente=paciente, estado=PlanTratamiento.Estado.VIGENTE)
            .select_related("medico")
            .prefetch_related("items")
            .first()
        )
        if not plan:
            return Response({"pacienteId": str(paciente.id), "plan": None, "medicamentos": []})
        prescripciones = Prescripcion.objects.filter(
            paciente=paciente,
            plan_tratamiento=plan,
            estado=Prescripcion.Estado.ACTIVA,
        ).select_related("medicamento")
        return Response(
            {
                "pacienteId": str(paciente.id),
                "plan": {
                    "id": str(plan.id),
                    "nombre": plan.nombre,
                    "indicacionGeneral": plan.indicacion_general,
                    "vigenteDesde": plan.vigente_desde.isoformat(),
                    "vigenteHasta": plan.vigente_hasta.isoformat() if plan.vigente_hasta else None,
                    "items": [
                        {
                            "id": str(item.id),
                            "tipo": item.tipo,
                            "titulo": item.titulo,
                            "descripcion": item.descripcion,
                            "orden": item.orden,
                        }
                        for item in plan.items.all()
                    ],
                },
                "medicamentos": [
                    {
                        "id": str(prescripcion.id),
                        "nombre": prescripcion.medicamento.nombre_generico,
                        "dosis": f"{prescripcion.cantidad_dosis:g} {prescripcion.unidad_dosis}",
                        "via": prescripcion.via,
                        "frecuencia": prescripcion.frecuencia_texto,
                    }
                    for prescripcion in prescripciones
                ],
            }
        )
