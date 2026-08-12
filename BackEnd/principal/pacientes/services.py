from __future__ import annotations

import secrets
from uuid import uuid4

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import AsignacionMedica, CuentaMovilPaciente, Paciente, TutorPaciente


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


def _separar_nombre_completo(nombre_completo: str) -> tuple[str, str]:
    partes = nombre_completo.split()
    if len(partes) == 2:
        return partes[0], partes[1]
    if len(partes) == 3:
        return " ".join(partes[:2]), partes[2]
    return " ".join(partes[:-2]), " ".join(partes[-2:])


def _generar_username(dni: str) -> str:
    from usuarios.models import Usuario

    candidato = dni
    consecutivo = 2
    while Usuario.objects.filter(username__iexact=candidato).exists():
        candidato = f"{dni}-{consecutivo}"
        consecutivo += 1
    return candidato


def _generar_password_temporal() -> str:
    # La clave se muestra una sola vez al médico y debe cambiarse al ingresar.
    return f"Hr-{secrets.token_urlsafe(7)}-9a"


@transaction.atomic
def registrar_paciente_provisional_por_medico(
    *,
    medico,
    nombre_completo: str,
    dni: str,
    telefono: str,
    correo: str = "",
) -> tuple[Paciente, object, str]:
    """Crea ficha provisional, asignación y acceso local para la familia."""

    from usuarios.models import Usuario

    nombres, apellidos = _separar_nombre_completo(nombre_completo)
    paciente = Paciente.objects.create(
        historia_clinica=generar_historia_clinica(),
        dni=dni,
        nombres=nombres,
        apellidos=apellidos,
        fecha_nacimiento=None,
        estado=Paciente.Estado.ACTIVO,
        perfil_completo=False,
        creado_por=medico,
    )
    AsignacionMedica.objects.create(
        paciente=paciente,
        medico=medico,
        es_principal=True,
        activa=True,
        asignado_por=medico,
    )
    TutorPaciente.objects.create(
        paciente=paciente,
        nombres="Responsable",
        apellidos="por completar",
        parentesco=TutorPaciente.Parentesco.TUTOR,
        telefono_principal=telefono,
        correo=correo,
        preferencia_contacto=TutorPaciente.PreferenciaContacto.APP,
        es_principal=True,
        autorizado=True,
    )

    password_temporal = _generar_password_temporal()
    usuario = Usuario.objects.create_user(
        username=_generar_username(dni),
        password=password_temporal,
        first_name=nombres,
        last_name=apellidos,
        dni=dni,
        email=correo or None,
        telefono=telefono,
        rol=Usuario.Rol.PACIENTE,
        estado=Usuario.Estado.ACTIVO,
        requiere_cambio_password=True,
        is_active=True,
    )
    vincular_usuario_con_paciente(usuario, creado_por=medico)
    return paciente, usuario, password_temporal


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
