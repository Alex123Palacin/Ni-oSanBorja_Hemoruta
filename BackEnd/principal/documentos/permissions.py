from rest_framework.permissions import BasePermission, SAFE_METHODS

from pacientes.permissions import es_administrador, es_medico, obtener_paciente, puede_acceder_paciente


class AccesoDocumentoPaciente(BasePermission):
    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        paciente = obtener_paciente(obj)
        if not paciente or not puede_acceder_paciente(request.user, paciente):
            return False
        if request.method in SAFE_METHODS:
            return True
        return es_medico(request.user) or es_administrador(request.user)
