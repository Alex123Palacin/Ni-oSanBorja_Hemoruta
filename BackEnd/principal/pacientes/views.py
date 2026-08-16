from rest_framework import filters, permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import AsignacionMedica, CuentaMovilPaciente, Paciente, TutorPaciente
from .permissions import (
    PuedeAccederPaciente,
    SoloAdministradorParaModificarAsignacion,
    es_administrador,
    es_medico,
    pacientes_visibles_para,
    puede_acceder_paciente,
)
from .serializers import (
    AsignacionMedicaSerializer,
    CuentaMovilPacienteSerializer,
    PacienteListadoSerializer,
    PacienteSerializer,
    TutorPacienteSerializer,
)


class PacienteViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, PuedeAccederPaciente)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("dni", "historia_clinica", "nombres", "apellidos")
    ordering_fields = ("apellidos", "nombres", "creado_en", "estado")
    ordering = ("apellidos", "nombres")

    def get_queryset(self):
        base = Paciente.objects.prefetch_related("tutores", "asignaciones_medicas__medico").select_related(
            "cuenta_movil"
        )
        return pacientes_visibles_para(self.request.user, base)

    def get_serializer_class(self):
        return PacienteListadoSerializer if self.action == "list" else PacienteSerializer

    def perform_create(self, serializer):
        if not es_administrador(self.request.user):
            raise PermissionDenied("Solo el administrador puede registrar pacientes.")
        serializer.save(creado_por=self.request.user)

    def perform_destroy(self, instance):
        raise PermissionDenied("Los pacientes no se eliminan; cambie su estado a INACTIVO.")

    def perform_update(self, serializer):
        paciente = self.get_object()
        if es_administrador(self.request.user) or es_medico(self.request.user):
            serializer.save()
            return
        serializer.save(
            historia_clinica=paciente.historia_clinica,
            estado=paciente.estado,
            creado_por=paciente.creado_por,
        )


class TutorPacienteViewSet(viewsets.ModelViewSet):
    serializer_class = TutorPacienteSerializer
    permission_classes = (permissions.IsAuthenticated, PuedeAccederPaciente)

    def get_queryset(self):
        pacientes = pacientes_visibles_para(self.request.user)
        return TutorPaciente.objects.filter(paciente__in=pacientes).select_related("paciente", "usuario")

    def perform_create(self, serializer):
        paciente = serializer.validated_data["paciente"]
        if not (es_administrador(self.request.user) or es_medico(self.request.user)):
            raise PermissionDenied("Solo el personal hospitalario puede registrar responsables.")
        if not puede_acceder_paciente(self.request.user, paciente):
            raise PermissionDenied("No tiene acceso al paciente indicado.")
        serializer.save()

    def perform_update(self, serializer):
        tutor = self.get_object()
        if es_administrador(self.request.user) or es_medico(self.request.user):
            serializer.save()
            return
        if tutor.usuario_id != self.request.user.pk:
            raise PermissionDenied("Solo puede editar sus propios datos de contacto.")
        serializer.save(
            paciente=tutor.paciente,
            usuario=tutor.usuario,
            autorizado=tutor.autorizado,
            es_principal=tutor.es_principal,
            parentesco=tutor.parentesco,
        )

    def perform_destroy(self, instance):
        raise PermissionDenied("Los vinculos de responsables se revocan; no se eliminan.")


class AsignacionMedicaViewSet(viewsets.ModelViewSet):
    serializer_class = AsignacionMedicaSerializer
    permission_classes = (permissions.IsAuthenticated, SoloAdministradorParaModificarAsignacion)
    def get_queryset(self):
        pacientes = pacientes_visibles_para(self.request.user)
        return AsignacionMedica.objects.filter(paciente__in=pacientes).select_related("paciente", "medico")

    def perform_create(self, serializer):
        serializer.save(asignado_por=self.request.user)

    def perform_destroy(self, instance):
        raise PermissionDenied("Las asignaciones se cierran estableciendo activa=false; no se eliminan.")

class CuentaMovilPacienteViewSet(viewsets.ModelViewSet):
    serializer_class = CuentaMovilPacienteSerializer
    permission_classes = (permissions.IsAuthenticated, PuedeAccederPaciente)

    def get_queryset(self):
        pacientes = pacientes_visibles_para(self.request.user)
        return CuentaMovilPaciente.objects.filter(paciente__in=pacientes).select_related("paciente", "usuario")

    def perform_create(self, serializer):
        paciente = serializer.validated_data["paciente"]
        if not (es_administrador(self.request.user) or es_medico(self.request.user)):
            raise PermissionDenied("Solo el personal hospitalario puede habilitar una cuenta movil.")
        if not puede_acceder_paciente(self.request.user, paciente):
            raise PermissionDenied("No tiene acceso al paciente indicado.")
        serializer.save()

    def perform_update(self, serializer):
        cuenta = self.get_object()
        if es_administrador(self.request.user) or es_medico(self.request.user):
            serializer.save(paciente=cuenta.paciente)
            return
        if cuenta.usuario_id != self.request.user.pk:
            raise PermissionDenied("No puede modificar esta cuenta.")
        serializer.save(paciente=cuenta.paciente, usuario=cuenta.usuario, estado=cuenta.estado, alias=cuenta.alias)

    def perform_destroy(self, instance):
        raise PermissionDenied("Las cuentas se suspenden; no se eliminan.")
