from __future__ import annotations

import hashlib
import os
from datetime import date, datetime, time, timedelta
from decimal import Decimal

from django.apps import apps
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from citas.models import Cita
from clinica.models import (
    ConsultaClinica,
    Diagnostico,
    ItemPlanTratamiento,
    ItemSeccionConsulta,
    PlanTratamiento,
    SeccionConsulta,
)
from documentos.models import DocumentoPaciente
from medicacion.models import (
    DiaHorarioPrescripcion,
    DosisProgramada,
    HorarioPrescripcion,
    Medicamento,
    Prescripcion,
    ReporteDosis,
)
from medicacion.services import registrar_reporte_dosis
from pacientes.models import AsignacionMedica, CuentaMovilPaciente, Paciente, TutorPaciente
from seguimiento.models import (
    CatalogoSintoma,
    EventoSeguimiento,
    ReporteSintomas,
    SemaforoPaciente,
    SintomaReportado,
)
from seguimiento.services import registrar_reporte_sintomas


MEDICOS_DEMO = (
    {
        "username": "valeria.ruiz",
        "first_name": "Valeria",
        "last_name": "Ruiz",
        "email": "valeria.ruiz@hnsb.gob.pe",
        "dni": "40123456",
        "telefono": "+51 987 654 321",
        "colegiatura": "CMP-DEMO-001",
        "especialidad": "Hematología Pediátrica",
        "cargo": "Médica tratante",
    },
    {
        "username": "luis.paredes",
        "first_name": "Luis",
        "last_name": "Paredes",
        "email": "luis.paredes@hnsb.gob.pe",
        "dni": "43321108",
        "telefono": "+51 987 654 322",
        "colegiatura": "CMP-DEMO-002",
        "especialidad": "Hematología Pediátrica",
        "cargo": "Médico asistente",
    },
)


PACIENTES_DEMO = (
    {
        "historia": "HC-2024-01568",
        "dni": "71562384",
        "nombres": "Mateo Gabriel",
        "apellidos": "Flores",
        "nacimiento": date(2017, 3, 16),
        "sexo": Paciente.Sexo.MASCULINO,
        "grupo_sanguineo": "O+",
        "diagnostico": "Leucemia linfoblástica aguda (LLA)",
        "cie10": "C91.0",
        "cuenta": {
            "username": "maria.flores",
            "first_name": "María",
            "last_name": "Flores López",
            "email": "maria.flores@example.com",
            "dni": "45678912",
            "telefono": "+51 987 654 321",
            "alias": "mateo.flores",
            "parentesco": TutorPaciente.Parentesco.MADRE,
        },
        "medicaciones": (
            {
                "codigo": "DEMO-PRED-10",
                "nombre": "Prednisona",
                "forma": "tableta",
                "concentracion": "10 mg",
                "cantidad": "10",
                "unidad": "mg",
                "horas": (time(8, 0),),
                "dias": tuple(range(7)),
                "frecuencia": "Cada 24 horas",
                "indicaciones": "Tomar a las 08:00 a. m. después del desayuno.",
                "reportes": {-3: "TOMADA", -2: "TARDE", -1: "TOMADA"},
            },
            {
                "codigo": "DEMO-OMEP-20",
                "nombre": "Omeprazol",
                "forma": "cápsula",
                "concentracion": "20 mg",
                "cantidad": "20",
                "unidad": "mg",
                "horas": (time(13, 0),),
                "dias": tuple(range(7)),
                "frecuencia": "Cada 24 horas",
                "indicaciones": "Tomar a la 01:00 p. m.",
                "reportes": {-3: "TOMADA", -2: "TOMADA", -1: "NO_TOMADA"},
            },
            {
                "codigo": "DEMO-FOLI-5",
                "nombre": "Ácido fólico",
                "forma": "tableta",
                "concentracion": "5 mg",
                "cantidad": "5",
                "unidad": "mg",
                "horas": (time(20, 0),),
                "dias": tuple(range(7)),
                "frecuencia": "Cada 24 horas",
                "indicaciones": "Tomar a las 08:00 p. m.",
                "reportes": {-3: "TOMADA", -2: "TOMADA", -1: "TOMADA"},
            },
            {
                "codigo": "DEMO-SULF-300",
                "nombre": "Sulfato ferroso",
                "forma": "tableta",
                "concentracion": "300 mg",
                "cantidad": "1",
                "unidad": "tableta",
                "horas": (time(9, 0),),
                "dias": (0, 2, 4),
                "frecuencia": "Lunes, miércoles y viernes",
                "indicaciones": "Tomar a las 09:00 a. m. los días indicados.",
                "reportes": {-3: "TOMADA", -2: "TOMADA", -1: "TARDE"},
            },
        ),
        "sintomas": (
            {
                "dias": -4,
                "codigos": ("cansancio",),
                "intensidad": ReporteSintomas.Intensidad.MODERADA,
                "duracion": ReporteSintomas.Duracion.ENTRE_1_6_HORAS,
                "evolucion": ReporteSintomas.Evolucion.MEJORO,
                "descripcion": "Cansancio leve durante la tarde.",
            },
            {
                "dias": -1,
                "codigos": ("nauseas",),
                "intensidad": ReporteSintomas.Intensidad.LEVE,
                "duracion": ReporteSintomas.Duracion.MENOS_1_HORA,
                "evolucion": ReporteSintomas.Evolucion.MEJORO,
                "descripcion": "Náuseas leves, sin fiebre.",
            },
        ),
        "semaforo": (SemaforoPaciente.Nivel.VERDE, "Sin síntomas significativos"),
        "documentos": (
            (DocumentoPaciente.Tipo.LABORATORIO, "Hemograma completo", "hemograma_completo.pdf", "application/pdf", 248000, 1),
            (DocumentoPaciente.Tipo.LABORATORIO, "Resultados laboratorio JPG", "resultados_laboratorio.jpg", "image/jpeg", 386000, 3),
            (DocumentoPaciente.Tipo.INFORME_MEDICO, "Informe médico escaneado", "informe_medico.pdf", "application/pdf", 192000, 5),
        ),
    },
    {
        "historia": "HC-2024-01569",
        "dni": "62438751",
        "nombres": "Luciana Valentina",
        "apellidos": "Rojas",
        "nacimiento": date(2019, 7, 8),
        "sexo": Paciente.Sexo.FEMENINO,
        "grupo_sanguineo": "A+",
        "diagnostico": "Anemia aplásica",
        "cie10": "D61.9",
        "cuenta": {
            "username": "carlos.rojas",
            "first_name": "Carlos",
            "last_name": "Rojas Paredes",
            "email": "carlos.rojas@example.com",
            "dni": "45789013",
            "telefono": "+51 987 650 010",
            "alias": "luciana.rojas",
            "parentesco": TutorPaciente.Parentesco.PADRE,
        },
        "medicaciones": (),
        "sintomas": (
            {
                "dias": -2,
                "codigos": ("cansancio",),
                "intensidad": ReporteSintomas.Intensidad.MODERADA,
                "duracion": ReporteSintomas.Duracion.ENTRE_1_6_HORAS,
                "evolucion": ReporteSintomas.Evolucion.IGUAL,
                "descripcion": "Cansancio moderado reportado por la familia.",
            },
        ),
        "semaforo": (SemaforoPaciente.Nivel.AMARILLO, "Síntomas leves en seguimiento"),
        "documentos": (
            (DocumentoPaciente.Tipo.LABORATORIO, "Hemograma de control", "hemograma_luciana.pdf", "application/pdf", 174000, 2),
        ),
    },
    {
        "historia": "HC-2024-01570",
        "dni": "80319276",
        "nombres": "Santiago André",
        "apellidos": "Medina",
        "nacimiento": date(2016, 9, 21),
        "sexo": Paciente.Sexo.MASCULINO,
        "grupo_sanguineo": "O+",
        "diagnostico": "Hemofilia A severa",
        "cie10": "D66",
        "cuenta": {
            "username": "veronica.medina",
            "first_name": "Verónica",
            "last_name": "Medina Ruiz",
            "email": "veronica.medina@example.com",
            "dni": "46789024",
            "telefono": "+51 987 650 011",
            "alias": "santiago.medina",
            "parentesco": TutorPaciente.Parentesco.MADRE,
        },
        "medicaciones": (),
        "sintomas": (
            {
                "dias": -3,
                "codigos": ("dolor",),
                "intensidad": ReporteSintomas.Intensidad.LEVE,
                "duracion": ReporteSintomas.Duracion.MENOS_1_HORA,
                "evolucion": ReporteSintomas.Evolucion.MEJORO,
                "descripcion": "Dolor leve y transitorio, ya controlado.",
            },
        ),
        "semaforo": (SemaforoPaciente.Nivel.VERDE, "Sin síntomas significativos"),
        "documentos": (
            (DocumentoPaciente.Tipo.INFORME_MEDICO, "Informe de hematología", "informe_santiago.pdf", "application/pdf", 221000, 4),
        ),
    },
    {
        "historia": "HC-2024-01571",
        "dni": "69254731",
        "nombres": "Camila Alejandra",
        "apellidos": "Torres",
        "nacimiento": date(2018, 11, 3),
        "sexo": Paciente.Sexo.FEMENINO,
        "grupo_sanguineo": "B+",
        "diagnostico": "Linfoma de Hodgkin",
        "cie10": "C81.9",
        "cuenta": {
            "username": "jorge.torres",
            "first_name": "Jorge",
            "last_name": "Torres Vega",
            "email": "jorge.torres@example.com",
            "dni": "47890135",
            "telefono": "+51 987 650 012",
            "alias": "camila.torres",
            "parentesco": TutorPaciente.Parentesco.PADRE,
        },
        "medicaciones": (),
        "sintomas": (
            {
                "dias": -1,
                "codigos": ("fiebre", "nauseas"),
                "intensidad": ReporteSintomas.Intensidad.FUERTE,
                "duracion": ReporteSintomas.Duracion.ENTRE_6_24_HORAS,
                "evolucion": ReporteSintomas.Evolucion.EMPEORO,
                "descripcion": "Fiebre de 38.2 °C y náuseas; requiere revisión médica.",
            },
        ),
        "semaforo": (SemaforoPaciente.Nivel.ROJO, "Síntomas fuertes que requieren revisión"),
        "documentos": (
            (DocumentoPaciente.Tipo.LABORATORIO, "Perfil hepático", "perfil_hepatico_camila.pdf", "application/pdf", 198000, 1),
        ),
    },
    {
        "historia": "HC-2024-01572",
        "dni": "73846219",
        "nombres": "Diego Alonso",
        "apellidos": "Pérez",
        "nacimiento": date(2017, 5, 14),
        "sexo": Paciente.Sexo.MASCULINO,
        "grupo_sanguineo": "A-",
        "diagnostico": "Talasemia beta mayor",
        "cie10": "D56.1",
        "cuenta": {
            "username": "katherine.perez",
            "first_name": "Katherine",
            "last_name": "Pérez Solís",
            "email": "katherine.perez@example.com",
            "dni": "48901246",
            "telefono": "+51 987 650 013",
            "alias": "diego.perez",
            "parentesco": TutorPaciente.Parentesco.MADRE,
        },
        "medicaciones": (),
        "sintomas": (
            {
                "dias": -2,
                "codigos": ("otro",),
                "intensidad": ReporteSintomas.Intensidad.LEVE,
                "duracion": ReporteSintomas.Duracion.MENOS_1_HORA,
                "evolucion": ReporteSintomas.Evolucion.MEJORO,
                "descripcion": "Sin novedades clínicas relevantes.",
            },
        ),
        "semaforo": (SemaforoPaciente.Nivel.VERDE, "Sin síntomas significativos"),
        "documentos": (
            (DocumentoPaciente.Tipo.PLAN_TRATAMIENTO, "Plan de transfusión vigente", "plan_diego.pdf", "application/pdf", 165000, 6),
        ),
    },
)


MEDICACION_SIMPLE = (
    {
        "codigo": "DEMO-FOLI-5",
        "nombre": "Ácido fólico",
        "forma": "tableta",
        "concentracion": "5 mg",
        "cantidad": "5",
        "unidad": "mg",
        "hora": time(8, 0),
    },
    {
        "codigo": "DEMO-TRAN-500",
        "nombre": "Ácido tranexámico",
        "forma": "tableta",
        "concentracion": "500 mg",
        "cantidad": "500",
        "unidad": "mg",
        "hora": time(8, 30),
    },
    {
        "codigo": "DEMO-PRED-10",
        "nombre": "Prednisona",
        "forma": "tableta",
        "concentracion": "10 mg",
        "cantidad": "10",
        "unidad": "mg",
        "hora": time(8, 0),
    },
    {
        "codigo": "DEMO-DEFE-250",
        "nombre": "Deferasirox",
        "forma": "tableta",
        "concentracion": "250 mg",
        "cantidad": "250",
        "unidad": "mg",
        "hora": time(9, 0),
    },
)


CATALOGO_SINTOMAS = (
    ("fiebre", "Fiebre"),
    ("dolor", "Dolor"),
    ("nauseas", "Náuseas"),
    ("vomitos", "Vómitos"),
    ("sangrado", "Sangrado"),
    ("cansancio", "Cansancio"),
    ("diarrea", "Diarrea"),
    ("otro", "Otro"),
)


class Command(BaseCommand):
    help = "Crea o actualiza un escenario clínico demostrativo completo, sin borrar datos existentes."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            help=(
                "Contraseña común para las cuentas demo. También puede definirse con "
                "HEMORUTA_DEMO_PASSWORD."
            ),
        )
        parser.add_argument("--admin-password", help="Contraseña exclusiva del administrador demo.")
        parser.add_argument("--doctor-password", help="Contraseña exclusiva de los médicos demo.")
        parser.add_argument("--patient-password", help="Contraseña exclusiva de las familias demo.")
        parser.add_argument("--admin-username", default="alex", help="Usuario administrador a preparar.")
        parser.add_argument(
            "--fecha-base",
            help="Fecha de referencia en formato AAAA-MM-DD. Por defecto se usa la fecha local.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.fecha_base = self._obtener_fecha_base(options.get("fecha_base"))
        self.zona = timezone.get_current_timezone()
        password_comun = options.get("password") or os.getenv("HEMORUTA_DEMO_PASSWORD")
        self.password_admin = options.get("admin_password") or password_comun
        self.password_medicos = options.get("doctor_password") or password_comun
        self.password_pacientes = options.get("patient_password") or password_comun
        self.Usuario = get_user_model()

        try:
            self.PerfilMedico = apps.get_model("usuarios", "PerfilMedico")
        except LookupError as exc:
            raise CommandError("La app usuarios debe estar instalada antes de ejecutar este seed.") from exc

        admin = self._crear_administrador(options["admin_username"])
        medicos = self._crear_medicos()
        catalogo = self._crear_catalogo_sintomas()

        for indice, datos in enumerate(PACIENTES_DEMO):
            paciente, cuenta = self._crear_paciente_y_familia(datos, medicos["valeria.ruiz"])
            self._crear_asignaciones_compartidas(paciente, medicos, admin)
            self._crear_diagnostico(paciente, datos, medicos["valeria.ruiz"])
            cita_pasada, _ = self._crear_citas(paciente, indice, medicos)
            consulta = self._crear_consulta(paciente, cita_pasada, datos, medicos["valeria.ruiz"])
            plan = self._crear_plan(paciente, consulta, datos, medicos["valeria.ruiz"])
            medicaciones = datos["medicaciones"] or (
                self._convertir_medicacion_simple(MEDICACION_SIMPLE[indice - 1]),
            )
            self._crear_medicacion(paciente, cuenta, consulta, plan, medicaciones, medicos["valeria.ruiz"])
            self._crear_reportes_sintomas(paciente, cuenta, datos["sintomas"], catalogo)
            self._establecer_semaforo_actual(paciente, datos["semaforo"], medicos["valeria.ruiz"])
            self._crear_documentos(paciente, cuenta, consulta, datos["documentos"])
            self._crear_eventos_clinicos(paciente, consulta, plan, medicos["valeria.ruiz"])

        self.stdout.write(
            self.style.SUCCESS(
                "Seed HemoRuta listo: 1 administrador, 2 médicos, 5 familias y un escenario clínico completo."
            )
        )
        if not any((self.password_admin, self.password_medicos, self.password_pacientes)):
            self.stdout.write(
                self.style.WARNING(
                    "No se cambió ninguna contraseña. Las cuentas nuevas quedaron sin contraseña utilizable."
                )
            )

    @staticmethod
    def _obtener_fecha_base(valor: str | None) -> date:
        if not valor:
            return timezone.localdate()
        try:
            return date.fromisoformat(valor)
        except ValueError as exc:
            raise CommandError("--fecha-base debe usar el formato AAAA-MM-DD.") from exc

    def _guardar_usuario(self, *, username: str, password: str | None, **datos):
        usuario, creado = self.Usuario.objects.get_or_create(username=username)
        for campo in ("email", "dni"):
            valor = datos.get(campo)
            if valor and self.Usuario.objects.exclude(pk=usuario.pk).filter(**{campo: valor}).exists():
                raise CommandError(
                    f"No se puede preparar '{username}': el {campo} '{valor}' ya pertenece a otra cuenta."
                )
        for campo, valor in datos.items():
            setattr(usuario, campo, valor)
        if password:
            usuario.set_password(password)
        elif creado:
            usuario.set_unusable_password()
        usuario.save()
        return usuario

    def _crear_administrador(self, username: str):
        return self._guardar_usuario(
            username=username,
            password=self.password_admin,
            first_name="Alex",
            last_name="Administrador",
            email="alex@hemoruta.local" if username == "alex" else f"{username}@hemoruta.local",
            rol=self.Usuario.Rol.ADMINISTRADOR,
            estado=self.Usuario.Estado.ACTIVO,
            is_active=True,
            is_staff=True,
            is_superuser=True,
            requiere_cambio_password=False,
        )

    def _crear_medicos(self):
        medicos = {}
        for datos in MEDICOS_DEMO:
            usuario = self._guardar_usuario(
                username=datos["username"],
                password=self.password_medicos,
                first_name=datos["first_name"],
                last_name=datos["last_name"],
                email=datos["email"],
                dni=datos["dni"],
                telefono=datos["telefono"],
                rol=self.Usuario.Rol.MEDICO,
                estado=self.Usuario.Estado.ACTIVO,
                is_active=True,
                is_staff=False,
                is_superuser=False,
                requiere_cambio_password=False,
            )
            self.PerfilMedico.objects.update_or_create(
                usuario=usuario,
                defaults={
                    "numero_colegiatura": datos["colegiatura"],
                    "especialidad": datos["especialidad"],
                    "cargo": datos["cargo"],
                    "estado_laboral": "ACTIVO",
                },
            )
            medicos[datos["username"]] = usuario
        return medicos

    def _crear_catalogo_sintomas(self):
        catalogo = {}
        for codigo, nombre in CATALOGO_SINTOMAS:
            sintoma, _ = CatalogoSintoma.objects.update_or_create(
                codigo=codigo,
                defaults={"nombre": nombre, "activo": True},
            )
            catalogo[codigo] = sintoma
        return catalogo

    def _crear_paciente_y_familia(self, datos, creador):
        cuenta_datos = datos["cuenta"]
        usuario = self._guardar_usuario(
            username=cuenta_datos["username"],
            password=self.password_pacientes,
            first_name=cuenta_datos["first_name"],
            last_name=cuenta_datos["last_name"],
            email=cuenta_datos["email"],
            dni=cuenta_datos["dni"],
            telefono=cuenta_datos["telefono"],
            rol=self.Usuario.Rol.PACIENTE,
            estado=self.Usuario.Estado.ACTIVO,
            is_active=True,
            is_staff=False,
            is_superuser=False,
            requiere_cambio_password=False,
        )
        paciente, _ = Paciente.objects.update_or_create(
            historia_clinica=datos["historia"],
            defaults={
                "dni": datos["dni"],
                "nombres": datos["nombres"],
                "apellidos": datos["apellidos"],
                "fecha_nacimiento": datos["nacimiento"],
                "sexo": datos["sexo"],
                "grupo_sanguineo": datos["grupo_sanguineo"],
                "lugar_nacimiento": "Lima, Perú",
                "nacionalidad": "Peruana",
                "procedencia": "Lima",
                "direccion": "Av. Javier Prado Este 1234, Lima",
                "distrito": "San Borja",
                "idioma_preferido": "Español",
                "estado": Paciente.Estado.ACTIVO,
                "perfil_completo": True,
                "creado_por": creador,
            },
        )
        tutor = TutorPaciente.objects.filter(paciente=paciente, dni=cuenta_datos["dni"]).first()
        if tutor is None:
            tutor = TutorPaciente.objects.filter(paciente=paciente, es_principal=True).first()
        valores_tutor = {
            "usuario": usuario,
            "nombres": cuenta_datos["first_name"],
            "apellidos": cuenta_datos["last_name"],
            "dni": cuenta_datos["dni"],
            "parentesco": cuenta_datos["parentesco"],
            "telefono_principal": cuenta_datos["telefono"],
            "telefono_alternativo": "+51 912 345 678",
            "telefono_emergencia": "+51 999 888 777",
            "correo": cuenta_datos["email"],
            "direccion": "Av. Javier Prado Este 1234, Dpto. 502",
            "distrito": "San Borja",
            "persona_autorizada_adicional": "Familiar autorizado",
            "preferencia_contacto": TutorPaciente.PreferenciaContacto.APP,
            "es_principal": True,
            "autorizado": True,
        }
        if tutor is None:
            tutor = TutorPaciente.objects.create(paciente=paciente, **valores_tutor)
        else:
            self._actualizar(tutor, valores_tutor)
        CuentaMovilPaciente.objects.update_or_create(
            paciente=paciente,
            defaults={
                "usuario": usuario,
                "alias": cuenta_datos["alias"],
                "estado": CuentaMovilPaciente.Estado.ACTIVA,
                "dispositivo": "App móvil HemoRuta (demo)",
                "ultimo_acceso_en": timezone.now() - timedelta(hours=2),
                "habilitada_en": timezone.now() - timedelta(days=30),
            },
        )
        return paciente, usuario

    def _crear_asignaciones_compartidas(self, paciente, medicos, admin):
        principal = medicos["valeria.ruiz"]
        secundario = medicos["luis.paredes"]
        AsignacionMedica.objects.filter(
            paciente=paciente,
            activa=True,
            es_principal=True,
        ).exclude(medico=principal).update(es_principal=False)
        AsignacionMedica.objects.update_or_create(
            paciente=paciente,
            medico=principal,
            activa=True,
            defaults={
                "es_principal": True,
                "fecha_inicio": self.fecha_base - timedelta(days=120),
                "asignado_por": admin,
            },
        )
        AsignacionMedica.objects.update_or_create(
            paciente=paciente,
            medico=secundario,
            activa=True,
            defaults={
                "es_principal": False,
                "fecha_inicio": self.fecha_base - timedelta(days=60),
                "asignado_por": admin,
            },
        )

    def _crear_diagnostico(self, paciente, datos, medico):
        diagnostico = Diagnostico.objects.filter(
            paciente=paciente,
            es_principal=True,
            estado=Diagnostico.Estado.ACTIVO,
        ).first()
        valores = {
            "codigo_cie10": datos["cie10"],
            "nombre": datos["diagnostico"],
            "descripcion": "Diagnóstico principal del escenario demostrativo.",
            "fecha_diagnostico": self.fecha_base - timedelta(days=90),
            "es_principal": True,
            "estado": Diagnostico.Estado.ACTIVO,
            "medico": medico,
        }
        if diagnostico is None:
            Diagnostico.objects.create(paciente=paciente, **valores)
        else:
            self._actualizar(diagnostico, valores)

    def _crear_citas(self, paciente, indice, medicos):
        medico = medicos["valeria.ruiz"] if indice % 2 == 0 else medicos["luis.paredes"]
        inicio_pasado = self._fecha_hora(self.fecha_base - timedelta(days=28 + indice), time(9, 15))
        cita_pasada = self._upsert_cita(
            paciente,
            "Consulta de control completada (demo)",
            {
                "medico": medico,
                "inicio": inicio_pasado,
                "fin": inicio_pasado + timedelta(minutes=40),
                "tipo": Cita.Tipo.CONSULTA,
                "estado": Cita.Estado.COMPLETADA,
                "origen": Cita.Origen.HOSPITAL,
                "especialidad": "Hematología Pediátrica",
                "consultorio": f"H-{indice + 1:02d}",
                "observaciones": "Atención completada y registrada en el sistema.",
                "creada_por": medico,
                "confirmada_por": medico,
                "confirmada_en": inicio_pasado - timedelta(days=2),
            },
        )
        inicio_futuro = self._fecha_hora(self.fecha_base + timedelta(days=7 + indice), time(10 + indice, 30))
        cita_futura = self._upsert_cita(
            paciente,
            "Próximo control hematológico (demo)",
            {
                "medico": medico,
                "inicio": inicio_futuro,
                "fin": inicio_futuro + timedelta(minutes=30),
                "tipo": Cita.Tipo.CONTROL,
                "estado": Cita.Estado.CONFIRMADA,
                "origen": Cita.Origen.HOSPITAL,
                "especialidad": "Hematología Pediátrica",
                "consultorio": f"H-{indice + 1:02d}",
                "observaciones": "Cita confirmada para seguimiento.",
                "creada_por": medico,
                "confirmada_por": medico,
                "confirmada_en": timezone.now(),
            },
        )
        return cita_pasada, cita_futura

    def _upsert_cita(self, paciente, motivo, valores):
        cita = Cita.objects.filter(paciente=paciente, motivo=motivo).order_by("creado_en").first()
        if cita is None:
            return Cita.objects.create(paciente=paciente, motivo=motivo, **valores)
        self._actualizar(cita, valores)
        return cita

    def _crear_consulta(self, paciente, cita, datos, medico):
        consulta, _ = ConsultaClinica.objects.update_or_create(
            paciente=paciente,
            titulo="Consulta inicial",
            defaults={
                "medico": medico,
                "cita": cita,
                "resumen": "Valoración y seguimiento por hematología pediátrica.",
                "origen": ConsultaClinica.Origen.MANUAL,
                "estado": ConsultaClinica.Estado.COMPLETADA,
                "iniciada_en": cita.inicio,
                "completada_en": cita.fin,
            },
        )
        contenidos = (
            (SeccionConsulta.Tipo.MOTIVO, "Motivo de consulta", "Control de rutina y seguimiento clínico."),
            (SeccionConsulta.Tipo.EVOLUCION, "Evolución clínica", "Paciente estable durante el control."),
            (SeccionConsulta.Tipo.TRATAMIENTO, "Tratamiento indicado", "Continuar el protocolo indicado y vigilar signos de alarma."),
            (SeccionConsulta.Tipo.MEDICACION, "Medicación indicada", "Cumplir la medicación en los horarios registrados."),
            (SeccionConsulta.Tipo.INDICACIONES, "Indicaciones para casa", "Mantener hidratación, alimentación y medidas de prevención."),
            (SeccionConsulta.Tipo.PROXIMO_CONTROL, "Próximo control", "Asistir al control registrado en la agenda."),
        )
        for orden, (tipo, titulo, contenido) in enumerate(contenidos):
            seccion, _ = SeccionConsulta.objects.update_or_create(
                consulta=consulta,
                tipo=tipo,
                defaults={"titulo": titulo, "contenido": contenido, "orden": orden},
            )
            item = seccion.items.order_by("orden", "id").first()
            valores_item = {"etiqueta": titulo, "descripcion": contenido, "orden": 0}
            if item is None:
                ItemSeccionConsulta.objects.create(seccion=seccion, **valores_item)
            else:
                self._actualizar(item, valores_item)
        return consulta

    def _crear_plan(self, paciente, consulta, datos, medico):
        plan = PlanTratamiento.objects.filter(paciente=paciente, nombre="Tratamiento actual").first()
        valores = {
            "consulta_origen": consulta,
            "medico": medico,
            "indicacion_general": "Continuar tratamiento actual según evaluación médica.",
            "estado": PlanTratamiento.Estado.VIGENTE,
            "vigente_desde": self.fecha_base - timedelta(days=28),
            "vigente_hasta": None,
        }
        if plan is None:
            plan = PlanTratamiento.objects.create(paciente=paciente, nombre="Tratamiento actual", **valores)
        else:
            self._actualizar(plan, valores)
        items = (
            (ItemPlanTratamiento.Tipo.TRATAMIENTO, "Tratamiento indicado", "Continuar tratamiento actual según evaluación médica."),
            (ItemPlanTratamiento.Tipo.MEDICACION, "Medicación indicada", "Respetar dosis, días y horas mostrados en la app."),
            (ItemPlanTratamiento.Tipo.CUIDADO_CASA, "Indicaciones para casa", "Mantener hidratación y reportar cambios importantes."),
            (ItemPlanTratamiento.Tipo.EXAMEN, "Exámenes solicitados", "Hemograma antes del próximo control."),
            (ItemPlanTratamiento.Tipo.CONTROL, "Próximo control", "Asistir a la cita confirmada en la agenda."),
        )
        for orden, (tipo, titulo, descripcion) in enumerate(items):
            ItemPlanTratamiento.objects.update_or_create(
                plan=plan,
                tipo=tipo,
                titulo=titulo,
                defaults={"descripcion": descripcion, "orden": orden},
            )
        return plan

    @staticmethod
    def _convertir_medicacion_simple(datos):
        return {
            **datos,
            "horas": (datos["hora"],),
            "dias": tuple(range(7)),
            "frecuencia": "Cada 24 horas",
            "indicaciones": f"Tomar diariamente a las {datos['hora']:%H:%M}.",
            "reportes": {-2: "TOMADA", -1: "TOMADA"},
        }

    def _crear_medicacion(self, paciente, cuenta, consulta, plan, medicaciones, medico):
        for datos in medicaciones:
            medicamento = self._upsert_medicamento(datos)
            prescripcion = Prescripcion.objects.filter(
                paciente=paciente,
                medicamento=medicamento,
                estado=Prescripcion.Estado.ACTIVA,
            ).first()
            valores = {
                "consulta": consulta,
                "plan_tratamiento": plan,
                "medico": medico,
                "cantidad_dosis": Decimal(datos["cantidad"]),
                "unidad_dosis": datos["unidad"],
                "via": Prescripcion.Via.ORAL,
                "frecuencia_texto": datos["frecuencia"],
                "indicaciones": datos["indicaciones"],
                "fecha_inicio": self.fecha_base - timedelta(days=30),
                "fecha_fin": None,
                "estado": Prescripcion.Estado.ACTIVA,
            }
            if prescripcion is None:
                prescripcion = Prescripcion.objects.create(
                    paciente=paciente,
                    medicamento=medicamento,
                    **valores,
                )
            else:
                self._actualizar(prescripcion, valores)

            for hora in datos["horas"]:
                horario, _ = HorarioPrescripcion.objects.update_or_create(
                    prescripcion=prescripcion,
                    hora=hora,
                    defaults={"intervalo_horas": None, "zona_horaria": "America/Lima", "activo": True},
                )
                for dia in datos["dias"]:
                    DiaHorarioPrescripcion.objects.get_or_create(horario=horario, dia_semana=dia)
                for desplazamiento in range(-3, 4):
                    fecha_dosis = self.fecha_base + timedelta(days=desplazamiento)
                    if fecha_dosis.weekday() not in datos["dias"]:
                        continue
                    programada_para = self._fecha_hora(fecha_dosis, hora)
                    dosis, _ = DosisProgramada.objects.get_or_create(
                        prescripcion=prescripcion,
                        programada_para=programada_para,
                        defaults={"horario": horario, "estado": DosisProgramada.Estado.PENDIENTE},
                    )
                    respuesta = datos["reportes"].get(desplazamiento)
                    if respuesta and not ReporteDosis.objects.filter(dosis_programada=dosis).exists():
                        self._registrar_reporte_dosis(dosis, cuenta, respuesta)

    def _upsert_medicamento(self, datos):
        medicamento = Medicamento.objects.filter(codigo=datos["codigo"]).first()
        if medicamento is None:
            medicamento = Medicamento.objects.filter(
                nombre_generico=datos["nombre"],
                forma_farmaceutica=datos["forma"],
                concentracion=datos["concentracion"],
            ).first()
        valores = {
            "codigo": datos["codigo"],
            "nombre_generico": datos["nombre"],
            "forma_farmaceutica": datos["forma"],
            "concentracion": datos["concentracion"],
            "activo": True,
        }
        if medicamento is None:
            return Medicamento.objects.create(**valores)
        self._actualizar(medicamento, valores)
        return medicamento

    @staticmethod
    def _registrar_reporte_dosis(dosis, cuenta, respuesta):
        respuesta_modelo = {
            "TOMADA": ReporteDosis.Respuesta.TOMADA,
            "TARDE": ReporteDosis.Respuesta.TARDE,
            "NO_TOMADA": ReporteDosis.Respuesta.NO_TOMADA,
        }[respuesta]
        datos = {
            "respuesta": respuesta_modelo,
            "motivo_no_toma": (
                ReporteDosis.MotivoNoToma.OLVIDO
                if respuesta_modelo == ReporteDosis.Respuesta.NO_TOMADA
                else ""
            ),
            "observacion": "Registro demostrativo de adherencia.",
            "ocurrida_en": dosis.programada_para + timedelta(minutes=35 if respuesta == "TARDE" else 5),
            "origen": ReporteDosis.Origen.APP,
        }
        registrar_reporte_dosis(dosis_programada=dosis, reportada_por=cuenta, **datos)

    def _crear_reportes_sintomas(self, paciente, cuenta, reportes, catalogo):
        for datos in sorted(reportes, key=lambda item: item["dias"]):
            observado_en = self._fecha_hora(
                self.fecha_base + timedelta(days=datos["dias"]),
                time(10, 30),
            )
            reporte = ReporteSintomas.objects.filter(
                paciente=paciente,
                descripcion=datos["descripcion"],
                origen=ReporteSintomas.Origen.APP,
            ).first()
            valores = {
                "intensidad": datos["intensidad"],
                "duracion": datos["duracion"],
                "evolucion": datos["evolucion"],
                "observado_en": observado_en,
                "descripcion": datos["descripcion"],
                "origen": ReporteSintomas.Origen.APP,
            }
            sintomas = [catalogo[codigo] for codigo in datos["codigos"]]
            if reporte is None:
                reporte = registrar_reporte_sintomas(
                    paciente=paciente,
                    sintomas=sintomas,
                    reportado_por=cuenta,
                    **valores,
                )
            else:
                self._actualizar(reporte, {**valores, "reportado_por": cuenta})
                for sintoma in sintomas:
                    SintomaReportado.objects.get_or_create(reporte=reporte, sintoma=sintoma)
                evento, _ = EventoSeguimiento.objects.get_or_create(
                    reporte_sintomas=reporte,
                    defaults={
                        "paciente": paciente,
                        "tipo": EventoSeguimiento.Tipo.SINTOMAS,
                        "origen": EventoSeguimiento.Origen.APP,
                        "estado": EventoSeguimiento.Estado.RECIBIDO,
                        "resumen": ", ".join(sintoma.nombre for sintoma in sintomas),
                        "ocurrido_en": observado_en,
                        "registrado_por": cuenta,
                    },
                )
                self._actualizar(evento, {"ocurrido_en": observado_en, "detalle": datos["descripcion"]})

    @staticmethod
    def _establecer_semaforo_actual(paciente, semaforo, medico):
        nivel, motivo = semaforo
        actual = SemaforoPaciente.objects.filter(paciente=paciente, es_actual=True).first()
        valores = {
            "nivel": nivel,
            "motivo": motivo,
            "origen": SemaforoPaciente.Origen.MEDICO,
            "determinado_por": medico,
        }
        if actual is None:
            SemaforoPaciente.objects.create(paciente=paciente, **valores)
        else:
            for campo, valor in valores.items():
                setattr(actual, campo, valor)
            actual.save(update_fields=tuple(valores))

    def _crear_documentos(self, paciente, cuenta, consulta, documentos):
        for tipo, titulo, nombre, mime, tamano, dias in documentos:
            documento, _ = DocumentoPaciente.objects.update_or_create(
                paciente=paciente,
                titulo=titulo,
                defaults={
                    "consulta": consulta,
                    "tipo": tipo,
                    "descripcion": "Documento demostrativo; contiene metadatos y no un archivo físico.",
                    "nombre_original": nombre,
                    "tipo_mime": mime,
                    "tamano_bytes": tamano,
                    "sha256": hashlib.sha256(f"{paciente.historia_clinica}:{titulo}".encode()).hexdigest(),
                    "fecha_documento": self.fecha_base - timedelta(days=dias),
                    "origen": DocumentoPaciente.Origen.APP,
                    "estado": DocumentoPaciente.Estado.DISPONIBLE,
                    "subido_por": cuenta,
                },
            )
            EventoSeguimiento.objects.update_or_create(
                documento=documento,
                defaults={
                    "paciente": paciente,
                    "tipo": EventoSeguimiento.Tipo.DOCUMENTO,
                    "origen": EventoSeguimiento.Origen.APP,
                    "estado": EventoSeguimiento.Estado.REVISADO,
                    "resumen": titulo,
                    "detalle": "Documento disponible para revisión médica.",
                    "ocurrido_en": self._fecha_hora(documento.fecha_documento, time(11, 15)),
                    "registrado_por": cuenta,
                },
            )

    def _crear_eventos_clinicos(self, paciente, consulta, plan, medico):
        EventoSeguimiento.objects.update_or_create(
            consulta=consulta,
            defaults={
                "paciente": paciente,
                "tipo": EventoSeguimiento.Tipo.CONSULTA,
                "origen": EventoSeguimiento.Origen.MEDICO,
                "estado": EventoSeguimiento.Estado.CERRADO,
                "resumen": consulta.titulo,
                "detalle": consulta.resumen,
                "ocurrido_en": consulta.completada_en,
                "registrado_por": medico,
            },
        )
        resumen = "Tratamiento actual registrado (demo)"
        evento = EventoSeguimiento.objects.filter(
            paciente=paciente,
            tipo=EventoSeguimiento.Tipo.TRATAMIENTO,
            resumen=resumen,
        ).first()
        valores = {
            "origen": EventoSeguimiento.Origen.MEDICO,
            "estado": EventoSeguimiento.Estado.CUMPLIDO,
            "detalle": plan.indicacion_general,
            "ocurrido_en": consulta.completada_en,
            "registrado_por": medico,
        }
        if evento is None:
            EventoSeguimiento.objects.create(
                paciente=paciente,
                tipo=EventoSeguimiento.Tipo.TRATAMIENTO,
                resumen=resumen,
                **valores,
            )
        else:
            self._actualizar(evento, valores)

    def _fecha_hora(self, fecha: date, hora: time):
        return timezone.make_aware(datetime.combine(fecha, hora), self.zona)

    @staticmethod
    def _actualizar(instancia, valores):
        for campo, valor in valores.items():
            setattr(instancia, campo, valor)
        instancia.save(update_fields=tuple(valores))
