from rest_framework.permissions import BasePermission

from nucleo.permissions import EsUsuarioActivo

from .models import Usuario


class EsAdministrador(EsUsuarioActivo):
    message = "Se requiere una cuenta de administrador activa."

    def has_permission(self, request, view):
        return super().has_permission(request, view) and (
            request.user.rol == Usuario.Rol.ADMINISTRADOR
        )


class EsAdministradorOMismoUsuario(BasePermission):
    """Útil para endpoints que acepten administración o acceso al propio perfil."""

    message = "No tiene permiso para acceder a esta cuenta."

    def has_object_permission(self, request, view, obj):
        return request.user.rol == Usuario.Rol.ADMINISTRADOR or obj == request.user
