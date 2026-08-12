from django.contrib.auth.models import UserManager


class UsuarioManager(UserManager):
    """Asegura que las cuentas creadas por consola tengan un estado coherente."""

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("rol", "ADMINISTRADOR")
        extra_fields.setdefault("estado", "ACTIVO")
        extra_fields.setdefault("requiere_cambio_password", False)
        extra_fields.setdefault("is_active", True)
        return super().create_superuser(username, email, password, **extra_fields)
