from django.core.exceptions import ValidationError
from django.db import transaction

from pacientes.services import sincronizar_cuentas_paciente

from .models import Usuario


@transaction.atomic
def activar_usuario(usuario: Usuario) -> Usuario:
    usuario.estado = Usuario.Estado.ACTIVO
    usuario.is_active = True
    usuario.save(update_fields=("estado", "is_active", "actualizado_en"))
    sincronizar_cuentas_paciente(usuario)
    return usuario


@transaction.atomic
def desactivar_usuario(usuario: Usuario) -> Usuario:
    usuario.estado = Usuario.Estado.INACTIVO
    usuario.is_active = False
    if hasattr(usuario, "auth_token"):
        usuario.auth_token.delete()
    usuario.save(update_fields=("estado", "is_active", "actualizado_en"))
    sincronizar_cuentas_paciente(usuario)
    return usuario


@transaction.atomic
def cambiar_contrasena(
    usuario: Usuario,
    nueva_contrasena: str,
    requiere_cambio: bool = False,
) -> Usuario:
    if not nueva_contrasena:
        raise ValidationError("La contraseña no puede estar vacía.")
    usuario.set_password(nueva_contrasena)
    usuario.requiere_cambio_password = requiere_cambio
    usuario.save(update_fields=("password", "requiere_cambio_password", "actualizado_en"))
    if hasattr(usuario, "auth_token"):
        usuario.auth_token.delete()
    return usuario
