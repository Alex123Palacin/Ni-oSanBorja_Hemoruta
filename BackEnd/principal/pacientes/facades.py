from django.db.models import Prefetch, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from citas.models import Cita
from clinica.models import ConsultaClinica, Diagnostico
from documentos.models import DocumentoPaciente
from seguimiento.models import SemaforoPaciente

from .models import AsignacionMedica, Paciente, TutorPaciente
from .paginacion import paginar_resultados
from .permissions import SoloMedico, SoloPacienteOResponsable, paciente_del_usuario, pacientes_visibles_para


def _proxima_cita(paciente):
    citas = getattr(paciente, "proximas_citas_prefetch", [])
    return citas[0] if citas else None


def _diagnostico_principal(paciente):
    diagnosticos = getattr(paciente, "diagnosticos_principales_prefetch", [])
    return diagnosticos[0] if diagnosticos else None


def _tutor_principal(paciente):
    tutores = getattr(paciente, "tutores_principales_prefetch", [])
    return tutores[0] if tutores else None


def _asignacion_principal(paciente):
    asignaciones = getattr(paciente, "asignacion_principal_prefetch", [])
    return asignaciones[0] if asignaciones else None


def _ultima_consulta_atendida(paciente):
    consultas = getattr(paciente, "consultas_atendidas_prefetch", [])
    return consultas[0] if consultas else None


def queryset_pacientes_resumen(usuario):
    return pacientes_visibles_para(usuario).prefetch_related(
        Prefetch(
            "diagnosticos",
            queryset=Diagnostico.objects.filter(es_principal=True, estado=Diagnostico.Estado.ACTIVO),
            to_attr="diagnosticos_principales_prefetch",
        ),
        Prefetch(
            "tutores",
            queryset=TutorPaciente.objects.filter(es_principal=True, autorizado=True),
            to_attr="tutores_principales_prefetch",
        ),
        Prefetch(
            "citas",
            queryset=Cita.objects.filter(
                inicio__gte=timezone.now(),
                estado__in=(Cita.Estado.PENDIENTE, Cita.Estado.CONFIRMADA),
            ).order_by("inicio"),
            to_attr="proximas_citas_prefetch",
        ),
        Prefetch(
            "asignaciones_medicas",
            queryset=AsignacionMedica.objects.filter(
                activa=True,
                es_principal=True,
            ).select_related("medico", "medico__perfil_medico"),
            to_attr="asignacion_principal_prefetch",
        ),
        Prefetch(
            "consultas",
            queryset=ConsultaClinica.objects.filter(
                estado=ConsultaClinica.Estado.COMPLETADA,
            )
            .select_related("medico")
            .order_by("-completada_en", "-creado_en"),
            to_attr="consultas_atendidas_prefetch",
        ),
    )


def serializar_paciente_lista(paciente):
    diagnostico = _diagnostico_principal(paciente)
    tutor = _tutor_principal(paciente)
    cita = _proxima_cita(paciente)
    asignacion = _asignacion_principal(paciente)
    ultima_consulta = _ultima_consulta_atendida(paciente)
    return {
        "id": str(paciente.id),
        "nombre": paciente.nombre_completo,
        "dni": paciente.dni or "",
        "edad": paciente.edad if paciente.fecha_nacimiento else None,
        "historiaClinica": paciente.historia_clinica,
        "diagnosticoPrincipal": (
            {"id": str(diagnostico.id), "nombre": diagnostico.nombre} if diagnostico else None
        ),
        "tutor": (
            {
                "id": str(tutor.id),
                "nombre": f"{tutor.nombres} {tutor.apellidos}".strip(),
                "parentesco": tutor.parentesco,
            }
            if tutor
            else None
        ),
        "proximaCitaEn": cita.inicio.isoformat() if cita else None,
        "estadoCita": cita.estado if cita else "SIN_CITA",
        "medicoResponsable": (
            {
                "id": str(asignacion.medico_id),
                "nombre": asignacion.medico.nombre_completo,
                "especialidad": getattr(
                    getattr(asignacion.medico, "perfil_medico", None),
                    "especialidad",
                    "",
                ),
            }
            if asignacion
            else None
        ),
        "atendidoPor": (
            {
                "id": str(ultima_consulta.medico_id),
                "nombre": ultima_consulta.medico.nombre_completo,
            }
            if ultima_consulta
            else None
        ),
    }


class ListaPacientesMedicoAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloMedico)

    def get(self, request):
        queryset = queryset_pacientes_resumen(request.user)
        termino = request.query_params.get("q", "").strip()
        tipo_busqueda = request.query_params.get("tipoBusqueda", "").upper()
        if termino:
            if tipo_busqueda == "DNI":
                queryset = queryset.filter(dni__icontains=termino)
            elif tipo_busqueda == "HISTORIA_CLINICA":
                queryset = queryset.filter(historia_clinica__icontains=termino)
            elif tipo_busqueda == "NOMBRE":
                queryset = queryset.filter(Q(nombres__icontains=termino) | Q(apellidos__icontains=termino))
            else:
                queryset = queryset.filter(
                    Q(dni__icontains=termino)
                    | Q(historia_clinica__icontains=termino)
                    | Q(nombres__icontains=termino)
                    | Q(apellidos__icontains=termino)
                )
        diagnostico_id = request.query_params.get("diagnosticoId")
        if diagnostico_id:
            queryset = queryset.filter(diagnosticos__id=diagnostico_id).distinct()
        estado = request.query_params.get("estado")
        if estado:
            queryset = queryset.filter(estado=estado)
        return paginar_resultados(request, queryset.order_by("apellidos", "nombres"), serializar_paciente_lista)


class FichaPacienteMedicoAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloMedico)

    def get(self, request, paciente_id):
        paciente = get_object_or_404(
            queryset_pacientes_resumen(request.user)
            .select_related("cuenta_movil")
            .prefetch_related(
                "tutores",
                Prefetch(
                    "documentos",
                    queryset=DocumentoPaciente.objects.filter(
                        estado__in=(
                            DocumentoPaciente.Estado.PENDIENTE,
                            DocumentoPaciente.Estado.DISPONIBLE,
                        )
                    ).order_by("-creado_en")[:3],
                    to_attr="documentos_recientes_prefetch",
                ),
                Prefetch(
                    "historial_semaforo",
                    queryset=SemaforoPaciente.objects.filter(es_actual=True),
                    to_attr="semaforo_actual_prefetch",
                ),
            ),
            pk=paciente_id,
        )
        diagnostico = _diagnostico_principal(paciente)
        cita = _proxima_cita(paciente)
        cuenta = getattr(paciente, "cuenta_movil", None)
        semaforos = getattr(paciente, "semaforo_actual_prefetch", [])
        semaforo = semaforos[0] if semaforos else None
        return Response(
            {
                "id": str(paciente.id),
                "nombre": paciente.nombre_completo,
                "historiaClinica": paciente.historia_clinica,
                "version": int(paciente.actualizado_en.timestamp()),
                "datosGenerales": {
                    "dni": paciente.dni,
                    "fechaNacimiento": (
                        paciente.fecha_nacimiento.isoformat()
                        if paciente.fecha_nacimiento
                        else None
                    ),
                    "sexo": paciente.sexo,
                    "grupoSanguineo": paciente.grupo_sanguineo or None,
                    "lugarNacimiento": paciente.lugar_nacimiento or None,
                    "nacionalidad": paciente.nacionalidad or None,
                    "procedencia": paciente.procedencia or None,
                    "direccion": paciente.direccion or None,
                    "distrito": paciente.distrito or None,
                    "idiomaPreferido": paciente.idioma_preferido or None,
                },
                "diagnosticoPrincipal": (
                    {"id": str(diagnostico.id), "nombre": diagnostico.nombre} if diagnostico else None
                ),
                "responsables": [
                    {
                        "id": str(tutor.id),
                        "nombre": f"{tutor.nombres} {tutor.apellidos}".strip(),
                        "parentesco": tutor.parentesco,
                        "telefono": tutor.telefono_principal or None,
                    }
                    for tutor in paciente.tutores.all()
                    if tutor.autorizado
                ],
                "cuentaMovil": {
                    "estado": cuenta.estado if cuenta else "NO_HABILITADA",
                    "ultimoAccesoEn": cuenta.ultimo_acceso_en.isoformat() if cuenta and cuenta.ultimo_acceso_en else None,
                },
                "proximaCitaEn": cita.inicio.isoformat() if cita else None,
                "semaforo": {
                    "codigo": semaforo.nivel if semaforo else "SIN_DATOS",
                    "descripcion": semaforo.motivo if semaforo else "Sin evaluacion vigente",
                },
                "documentosRecientes": [
                    {
                        "id": str(documento.id),
                        "nombre": documento.titulo,
                        "nombreOriginal": documento.nombre_original,
                        "tipoMime": documento.tipo_mime,
                        "creadoEn": documento.creado_en.isoformat(),
                        "estado": documento.estado,
                        "archivoDisponible": bool(documento.archivo),
                    }
                    for documento in getattr(paciente, "documentos_recientes_prefetch", [])
                ],
            }
        )


class InicioPacienteAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloPacienteOResponsable)

    def get(self, request):
        paciente_base = paciente_del_usuario(request.user)
        if not paciente_base:
            return Response({"detalle": "La cuenta no esta vinculada a un paciente."}, status=404)
        paciente = queryset_pacientes_resumen(request.user).get(pk=paciente_base.pk)
        cita = _proxima_cita(paciente)
        campos = (
            paciente.dni,
            paciente.direccion,
            paciente.distrito,
            paciente.grupo_sanguineo,
            paciente.procedencia,
            paciente.idioma_preferido,
        )
        porcentaje = round(sum(bool(campo) for campo in campos) / len(campos) * 100)
        return Response(
            {
                "paciente": {
                    "id": str(paciente.id),
                    "nombre": paciente.nombre_completo,
                    "edad": paciente.edad if paciente.fecha_nacimiento else None,
                    "historiaClinica": paciente.historia_clinica,
                    "estado": paciente.estado,
                },
                "porcentajePerfil": porcentaje,
                "proximaCita": (
                    {"estado": cita.estado, "fechaHora": cita.inicio.isoformat()} if cita else None
                ),
            }
        )
