from __future__ import annotations

from typing import Any

from django.db.models import Q, QuerySet
from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import Paciente


ROL_ADMINISTRADOR = "ADMINISTRADOR"
ROL_MEDICO = "MEDICO"
ROL_PACIENTE = "PACIENTE"


def usuario_autenticado(usuario: Any) -> bool:
    return bool(usuario and getattr(usuario, "is_authenticated", False))


def es_administrador(usuario: Any) -> bool:
    return usuario_autenticado(usuario) and (
        getattr(usuario, "is_superuser", False) or getattr(usuario, "rol", None) == ROL_ADMINISTRADOR
    )


def es_medico(usuario: Any) -> bool:
    return usuario_autenticado(usuario) and getattr(usuario, "rol", None) == ROL_MEDICO


def obtener_paciente(objeto: Any) -> Paciente | None:
    actual = objeto
    visitados: set[int] = set()
    for _ in range(6):
        if isinstance(actual, Paciente):
            return actual
        if actual is None or id(actual) in visitados:
            return None
        visitados.add(id(actual))
        siguiente = None
        for atributo in (
            "paciente",
            "prescripcion",
            "dosis_programada",
            "reporte",
            "consulta",
            "seccion",
            "plan",
            "horario",
            "evento",
            "documento",
        ):
            if hasattr(actual, atributo):
                siguiente = getattr(actual, atributo)
                if siguiente is not None:
                    break
        actual = siguiente
    return None


def puede_acceder_paciente(usuario: Any, paciente: Paciente, *, escritura: bool = False) -> bool:
    if es_administrador(usuario):
        return True
    if es_medico(usuario):
        # La historia asistencial es compartida por el equipo médico del hospital.
        return True
    if not usuario_autenticado(usuario):
        return False
    tiene_vinculo = paciente.tutores.filter(usuario=usuario, autorizado=True).exists()
    tiene_cuenta = hasattr(paciente, "cuenta_movil") and paciente.cuenta_movil.usuario_id == usuario.pk
    return tiene_vinculo or tiene_cuenta


def pacientes_visibles_para(usuario: Any, queryset: QuerySet[Paciente] | None = None) -> QuerySet[Paciente]:
    queryset = queryset if queryset is not None else Paciente.objects.all()
    if es_administrador(usuario):
        return queryset
    if es_medico(usuario):
        return queryset
    if usuario_autenticado(usuario):
        return queryset.filter(
            Q(tutores__usuario=usuario, tutores__autorizado=True) | Q(cuenta_movil__usuario=usuario)
        ).distinct()
    return queryset.none()


class EsPersonalHospitalario(BasePermission):
    def has_permission(self, request, view) -> bool:
        return es_administrador(request.user) or es_medico(request.user)


class PuedeAccederPaciente(BasePermission):
    def has_permission(self, request, view) -> bool:
        return usuario_autenticado(request.user)

    def has_object_permission(self, request, view, obj) -> bool:
        paciente = obtener_paciente(obj)
        return bool(
            paciente
            and puede_acceder_paciente(
                request.user,
                paciente,
                escritura=request.method not in SAFE_METHODS,
            )
        )


class SoloAdministradorParaModificarAsignacion(BasePermission):
    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return usuario_autenticado(request.user)
        return es_administrador(request.user)

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            paciente = obtener_paciente(obj)
            return bool(paciente and puede_acceder_paciente(request.user, paciente))
        return es_administrador(request.user)


class SoloMedico(BasePermission):
    def has_permission(self, request, view) -> bool:
        return es_medico(request.user)


class SoloPacienteOResponsable(BasePermission):
    def has_permission(self, request, view) -> bool:
        return usuario_autenticado(request.user) and getattr(request.user, "rol", None) == ROL_PACIENTE


def paciente_del_usuario(usuario: Any) -> Paciente | None:
    if not usuario_autenticado(usuario):
        return None
    candidatos = Paciente.objects.filter(
        Q(tutores__usuario=usuario, tutores__autorizado=True) | Q(cuenta_movil__usuario=usuario)
    ).distinct()[:2]
    encontrados = list(candidatos)
    return encontrados[0] if len(encontrados) == 1 else None
