from rest_framework import filters, mixins, permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from pacientes.permissions import es_medico, pacientes_visibles_para, puede_acceder_paciente

from .models import (
    DiaHorarioPrescripcion,
    DosisProgramada,
    HorarioPrescripcion,
    Medicamento,
    Prescripcion,
    ReporteDosis,
)
from .permissions import AccesoCatalogoMedicamento, AccesoPrescripcion, PuedeReportarDosis
from .serializers import (
    DiaHorarioPrescripcionSerializer,
    DosisProgramadaSerializer,
    HorarioPrescripcionSerializer,
    MedicamentoSerializer,
    PrescripcionSerializer,
    ReporteDosisSerializer,
)


class MedicamentoViewSet(viewsets.ModelViewSet):
    queryset = Medicamento.objects.all()
    serializer_class = MedicamentoSerializer
    permission_classes = (permissions.IsAuthenticated, AccesoCatalogoMedicamento)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("nombre_generico", "nombre_comercial", "codigo")
    ordering = ("nombre_generico",)


class PrescripcionViewSet(viewsets.ModelViewSet):
    serializer_class = PrescripcionSerializer
    permission_classes = (permissions.IsAuthenticated, AccesoPrescripcion)

    def get_queryset(self):
        return (
            Prescripcion.objects.filter(paciente__in=pacientes_visibles_para(self.request.user))
            .select_related("paciente", "medicamento", "medico", "consulta", "plan_tratamiento")
            .prefetch_related("horarios__dias")
        )

    def perform_create(self, serializer):
        paciente = serializer.validated_data["paciente"]
        if not es_medico(self.request.user) or not puede_acceder_paciente(self.request.user, paciente):
            raise PermissionDenied("No puede prescribir para este paciente.")
        serializer.save(medico=self.request.user)


class HorarioPrescripcionViewSet(viewsets.ModelViewSet):
    serializer_class = HorarioPrescripcionSerializer
    permission_classes = (permissions.IsAuthenticated, AccesoPrescripcion)

    def get_queryset(self):
        return HorarioPrescripcion.objects.filter(
            prescripcion__paciente__in=pacientes_visibles_para(self.request.user)
        ).select_related("prescripcion__paciente").prefetch_related("dias")

    def perform_create(self, serializer):
        paciente = serializer.validated_data["prescripcion"].paciente
        if not es_medico(self.request.user) or not puede_acceder_paciente(self.request.user, paciente):
            raise PermissionDenied("No puede modificar esta prescripcion.")
        serializer.save()


class DiaHorarioPrescripcionViewSet(viewsets.ModelViewSet):
    serializer_class = DiaHorarioPrescripcionSerializer
    permission_classes = (permissions.IsAuthenticated, AccesoPrescripcion)

    def get_queryset(self):
        return DiaHorarioPrescripcion.objects.filter(
            horario__prescripcion__paciente__in=pacientes_visibles_para(self.request.user)
        ).select_related("horario__prescripcion__paciente")

    def perform_create(self, serializer):
        paciente = serializer.validated_data["horario"].prescripcion.paciente
        if not es_medico(self.request.user) or not puede_acceder_paciente(self.request.user, paciente):
            raise PermissionDenied("No puede modificar esta prescripcion.")
        serializer.save()


class DosisProgramadaViewSet(viewsets.ModelViewSet):
    serializer_class = DosisProgramadaSerializer
    permission_classes = (permissions.IsAuthenticated, AccesoPrescripcion)

    def get_queryset(self):
        return DosisProgramada.objects.filter(
            prescripcion__paciente__in=pacientes_visibles_para(self.request.user)
        ).select_related("prescripcion__paciente", "horario")

    def perform_create(self, serializer):
        paciente = serializer.validated_data["prescripcion"].paciente
        if not es_medico(self.request.user) or not puede_acceder_paciente(self.request.user, paciente):
            raise PermissionDenied("No puede programar dosis para este paciente.")
        serializer.save()


class ReporteDosisViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = ReporteDosisSerializer
    permission_classes = (permissions.IsAuthenticated, PuedeReportarDosis)

    def get_queryset(self):
        return ReporteDosis.objects.filter(
            dosis_programada__prescripcion__paciente__in=pacientes_visibles_para(self.request.user)
        ).select_related("dosis_programada__prescripcion__paciente", "reportada_por")

    def perform_create(self, serializer):
        paciente = serializer.validated_data["dosis_programada"].prescripcion.paciente
        if not puede_acceder_paciente(self.request.user, paciente):
            raise PermissionDenied("No tiene acceso al paciente indicado.")
        serializer.save(reportada_por=self.request.user)

