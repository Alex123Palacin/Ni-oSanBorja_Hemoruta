from __future__ import annotations

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
)
from pacientes.models import AsignacionMedica, CuentaMovilPaciente, Paciente, TutorPaciente
from seguimiento.models import CatalogoSintoma, EventoSeguimiento, SemaforoPaciente


class Command(BaseCommand):
    help = "Crea datos demostrativos idempotentes de Mateo Flores y la Dra. Valeria Ruiz."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            help="Password opcional para la cuenta demo. Si se omite, la cuenta queda sin password utilizable.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        try:
            PerfilMedico = apps.get_model("usuarios", "PerfilMedico")
        except LookupError as exc:
            raise CommandError("La app usuarios debe estar instalada antes de ejecutar este seed.") from exc

        Usuario = get_user_model()
        valeria, creada = Usuario.objects.get_or_create(
            username="valeria.ruiz",
            defaults={
                "first_name": "Valeria",
                "last_name": "Ruiz",
                "email": "valeria.ruiz@hnsb.gob.pe",
                "dni": "40123456",
                "telefono": "+51 987 654 321",
                "rol": "MEDICO",
                "estado": "ACTIVO",
                "is_active": True,
            },
        )
        campos_actualizados = []
        for campo, valor in {
            "first_name": "Valeria",
            "last_name": "Ruiz",
            "email": "valeria.ruiz@hnsb.gob.pe",
            "rol": "MEDICO",
            "estado": "ACTIVO",
            "is_active": True,
        }.items():
            if getattr(valeria, campo) != valor:
                setattr(valeria, campo, valor)
                campos_actualizados.append(campo)
        if options["password"]:
            valeria.set_password(options["password"])
            campos_actualizados.append("password")
        elif creada:
            valeria.set_unusable_password()
            campos_actualizados.append("password")
        if campos_actualizados:
            valeria.save(update_fields=tuple(set(campos_actualizados)))

        PerfilMedico.objects.update_or_create(
            usuario=valeria,
            defaults={
                "numero_colegiatura": "CMP-DEMO-001",
                "especialidad": "Hematologia Pediatrica",
                "cargo": "Medica tratante",
                "estado_laboral": "ACTIVO",
            },
        )

        maria, maria_creada = Usuario.objects.get_or_create(
            username="maria.flores",
            defaults={
                "first_name": "Maria",
                "last_name": "Flores Lopez",
                "email": "maria.flores@example.com",
                "dni": "45678912",
                "telefono": "+51 987 654 321",
                "rol": "PACIENTE",
                "estado": "ACTIVO",
                "is_active": True,
            },
        )
        campos_maria = []
        for campo, valor in {
            "first_name": "Maria",
            "last_name": "Flores Lopez",
            "email": "maria.flores@example.com",
            "dni": "45678912",
            "telefono": "+51 987 654 321",
            "rol": "PACIENTE",
            "estado": "ACTIVO",
            "is_active": True,
        }.items():
            if getattr(maria, campo) != valor:
                setattr(maria, campo, valor)
                campos_maria.append(campo)
        if options["password"]:
            maria.set_password(options["password"])
            campos_maria.append("password")
        elif maria_creada:
            maria.set_unusable_password()
            campos_maria.append("password")
        if campos_maria:
            maria.save(update_fields=tuple(set(campos_maria)))

        mateo, _ = Paciente.objects.update_or_create(
            historia_clinica="HC-2024-01568",
            defaults={
                "dni": "71562384",
                "nombres": "Mateo Gabriel",
                "apellidos": "Flores",
                "fecha_nacimiento": date(2017, 3, 16),
                "sexo": Paciente.Sexo.MASCULINO,
                "grupo_sanguineo": "O+",
                "lugar_nacimiento": "Lima, Peru",
                "nacionalidad": "Peruana",
                "procedencia": "San Borja, Lima",
                "direccion": "Av. Javier Prado Este 1234",
                "distrito": "San Borja",
                "idioma_preferido": "Espanol",
                "estado": Paciente.Estado.ACTIVO,
                "perfil_completo": True,
                "creado_por": valeria,
            },
        )
        TutorPaciente.objects.update_or_create(
            paciente=mateo,
            dni="45678912",
            defaults={
                "usuario": maria,
                "nombres": "Maria",
                "apellidos": "Flores Lopez",
                "parentesco": TutorPaciente.Parentesco.MADRE,
                "telefono_principal": "+51 987 654 321",
                "telefono_alternativo": "+51 912 345 678",
                "correo": "maria.flores@example.com",
                "direccion": "Av. Javier Prado Este 1234, Dpto. 502",
                "distrito": "San Borja",
                "preferencia_contacto": TutorPaciente.PreferenciaContacto.APP,
                "es_principal": True,
                "autorizado": True,
            },
        )
        CuentaMovilPaciente.objects.update_or_create(
            paciente=mateo,
            defaults={
                "usuario": maria,
                "alias": "mateo.flores",
                "estado": CuentaMovilPaciente.Estado.ACTIVA,
                "dispositivo": "Dispositivo demo",
                "habilitada_en": timezone.now(),
            },
        )
        AsignacionMedica.objects.update_or_create(
            paciente=mateo,
            medico=valeria,
            activa=True,
            defaults={
                "es_principal": True,
                "fecha_inicio": date(2024, 4, 12),
                "asignado_por": valeria,
            },
        )

        Diagnostico.objects.update_or_create(
            paciente=mateo,
            nombre="Leucemia linfoblastica aguda (LLA)",
            defaults={
                "codigo_cie10": "C91.0",
                "fecha_diagnostico": date(2025, 5, 15),
                "es_principal": True,
                "estado": Diagnostico.Estado.ACTIVO,
                "medico": valeria,
            },
        )

        ahora = timezone.now()
        consulta, _ = ConsultaClinica.objects.update_or_create(
            paciente=mateo,
            titulo="Consulta inicial",
            defaults={
                "medico": valeria,
                "resumen": "Valoracion inicial por hematologia pediatrica.",
                "origen": ConsultaClinica.Origen.MANUAL,
                "estado": ConsultaClinica.Estado.COMPLETADA,
                "iniciada_en": ahora - timedelta(days=30),
                "completada_en": ahora - timedelta(days=30) + timedelta(minutes=35),
            },
        )
        secciones = (
            (SeccionConsulta.Tipo.MOTIVO, "Motivo de consulta", "Control de rutina y seguimiento."),
            (SeccionConsulta.Tipo.EVOLUCION, "Evolucion clinica", "Paciente estable, sin fiebre."),
            (SeccionConsulta.Tipo.TRATAMIENTO, "Tratamiento indicado", "Continuar protocolo vigente."),
            (SeccionConsulta.Tipo.MEDICACION, "Medicacion indicada", "Prednisona segun horario."),
            (SeccionConsulta.Tipo.INDICACIONES, "Indicaciones para casa", "Mantener hidratacion."),
            (SeccionConsulta.Tipo.PROXIMO_CONTROL, "Proximo control", "Control en siete dias."),
        )
        for orden, (tipo, titulo, contenido) in enumerate(secciones):
            seccion, _ = SeccionConsulta.objects.update_or_create(
                consulta=consulta,
                tipo=tipo,
                defaults={"titulo": titulo, "contenido": contenido, "orden": orden},
            )
            ItemSeccionConsulta.objects.get_or_create(
                seccion=seccion,
                descripcion=contenido,
                defaults={"orden": 0},
            )

        plan, _ = PlanTratamiento.objects.update_or_create(
            paciente=mateo,
            nombre="Tratamiento actual",
            defaults={
                "consulta_origen": consulta,
                "medico": valeria,
                "indicacion_general": "Continuar tratamiento actual segun evaluacion medica.",
                "estado": PlanTratamiento.Estado.VIGENTE,
                "vigente_desde": timezone.localdate() - timedelta(days=30),
            },
        )
        items_plan = (
            (ItemPlanTratamiento.Tipo.CUIDADO_CASA, "Indicaciones para casa", "Mantener hidratacion y vigilar fiebre."),
            (ItemPlanTratamiento.Tipo.EXAMEN, "Examen solicitado", "Hemograma antes del proximo control."),
            (ItemPlanTratamiento.Tipo.CONTROL, "Proximo control", "Asistir al control programado."),
        )
        for orden, (tipo, titulo, descripcion) in enumerate(items_plan):
            ItemPlanTratamiento.objects.update_or_create(
                plan=plan,
                tipo=tipo,
                titulo=titulo,
                defaults={"descripcion": descripcion, "orden": orden},
            )

        prednisona, _ = Medicamento.objects.get_or_create(
            nombre_generico="Prednisona",
            forma_farmaceutica="tableta",
            concentracion="10 mg",
        )
        prescripcion, _ = Prescripcion.objects.update_or_create(
            paciente=mateo,
            medicamento=prednisona,
            estado=Prescripcion.Estado.ACTIVA,
            defaults={
                "consulta": consulta,
                "plan_tratamiento": plan,
                "medico": valeria,
                "cantidad_dosis": Decimal("10.00"),
                "unidad_dosis": "mg",
                "via": Prescripcion.Via.ORAL,
                "frecuencia_texto": "Cada 24 horas",
                "indicaciones": "Tomar a las 08:00 a. m.",
                "fecha_inicio": timezone.localdate() - timedelta(days=30),
            },
        )
        horario, _ = HorarioPrescripcion.objects.get_or_create(
            prescripcion=prescripcion,
            hora=time(8, 0),
            defaults={"zona_horaria": "America/Lima", "activo": True},
        )
        for dia, _ in DiaHorarioPrescripcion.Dia.choices:
            DiaHorarioPrescripcion.objects.get_or_create(horario=horario, dia_semana=dia)

        zona = timezone.get_current_timezone()
        dosis_hoy = timezone.make_aware(datetime.combine(timezone.localdate(), time(8, 0)), zona)
        DosisProgramada.objects.get_or_create(
            prescripcion=prescripcion,
            programada_para=dosis_hoy,
            defaults={"horario": horario},
        )

        for codigo, nombre in (
            ("fiebre", "Fiebre"),
            ("dolor", "Dolor"),
            ("nauseas", "Nauseas"),
            ("vomitos", "Vomitos"),
            ("sangrado", "Sangrado"),
            ("cansancio", "Cansancio"),
            ("diarrea", "Diarrea"),
            ("otro", "Otro"),
            ("otro", "Otro"),
        ):
            CatalogoSintoma.objects.update_or_create(codigo=codigo, defaults={"nombre": nombre, "activo": True})

        if not SemaforoPaciente.objects.filter(paciente=mateo, es_actual=True).exists():
            SemaforoPaciente.objects.create(
                paciente=mateo,
                nivel=SemaforoPaciente.Nivel.VERDE,
                motivo="Sin sintomas significativos",
                origen=SemaforoPaciente.Origen.MEDICO,
                determinado_por=valeria,
            )

        inicio_cita = timezone.make_aware(datetime(2027, 5, 27, 10, 30), zona)
        Cita.objects.get_or_create(
            paciente=mateo,
            medico=valeria,
            inicio=inicio_cita,
            defaults={
                "fin": inicio_cita + timedelta(minutes=30),
                "tipo": Cita.Tipo.CONTROL,
                "estado": Cita.Estado.CONFIRMADA,
                "origen": Cita.Origen.HOSPITAL,
                "especialidad": "Hematologia Pediatrica",
                "motivo": "Control de induccion",
                "creada_por": valeria,
                "confirmada_por": valeria,
                "confirmada_en": ahora,
            },
        )

        documento, _ = DocumentoPaciente.objects.update_or_create(
            paciente=mateo,
            titulo="Plan de tratamiento vigente",
            defaults={
                "consulta": consulta,
                "tipo": DocumentoPaciente.Tipo.PLAN_TRATAMIENTO,
                "descripcion": "Metadato demostrativo sin archivo adjunto.",
                "fecha_documento": timezone.localdate(),
                "origen": DocumentoPaciente.Origen.MEDICO,
                "estado": DocumentoPaciente.Estado.DISPONIBLE,
                "subido_por": valeria,
            },
        )
        EventoSeguimiento.objects.get_or_create(
            documento=documento,
            defaults={
                "paciente": mateo,
                "tipo": EventoSeguimiento.Tipo.DOCUMENTO,
                "origen": EventoSeguimiento.Origen.MEDICO,
                "estado": EventoSeguimiento.Estado.REVISADO,
                "resumen": documento.titulo,
                "ocurrido_en": ahora,
                "registrado_por": valeria,
            },
        )

        pacientes_adicionales = (
            {
                "historia": "HC-2024-01569",
                "dni": "62438751",
                "nombres": "Luciana Valentina",
                "apellidos": "Rojas",
                "nacimiento": date(2019, 7, 8),
                "tutor_dni": "45789013",
                "tutor_nombres": "Carlos",
                "tutor_apellidos": "Rojas Paredes",
                "diagnostico": "Anemia aplasica",
                "cie10": "D61.9",
                "nivel": SemaforoPaciente.Nivel.AMARILLO,
                "motivo": "Sintomas leves",
                "dia_cita": 29,
                "hora_cita": 9,
            },
            {
                "historia": "HC-2024-01570",
                "dni": "80319276",
                "nombres": "Santiago Andre",
                "apellidos": "Medina",
                "nacimiento": date(2016, 9, 21),
                "tutor_dni": "46789024",
                "tutor_nombres": "Veronica",
                "tutor_apellidos": "Medina Ruiz",
                "diagnostico": "Hemofilia A severa",
                "cie10": "D66",
                "nivel": SemaforoPaciente.Nivel.VERDE,
                "motivo": "Sin sintomas significativos",
                "dia_cita": 2,
                "hora_cita": 11,
            },
            {
                "historia": "HC-2024-01571",
                "dni": "69254731",
                "nombres": "Camila Alejandra",
                "apellidos": "Torres",
                "nacimiento": date(2018, 11, 3),
                "tutor_dni": "47890135",
                "tutor_nombres": "Jorge",
                "tutor_apellidos": "Torres Vega",
                "diagnostico": "Linfoma de Hodgkin",
                "cie10": "C81.9",
                "nivel": SemaforoPaciente.Nivel.AMARILLO,
                "motivo": "Sintomas leves",
                "dia_cita": 5,
                "hora_cita": 14,
            },
            {
                "historia": "HC-2024-01572",
                "dni": "73846219",
                "nombres": "Diego Alonso",
                "apellidos": "Perez",
                "nacimiento": date(2017, 5, 14),
                "tutor_dni": "48901246",
                "tutor_nombres": "Katherine",
                "tutor_apellidos": "Perez Solis",
                "diagnostico": "Talasemia beta mayor",
                "cie10": "D56.1",
                "nivel": SemaforoPaciente.Nivel.VERDE,
                "motivo": "Sin sintomas significativos",
                "dia_cita": 9,
                "hora_cita": 10,
            },
        )

        for indice, datos in enumerate(pacientes_adicionales):
            paciente_extra, _ = Paciente.objects.update_or_create(
                historia_clinica=datos["historia"],
                defaults={
                    "dni": datos["dni"],
                    "nombres": datos["nombres"],
                    "apellidos": datos["apellidos"],
                    "fecha_nacimiento": datos["nacimiento"],
                    "sexo": Paciente.Sexo.FEMENINO if indice in (0, 2) else Paciente.Sexo.MASCULINO,
                    "grupo_sanguineo": "O+",
                    "nacionalidad": "Peruana",
                    "procedencia": "Lima",
                    "distrito": "San Borja",
                    "estado": Paciente.Estado.ACTIVO,
                    "perfil_completo": True,
                    "creado_por": valeria,
                },
            )
            TutorPaciente.objects.update_or_create(
                paciente=paciente_extra,
                dni=datos["tutor_dni"],
                defaults={
                    "nombres": datos["tutor_nombres"],
                    "apellidos": datos["tutor_apellidos"],
                    "parentesco": TutorPaciente.Parentesco.PADRE if indice in (0, 2) else TutorPaciente.Parentesco.MADRE,
                    "telefono_principal": f"+51 987 650 {indice + 10:03d}",
                    "preferencia_contacto": TutorPaciente.PreferenciaContacto.APP,
                    "es_principal": True,
                    "autorizado": True,
                },
            )
            AsignacionMedica.objects.update_or_create(
                paciente=paciente_extra,
                medico=valeria,
                activa=True,
                defaults={
                    "es_principal": True,
                    "fecha_inicio": date(2025, 1, 15),
                    "asignado_por": valeria,
                },
            )
            Diagnostico.objects.update_or_create(
                paciente=paciente_extra,
                nombre=datos["diagnostico"],
                defaults={
                    "codigo_cie10": datos["cie10"],
                    "fecha_diagnostico": date(2025, 5, 15),
                    "es_principal": True,
                    "estado": Diagnostico.Estado.ACTIVO,
                    "medico": valeria,
                },
            )
            if not SemaforoPaciente.objects.filter(paciente=paciente_extra, es_actual=True).exists():
                SemaforoPaciente.objects.create(
                    paciente=paciente_extra,
                    nivel=datos["nivel"],
                    motivo=datos["motivo"],
                    origen=SemaforoPaciente.Origen.MEDICO,
                    determinado_por=valeria,
                )
            mes_cita = 6 if datos["dia_cita"] <= 9 else 5
            inicio_extra = timezone.make_aware(
                datetime(2027, mes_cita, datos["dia_cita"], datos["hora_cita"], 0),
                zona,
            )
            Cita.objects.get_or_create(
                paciente=paciente_extra,
                medico=valeria,
                inicio=inicio_extra,
                defaults={
                    "fin": inicio_extra + timedelta(minutes=30),
                    "tipo": Cita.Tipo.CONTROL,
                    "estado": Cita.Estado.CONFIRMADA,
                    "origen": Cita.Origen.HOSPITAL,
                    "especialidad": "Hematologia Pediatrica",
                    "motivo": "Control hematologico",
                    "creada_por": valeria,
                    "confirmada_por": valeria,
                    "confirmada_en": ahora,
                },
            )
            ocurrido_extra = timezone.make_aware(
                datetime(2026, 8, indice + 2, 8 + indice, 30),
                zona,
            )
            EventoSeguimiento.objects.get_or_create(
                paciente=paciente_extra,
                resumen=f"Seguimiento de {paciente_extra.nombre_completo}",
                ocurrido_en=ocurrido_extra,
                defaults={
                    "tipo": EventoSeguimiento.Tipo.SINTOMAS,
                    "origen": EventoSeguimiento.Origen.APP,
                    "estado": EventoSeguimiento.Estado.EN_SEGUIMIENTO,
                    "detalle": datos["motivo"],
                    "registrado_por": valeria,
                },
            )

        self.stdout.write(
            self.style.SUCCESS("Seed demo listo: cinco pacientes, Dra. Valeria Ruiz y cuenta familiar.")
        )
