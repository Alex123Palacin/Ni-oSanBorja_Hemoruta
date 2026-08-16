from __future__ import annotations

from uuid import uuid4

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import CuentaMovilPaciente, Paciente


def generar_historia_clinica() -> str:
    prefijo = f"HC-{timezone.localdate().year}-"
    while True:
        historia = f"{prefijo}{uuid4().hex[:8].upper()}"
        if not Paciente.objects.filter(historia_clinica=historia).exists():
            return historia


def _generar_alias_cuenta(usuario) -> str:
    base = (usuario.username or f"paciente-{usuario.pk}")[:72]
    candidato = base
    consecutivo = 2
    while CuentaMovilPaciente.objects.filter(alias__iexact=candidato).exists():
        sufijo = f"-{consecutivo}"
        candidato = f"{base[: 80 - len(sufijo)]}{sufijo}"
        consecutivo += 1
    return candidato


@transaction.atomic
def vincular_usuario_con_paciente(usuario, *, creado_por=None) -> Paciente:
    """Crea o vincula la ficha provisional asociada a una cuenta de paciente."""

    if usuario.rol != "PACIENTE":
        raise ValidationError("Solo una cuenta con rol PACIENTE puede vincularse a una ficha.")

    cuenta_existente = (
        CuentaMovilPaciente.objects.select_for_update()
        .select_related("paciente")
        .filter(usuario=usuario)
        .first()
    )
    if cuenta_existente:
        sincronizar_cuentas_paciente(usuario)
        return cuenta_existente.paciente

    paciente = None
    if usuario.dni:
        paciente = (
            Paciente.objects.select_for_update()
            .filter(dni=usuario.dni)
            .first()
        )

    if paciente is None:
        paciente = Paciente.objects.create(
            historia_clinica=generar_historia_clinica(),
            dni=usuario.dni,
            nombres=usuario.first_name,
            apellidos=usuario.last_name,
            fecha_nacimiento=None,
            estado=(
                Paciente.Estado.ACTIVO
                if usuario.is_active
                else Paciente.Estado.PENDIENTE
            ),
            perfil_completo=False,
            creado_por=creado_por,
        )

    cuenta_asignada = (
        CuentaMovilPaciente.objects.select_for_update()
        .filter(paciente=paciente)
        .first()
    )
    if cuenta_asignada and cuenta_asignada.usuario_id != usuario.pk:
        raise ValidationError(
            {
                "dni": (
                    "La ficha encontrada ya tiene una cuenta de paciente vinculada. "
                    "Revise el DNI antes de continuar."
                )
            }
        )

    if not cuenta_asignada:
        CuentaMovilPaciente.objects.create(
            paciente=paciente,
            usuario=usuario,
            alias=_generar_alias_cuenta(usuario),
            estado=(
                CuentaMovilPaciente.Estado.ACTIVA
                if usuario.is_active
                else CuentaMovilPaciente.Estado.PENDIENTE
            ),
            habilitada_en=timezone.now() if usuario.is_active else None,
        )
    return paciente


def sincronizar_cuentas_paciente(usuario) -> None:
    if usuario.rol != "PACIENTE":
        return

    estado = (
        CuentaMovilPaciente.Estado.ACTIVA
        if usuario.is_active
        else CuentaMovilPaciente.Estado.SUSPENDIDA
    )
    cambios = {"estado": estado}
    if usuario.is_active:
        cambios["habilitada_en"] = timezone.now()
    CuentaMovilPaciente.objects.filter(usuario=usuario).update(**cambios)


def registrar_acceso_cuenta_paciente(usuario) -> None:
    if usuario.rol == "PACIENTE":
        CuentaMovilPaciente.objects.filter(usuario=usuario).update(
            ultimo_acceso_en=timezone.now()
        )
