from rest_framework import filters, permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from pacientes.permissions import es_administrador, es_medico, pacientes_visibles_para, puede_acceder_paciente

from .models import DocumentoPaciente
from .permissions import AccesoDocumentoPaciente
from .serializers import DocumentoPacienteSerializer


class DocumentoPacienteViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentoPacienteSerializer
    permission_classes = (permissions.IsAuthenticated, AccesoDocumentoPaciente)
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ("titulo", "descripcion", "nombre_original", "paciente__historia_clinica")
    ordering_fields = ("fecha_documento", "creado_en", "estado")
    ordering = ("-fecha_documento", "-creado_en")

    def get_queryset(self):
        return DocumentoPaciente.objects.filter(
            paciente__in=pacientes_visibles_para(self.request.user)
        ).select_related("paciente", "consulta", "subido_por")

    def perform_create(self, serializer):
        paciente = serializer.validated_data["paciente"]
        if not puede_acceder_paciente(self.request.user, paciente):
            raise PermissionDenied("No tiene acceso al paciente indicado.")
        if es_medico(self.request.user) or es_administrador(self.request.user):
            serializer.save(subido_por=self.request.user, origen=DocumentoPaciente.Origen.MEDICO)
        else:
            serializer.save(
                subido_por=self.request.user,
                origen=DocumentoPaciente.Origen.APP,
                estado=DocumentoPaciente.Estado.PENDIENTE,
                consulta=None,
            )

    def perform_destroy(self, instance):
        if not (es_medico(self.request.user) or es_administrador(self.request.user)):
            raise PermissionDenied("Solo el personal hospitalario puede eliminar documentos.")
        instance.delete()

