from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from pacientes.models import Paciente
from pacientes.paginacion import paginar_resultados
from pacientes.permissions import SoloMedico, pacientes_visibles_para

from .models import Cita


def serializar_cita_medica(cita):
    return {
        "id": str(cita.id),
        "inicio": cita.inicio.isoformat(),
        "fin": cita.fin.isoformat() if cita.fin else None,
        "tipo": cita.tipo,
        "estado": cita.estado,
        "origen": cita.origen,
        "especialidad": cita.especialidad,
        "sede": cita.sede,
        "consultorio": cita.consultorio,
        "motivo": cita.motivo,
        "observaciones": cita.observaciones,
        "medico": (
            {
                "id": str(cita.medico_id),
                "nombre": cita.medico.nombre_completo,
            }
            if cita.medico
            else None
        ),
    }


class AgendaPacienteMedicoAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloMedico)

    def get(self, request, paciente_id):
        paciente = get_object_or_404(pacientes_visibles_para(request.user), pk=paciente_id)
        citas = (
            Cita.objects.filter(paciente=paciente)
            .select_related("medico")
            .order_by("-inicio")
        )
        return paginar_resultados(
            request,
            citas,
            serializar_cita_medica,
            tamano_predeterminado=50,
            tamano_maximo=100,
        )
