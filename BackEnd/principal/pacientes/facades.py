from django.db.models import Prefetch, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from citas.models import Cita
from clinica.models import Diagnostico
from documentos.models import DocumentoPaciente
from seguimiento.models import SemaforoPaciente

from .models import Paciente, TutorPaciente
from .paginacion import paginar_resultados
from .permissions import SoloMedico, SoloPacienteOResponsable, paciente_del_usuario, pacientes_visibles_para
from .services import registrar_paciente_provisional_por_medico


class AltaPacienteMedicoSerializer(serializers.Serializer):
    nombreCompleto = serializers.CharField(max_length=241, trim_whitespace=True)
    dni = serializers.RegexField(r"^\d{8}$", error_messages={"invalid": "El DNI debe contener exactamente 8 dígitos."})
    telefono = serializers.CharField(max_length=20, trim_whitespace=True)
    correo = serializers.EmailField(required=False, allow_blank=True)

    def validate_nombreCompleto(self, valor):
        if len(valor.split()) < 2:
            raise serializers.ValidationError("Ingresa al menos un nombre y un apellido.")
        return " ".join(valor.split())

    def validate_telefono(self, valor):
        digitos = "".join(caracter for caracter in valor if caracter.isdigit())
        if len(digitos) < 9 or len(digitos) > 12:
            raise serializers.ValidationError("Ingresa un teléfono válido de 9 a 12 dígitos.")
        return valor.strip()

    def validate(self, datos):
        from usuarios.models import Usuario

        if Paciente.objects.filter(dni=datos["dni"]).exists():
            raise serializers.ValidationError({"dni": "Ya existe un paciente registrado con este DNI."})
        if Usuario.objects.filter(dni=datos["dni"]).exists():
            raise serializers.ValidationError({"dni": "Este DNI ya está vinculado a una cuenta."})
        correo = datos.get("correo", "")
        if correo and Usuario.objects.filter(email__iexact=correo).exists():
            raise serializers.ValidationError({"correo": "Este correo ya está vinculado a una cuenta."})
        return datos


def _proxima_cita(paciente):
    citas = getattr(paciente, "proximas_citas_prefetch", [])
    return citas[0] if citas else None


def _diagnostico_principal(paciente):
    diagnosticos = getattr(paciente, "diagnosticos_principales_prefetch", [])
    return diagnosticos[0] if diagnosticos else None


def _tutor_principal(paciente):
    tutores = getattr(paciente, "tutores_principales_prefetch", [])
    return tutores[0] if tutores else None


def queryset_pacientes_resumen(usuario):
    return pacientes_visibles_para(usuario).select_related("creado_por").prefetch_related(
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
    )


def serializar_paciente_lista(paciente):
    diagnostico = _diagnostico_principal(paciente)
    tutor = _tutor_principal(paciente)
    cita = _proxima_cita(paciente)
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
        "registradoPor": (
            {
                "id": str(paciente.creado_por_id),
                "nombre": paciente.creado_por.nombre_completo,
                "rol": paciente.creado_por.rol,
            }
            if paciente.creado_por
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


class AltaPacienteMedicoAPIView(APIView):
    permission_classes = (IsAuthenticated, SoloMedico)

    def post(self, request):
        serializer = AltaPacienteMedicoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        paciente, usuario, password_temporal = registrar_paciente_provisional_por_medico(
            medico=request.user,
            nombre_completo=serializer.validated_data["nombreCompleto"],
            dni=serializer.validated_data["dni"],
            telefono=serializer.validated_data["telefono"],
            correo=serializer.validated_data.get("correo", ""),
        )
        return Response(
            {
                "paciente": {
                    "id": str(paciente.id),
                    "nombre": paciente.nombre_completo,
                    "dni": paciente.dni,
                    "historiaClinica": paciente.historia_clinica,
                    "estado": paciente.estado,
                    "perfilCompleto": paciente.perfil_completo,
                },
                "cuenta": {
                    "usuario": usuario.username,
                    "contrasenaTemporal": password_temporal,
                    "requiereCambioContrasena": usuario.requiere_cambio_password,
                    "estado": usuario.estado,
                },
            },
            status=status.HTTP_201_CREATED,
        )


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
