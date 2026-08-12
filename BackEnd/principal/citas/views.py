from django.utils import timezone
from rest_framework import filters, permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from pacientes.permissions import es_administrador, es_medico, pacientes_visibles_para, puede_acceder_paciente

from .models import Cita
from .serializers import CitaSerializer


class CitaViewSet(viewsets.ModelViewSet):
    serializer_class = CitaSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("paciente__nombres", "paciente__apellidos", "paciente__historia_clinica", "motivo")
    ordering_fields = ("inicio", "estado", "creado_en")
    ordering = ("inicio",)

    def get_queryset(self):
        return Cita.objects.filter(paciente__in=pacientes_visibles_para(self.request.user)).select_related(
            "paciente", "medico", "creada_por", "confirmada_por"
        )

    def perform_create(self, serializer):
        paciente = serializer.validated_data["paciente"]
        if not puede_acceder_paciente(self.request.user, paciente):
            raise PermissionDenied("No tiene acceso al paciente indicado.")

        if es_medico(self.request.user) or es_administrador(self.request.user):
            extras = {"creada_por": self.request.user}
            if serializer.validated_data.get("estado") == Cita.Estado.CONFIRMADA:
                extras.update({"confirmada_por": self.request.user, "confirmada_en": timezone.now()})
            serializer.save(**extras)
            return

        serializer.save(
            creada_por=self.request.user,
            origen=Cita.Origen.FAMILIA,
            estado=Cita.Estado.PENDIENTE,
            medico=None,
        )

    def perform_update(self, serializer):
        cita = self.get_object()
        if not puede_acceder_paciente(self.request.user, cita.paciente):
            raise PermissionDenied("No tiene acceso al paciente indicado.")
        es_personal = es_medico(self.request.user) or es_administrador(self.request.user)
        if not es_personal:
            if cita.origen != Cita.Origen.FAMILIA or cita.estado != Cita.Estado.PENDIENTE:
                raise PermissionDenied("Solo puede editar declaraciones de cita pendientes.")
            serializer.save(
                paciente=cita.paciente,
                medico=cita.medico,
                estado=cita.estado,
                origen=cita.origen,
                creada_por=cita.creada_por,
                confirmada_por=cita.confirmada_por,
                confirmada_en=cita.confirmada_en,
            )
            return
        nuevo_estado = serializer.validated_data.get("estado", cita.estado)
        extras = {}
        if nuevo_estado == Cita.Estado.CONFIRMADA and cita.estado != Cita.Estado.CONFIRMADA:
            if not (es_medico(self.request.user) or es_administrador(self.request.user)):
                raise PermissionDenied("Solo el personal hospitalario puede confirmar una cita.")
            extras = {"confirmada_por": self.request.user, "confirmada_en": timezone.now()}
        serializer.save(**extras)

    def perform_destroy(self, instance):
        raise PermissionDenied("Las citas se cancelan mediante su estado; no se eliminan.")
