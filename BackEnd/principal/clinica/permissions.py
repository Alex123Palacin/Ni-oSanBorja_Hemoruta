from rest_framework.permissions import BasePermission, SAFE_METHODS

from pacientes.permissions import es_administrador, es_medico, obtener_paciente, puede_acceder_paciente


class AccesoClinico(BasePermission):
    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return es_medico(request.user)

    def has_object_permission(self, request, view, obj) -> bool:
        paciente = obtener_paciente(obj)
        if not paciente or not puede_acceder_paciente(request.user, paciente):
            return False
        if request.method in SAFE_METHODS:
            return True
        return es_medico(request.user)


class AccesoDiagnostico(AccesoClinico):
    pass

