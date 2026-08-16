from __future__ import annotations

from datetime import timedelta

from django.db.models import Count, Prefetch, Q
from django.db.models.functions import TruncWeek
from django.utils import timezone

from clinica.models import ConsultaClinica
from pacientes.models import AsignacionMedica, Paciente

from .models import Usuario
from .serializers import UsuarioLecturaSerializer


def _detalle_medico(usuario: Usuario) -> dict | None:
    if usuario.rol != Usuario.Rol.MEDICO:
        return None

    perfil = getattr(usuario, "perfil_medico", None)
    asignaciones = usuario.asignaciones_como_medico.filter(
        activa=True,
        es_principal=True,
    )
    hoy = timezone.localdate()
    inicio_mes = hoy.replace(day=1)
    inicio_semana = hoy - timedelta(days=hoy.weekday())
    desde_semana = inicio_semana - timedelta(weeks=3)
    consultas = ConsultaClinica.objects.filter(medico=usuario)
    totales_por_semana = {
        fila["semana"].date(): fila["total"]
        for fila in consultas.filter(iniciada_en__date__gte=desde_semana)
        .annotate(semana=TruncWeek("iniciada_en"))
        .values("semana")
        .annotate(total=Count("id"))
        .order_by("semana")
    }
    return {
        "numero_colegiatura": perfil.numero_colegiatura if perfil else None,
        "especialidad": perfil.especialidad if perfil else "",
        "cargo": perfil.cargo if perfil else "",
        "estado_laboral": perfil.estado_laboral if perfil else "INACTIVO",
        "pacientes_asignados": asignaciones.count(),
        "pacientes_activos": asignaciones.filter(paciente__estado=Paciente.Estado.ACTIVO).count(),
        "pacientes_principales": asignaciones.filter(es_principal=True).count(),
        "consultas_este_mes": consultas.filter(iniciada_en__date__gte=inicio_mes).count(),
        "consultas_por_semana": [
            {
                "semana_desde": (desde_semana + timedelta(weeks=indice)).isoformat(),
                "total": totales_por_semana.get(desde_semana + timedelta(weeks=indice), 0),
            }
            for indice in range(4)
        ],
    }


def _pacientes_vinculados(usuario: Usuario) -> list[dict]:
    if usuario.rol != Usuario.Rol.PACIENTE:
        return []

    pacientes = (
        Paciente.objects.filter(
            Q(tutores__usuario=usuario, tutores__autorizado=True)
            | Q(cuenta_movil__usuario=usuario)
        )
        .select_related("cuenta_movil")
        .prefetch_related(
            "tutores",
            Prefetch(
                "asignaciones_medicas",
                queryset=AsignacionMedica.objects.filter(
                    activa=True,
                    es_principal=True,
                ).select_related("medico", "medico__perfil_medico"),
                to_attr="asignacion_actual_administrativa",
            ),
            Prefetch(
                "consultas",
                queryset=ConsultaClinica.objects.filter(
                    estado=ConsultaClinica.Estado.COMPLETADA,
                )
                .select_related("medico")
                .order_by("-completada_en", "-creado_en"),
                to_attr="consultas_atendidas_administrativas",
            ),
        )
        .distinct()
        .order_by("apellidos", "nombres")
    )

    resultado = []
    for paciente in pacientes:
        vinculo = next(
            (
                tutor
                for tutor in paciente.tutores.all()
                if tutor.usuario_id == usuario.id and tutor.autorizado
            ),
            None,
        )
        cuenta = getattr(paciente, "cuenta_movil", None)
        asignaciones = paciente.asignacion_actual_administrativa
        asignacion = asignaciones[0] if asignaciones else None
        consultas = paciente.consultas_atendidas_administrativas
        ultima_consulta = consultas[0] if consultas else None
        perfil_medico = (
            getattr(asignacion.medico, "perfil_medico", None)
            if asignacion
            else None
        )
        resultado.append(
            {
                "id": paciente.id,
                "historia_clinica": paciente.historia_clinica,
                "dni": paciente.dni,
                "nombre_completo": paciente.nombre_completo,
                "fecha_nacimiento": (
                    paciente.fecha_nacimiento.isoformat()
                    if paciente.fecha_nacimiento
                    else None
                ),
                "edad": paciente.edad if paciente.fecha_nacimiento else None,
                "sexo": paciente.get_sexo_display(),
                "grupo_sanguineo": paciente.grupo_sanguineo,
                "nacionalidad": paciente.nacionalidad,
                "procedencia": paciente.procedencia,
                "direccion": paciente.direccion,
                "distrito": paciente.distrito,
                "idioma_preferido": paciente.idioma_preferido,
                "estado": paciente.estado,
                "perfil_completo": paciente.perfil_completo,
                "medico_responsable": {
                    "id": str(asignacion.medico_id),
                    "nombre": asignacion.medico.nombre_completo,
                    "especialidad": perfil_medico.especialidad if perfil_medico else "",
                }
                if asignacion
                else None,
                "atendido_por": {
                    "id": str(ultima_consulta.medico_id),
                    "nombre": ultima_consulta.medico.nombre_completo,
                }
                if ultima_consulta
                else None,
                "vinculo": {
                    "parentesco": vinculo.get_parentesco_display(),
                    "es_principal": vinculo.es_principal,
                    "telefono": vinculo.telefono_principal,
                    "correo": vinculo.correo,
                }
                if vinculo
                else None,
                "cuenta_movil": {
                    "alias": cuenta.alias,
                    "estado": cuenta.estado,
                    "dispositivo": cuenta.dispositivo,
                    "ultimo_acceso_en": cuenta.ultimo_acceso_en,
                }
                if cuenta and cuenta.usuario_id == usuario.id
                else None,
            }
        )
    return resultado


def construir_detalle_administrativo(usuario: Usuario) -> dict:
    """Devuelve datos de cuenta y perfil sin exponer información clínica."""

    return {
        "alcance": "ADMINISTRATIVO",
        "incluye_datos_clinicos": False,
        "tipo_detalle": usuario.rol,
        "usuario": UsuarioLecturaSerializer(usuario).data,
        "detalle_medico": _detalle_medico(usuario),
        "pacientes": _pacientes_vinculados(usuario),
    }
