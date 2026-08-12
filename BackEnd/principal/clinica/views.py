from rest_framework import filters, permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from pacientes.permissions import es_medico, pacientes_visibles_para, puede_acceder_paciente

from .models import (
    ConsultaClinica,
    Diagnostico,
    ItemPlanTratamiento,
    ItemSeccionConsulta,
    PlanTratamiento,
    SeccionConsulta,
)
from .permissions import AccesoClinico
from .serializers import (
    ConsultaClinicaSerializer,
    DiagnosticoSerializer,
    ItemPlanTratamientoSerializer,
    ItemSeccionConsultaSerializer,
    PlanTratamientoSerializer,
    SeccionConsultaSerializer,
)


class BaseClinicaViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, AccesoClinico)
    http_method_names = ("get", "post", "put", "patch", "head", "options")

    def validar_paciente(self, paciente):
        if not puede_acceder_paciente(self.request.user, paciente) or not es_medico(self.request.user):
            raise PermissionDenied("No puede modificar informacion clinica de este paciente.")

    def perform_update(self, serializer):
        instancia = self.get_object()
        consulta = None
        if isinstance(instancia, ConsultaClinica):
            consulta = instancia
        elif isinstance(instancia, SeccionConsulta):
            consulta = instancia.consulta
        elif isinstance(instancia, ItemSeccionConsulta):
            consulta = instancia.seccion.consulta
        if consulta and consulta.estado != ConsultaClinica.Estado.BORRADOR:
            raise PermissionDenied("Una consulta cerrada es inmutable; registre una correccion auditada.")
        plan = instancia.plan if isinstance(instancia, ItemPlanTratamiento) else instancia
        if isinstance(plan, PlanTratamiento) and plan.estado in {
            PlanTratamiento.Estado.FINALIZADO,
            PlanTratamiento.Estado.CANCELADO,
        }:
            raise PermissionDenied("Un plan cerrado es inmutable.")
        serializer.save()


class DiagnosticoViewSet(BaseClinicaViewSet):
    serializer_class = DiagnosticoSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("nombre", "codigo_cie10", "paciente__historia_clinica")
    ordering = ("-es_principal", "-fecha_diagnostico")

    def get_queryset(self):
        return Diagnostico.objects.filter(paciente__in=pacientes_visibles_para(self.request.user)).select_related(
            "paciente", "medico"
        )

    def perform_create(self, serializer):
        self.validar_paciente(serializer.validated_data["paciente"])
        serializer.save(medico=self.request.user)


class ConsultaClinicaViewSet(BaseClinicaViewSet):
    serializer_class = ConsultaClinicaSerializer
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("titulo", "resumen", "paciente__historia_clinica")
    ordering_fields = ("iniciada_en", "estado")
    ordering = ("-iniciada_en",)

    def get_queryset(self):
        return (
            ConsultaClinica.objects.filter(paciente__in=pacientes_visibles_para(self.request.user))
            .select_related("paciente", "medico", "cita")
            .prefetch_related("secciones__items")
        )

    def perform_create(self, serializer):
        self.validar_paciente(serializer.validated_data["paciente"])
        serializer.save(medico=self.request.user)


class SeccionConsultaViewSet(BaseClinicaViewSet):
    serializer_class = SeccionConsultaSerializer

    def get_queryset(self):
        return SeccionConsulta.objects.filter(
            consulta__paciente__in=pacientes_visibles_para(self.request.user)
        ).select_related("consulta__paciente").prefetch_related("items")

    def perform_create(self, serializer):
        self.validar_paciente(serializer.validated_data["consulta"].paciente)
        serializer.save()


class ItemSeccionConsultaViewSet(BaseClinicaViewSet):
    serializer_class = ItemSeccionConsultaSerializer

    def get_queryset(self):
        return ItemSeccionConsulta.objects.filter(
            seccion__consulta__paciente__in=pacientes_visibles_para(self.request.user)
        ).select_related("seccion__consulta__paciente")

    def perform_create(self, serializer):
        self.validar_paciente(serializer.validated_data["seccion"].consulta.paciente)
        serializer.save()


class PlanTratamientoViewSet(BaseClinicaViewSet):
    serializer_class = PlanTratamientoSerializer
    ordering = ("-vigente_desde",)

    def get_queryset(self):
        return (
            PlanTratamiento.objects.filter(paciente__in=pacientes_visibles_para(self.request.user))
            .select_related("paciente", "medico", "consulta_origen")
            .prefetch_related("items")
        )

    def perform_create(self, serializer):
        self.validar_paciente(serializer.validated_data["paciente"])
        serializer.save(medico=self.request.user)


class ItemPlanTratamientoViewSet(BaseClinicaViewSet):
    serializer_class = ItemPlanTratamientoSerializer

    def get_queryset(self):
        return ItemPlanTratamiento.objects.filter(
            plan__paciente__in=pacientes_visibles_para(self.request.user)
        ).select_related("plan__paciente")

    def perform_create(self, serializer):
        self.validar_paciente(serializer.validated_data["plan"].paciente)
        serializer.save()
