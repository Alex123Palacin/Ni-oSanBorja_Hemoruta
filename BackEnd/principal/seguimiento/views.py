from django.utils import timezone
from rest_framework import filters, mixins, permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from pacientes.permissions import es_administrador, es_medico, pacientes_visibles_para, puede_acceder_paciente

from .models import AlertaSeguimiento, CatalogoSintoma, EventoSeguimiento, ReporteSintomas, SemaforoPaciente
from .permissions import AccesoCatalogoSintomas, AccesoSeguimiento, PuedeReportarSintomas
from .serializers import (
    AlertaSeguimientoSerializer,
    CatalogoSintomaSerializer,
    EventoSeguimientoSerializer,
    ReporteSintomasSerializer,
    SemaforoPacienteSerializer,
)
from .services import cambiar_semaforo


class CatalogoSintomaViewSet(viewsets.ModelViewSet):
    queryset = CatalogoSintoma.objects.all()
    serializer_class = CatalogoSintomaSerializer
    permission_classes = (permissions.IsAuthenticated, AccesoCatalogoSintomas)
    filter_backends = (filters.SearchFilter,)
    search_fields = ("codigo", "nombre")


class ReporteSintomasViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = ReporteSintomasSerializer
    permission_classes = (permissions.IsAuthenticated, PuedeReportarSintomas)

    def get_queryset(self):
        return (
            ReporteSintomas.objects.filter(paciente__in=pacientes_visibles_para(self.request.user))
            .select_related("paciente", "reportado_por")
            .prefetch_related("sintomas_reportados__sintoma")
        )

    def perform_create(self, serializer):
        paciente = serializer.validated_data["paciente"]
        if not puede_acceder_paciente(self.request.user, paciente):
            raise PermissionDenied("No tiene acceso al paciente indicado.")
        origen = ReporteSintomas.Origen.MEDICO if es_medico(self.request.user) else ReporteSintomas.Origen.APP
        serializer.save(reportado_por=self.request.user, origen=origen)


class EventoSeguimientoViewSet(viewsets.ModelViewSet):
    serializer_class = EventoSeguimientoSerializer
    permission_classes = (permissions.IsAuthenticated, AccesoSeguimiento)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("resumen", "detalle", "paciente__historia_clinica")
    ordering_fields = ("ocurrido_en", "estado", "tipo")
    ordering = ("-ocurrido_en",)

    def get_queryset(self):
        return EventoSeguimiento.objects.filter(
            paciente__in=pacientes_visibles_para(self.request.user)
        ).select_related("paciente", "registrado_por")

    def perform_create(self, serializer):
        paciente = serializer.validated_data["paciente"]
        if not (es_medico(self.request.user) or es_administrador(self.request.user)):
            raise PermissionDenied("Solo el personal hospitalario puede crear eventos manuales.")
        if not puede_acceder_paciente(self.request.user, paciente):
            raise PermissionDenied("No tiene acceso al paciente indicado.")
        serializer.save(registrado_por=self.request.user, origen=EventoSeguimiento.Origen.MEDICO)


class SemaforoPacienteViewSet(viewsets.ModelViewSet):
    serializer_class = SemaforoPacienteSerializer
    permission_classes = (permissions.IsAuthenticated, AccesoSeguimiento)

    def get_queryset(self):
        return SemaforoPaciente.objects.filter(
            paciente__in=pacientes_visibles_para(self.request.user)
        ).select_related("paciente", "determinado_por")

    def perform_create(self, serializer):
        paciente = serializer.validated_data["paciente"]
        if not es_medico(self.request.user) or not puede_acceder_paciente(self.request.user, paciente):
            raise PermissionDenied("No puede evaluar el semaforo de este paciente.")
        self._instancia_creada = cambiar_semaforo(
            paciente=paciente,
            nivel=serializer.validated_data["nivel"],
            motivo=serializer.validated_data["motivo"],
            origen=SemaforoPaciente.Origen.MEDICO,
            determinado_por=self.request.user,
        )
        serializer.instance = self._instancia_creada


class AlertaSeguimientoViewSet(viewsets.ModelViewSet):
    serializer_class = AlertaSeguimientoSerializer
    permission_classes = (permissions.IsAuthenticated, AccesoSeguimiento)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("titulo", "descripcion", "codigo")
    ordering = ("-abierta_en",)

    def get_queryset(self):
        return AlertaSeguimiento.objects.filter(
            paciente__in=pacientes_visibles_para(self.request.user)
        ).select_related("paciente", "evento", "asignada_a", "resuelta_por")

    def perform_create(self, serializer):
        paciente = serializer.validated_data["paciente"]
        if not es_medico(self.request.user) or not puede_acceder_paciente(self.request.user, paciente):
            raise PermissionDenied("No puede registrar alertas para este paciente.")
        serializer.save()

    def perform_update(self, serializer):
        alerta = self.get_object()
        extras = {}
        nuevo_estado = serializer.validated_data.get("estado", alerta.estado)
        if nuevo_estado in {AlertaSeguimiento.Estado.RESUELTA, AlertaSeguimiento.Estado.DESCARTADA}:
            extras = {"resuelta_en": timezone.now(), "resuelta_por": self.request.user}
        serializer.save(**extras)

