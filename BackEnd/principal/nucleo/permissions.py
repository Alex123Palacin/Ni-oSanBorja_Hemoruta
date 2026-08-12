from rest_framework.permissions import BasePermission


class EsUsuarioActivo(BasePermission):
    """Autoriza únicamente cuentas autenticadas y habilitadas."""

    message = "La cuenta no está activa."

    def has_permission(self, request, view):
        usuario = request.user
        return bool(
            usuario
            and usuario.is_authenticated
            and usuario.is_active
            and getattr(usuario, "estado", None) == "ACTIVO"
        )
