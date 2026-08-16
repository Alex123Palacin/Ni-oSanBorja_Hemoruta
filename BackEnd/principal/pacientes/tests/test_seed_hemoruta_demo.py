from io import StringIO

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase

from citas.models import Cita
from clinica.models import ConsultaClinica, Diagnostico, PlanTratamiento
from clinica_dia.models import ProgramacionQuimioterapia, SolicitudQuimioterapia
from documentos.models import DocumentoPaciente
from medicacion.models import DosisProgramada, Prescripcion, ReporteDosis
from pacientes.models import AsignacionMedica, CuentaMovilPaciente, Paciente, TutorPaciente
from seguimiento.models import AlertaSeguimiento, EventoSeguimiento, ReporteSintomas


class SeedHemorutaDemoTests(TestCase):
    fecha_base = "2026-08-11"

    def ejecutar_seed(self, **opciones):
        salida = StringIO()
        call_command(
            "seed_hemoruta_demo",
            fecha_base=self.fecha_base,
            stdout=salida,
            **opciones,
        )
        return salida.getvalue()

    def test_crea_un_escenario_clinico_completo_y_multiusuario(self):
        salida = self.ejecutar_seed(password="demo-segura")
        Usuario = get_user_model()

        self.assertIn("Seed HemoRuta listo", salida)
        self.assertEqual(Paciente.objects.filter(historia_clinica__startswith="HC-2024-015").count(), 5)
        self.assertEqual(Usuario.objects.filter(rol=Usuario.Rol.MEDICO).count(), 2)
        self.assertEqual(Usuario.objects.filter(rol=Usuario.Rol.PACIENTE).count(), 5)
        self.assertTrue(Usuario.objects.get(username="alex").check_password("demo-segura"))
        self.assertTrue(Usuario.objects.get(username="valeria.ruiz").check_password("demo-segura"))
        self.assertTrue(Usuario.objects.get(username="maria.flores").check_password("demo-segura"))

        self.assertEqual(TutorPaciente.objects.count(), 5)
        self.assertEqual(CuentaMovilPaciente.objects.count(), 5)
        asignaciones_vigentes = AsignacionMedica.objects.filter(activa=True)
        self.assertEqual(asignaciones_vigentes.count(), 10)
        self.assertEqual(asignaciones_vigentes.filter(es_principal=True).count(), 5)
        self.assertFalse(
            asignaciones_vigentes.exclude(
                origen=AsignacionMedica.Origen.MANUAL,
            ).exists()
        )
        self.assertEqual(Diagnostico.objects.filter(es_principal=True).count(), 5)
        self.assertEqual(Cita.objects.count(), 10)
        self.assertEqual(SolicitudQuimioterapia.objects.count(), 4)
        self.assertEqual(ProgramacionQuimioterapia.objects.count(), 0)
        self.assertEqual(ConsultaClinica.objects.count(), 5)
        self.assertEqual(PlanTratamiento.objects.count(), 5)
        self.assertEqual(Prescripcion.objects.filter(estado=Prescripcion.Estado.ACTIVA).count(), 8)
        self.assertGreaterEqual(DosisProgramada.objects.count(), 50)
        self.assertGreaterEqual(ReporteDosis.objects.count(), 17)
        self.assertEqual(ReporteSintomas.objects.count(), 6)
        self.assertEqual(DocumentoPaciente.objects.count(), 7)
        self.assertGreaterEqual(EventoSeguimiento.objects.count(), 30)
        self.assertEqual(AlertaSeguimiento.objects.filter(estado=AlertaSeguimiento.Estado.ABIERTA).count(), 1)

        mateo = Paciente.objects.get(historia_clinica="HC-2024-01568")
        self.assertEqual(mateo.asignaciones_medicas.filter(activa=True).count(), 2)
        self.assertEqual(mateo.creado_por.username, "alex")
        self.assertEqual(mateo.prescripciones.filter(estado=Prescripcion.Estado.ACTIVA).count(), 4)
        self.assertTrue(
            DosisProgramada.objects.filter(
                prescripcion__paciente=mateo,
                estado=DosisProgramada.Estado.PENDIENTE,
            ).exists()
        )

    def test_es_idempotente_y_no_borra_registros_ajenos(self):
        externo = Paciente.objects.create(
            historia_clinica="HC-EXTERNA-001",
            nombres="Paciente",
            apellidos="Existente",
        )
        self.ejecutar_seed(password="primera-clave")
        modelos = (
            get_user_model(),
            Paciente,
            TutorPaciente,
            CuentaMovilPaciente,
            AsignacionMedica,
            Diagnostico,
            Cita,
            ConsultaClinica,
            PlanTratamiento,
            Prescripcion,
            DosisProgramada,
            ReporteDosis,
            ReporteSintomas,
            DocumentoPaciente,
            EventoSeguimiento,
            AlertaSeguimiento,
            SolicitudQuimioterapia,
            ProgramacionQuimioterapia,
        )
        conteos_primera_ejecucion = {modelo: modelo.objects.count() for modelo in modelos}

        self.ejecutar_seed(password="segunda-clave")
        conteos_segunda_ejecucion = {modelo: modelo.objects.count() for modelo in modelos}

        self.assertEqual(conteos_primera_ejecucion, conteos_segunda_ejecucion)
        self.assertTrue(Paciente.objects.filter(pk=externo.pk).exists())
        self.assertTrue(get_user_model().objects.get(username="maria.flores").check_password("segunda-clave"))

    def test_sin_opcion_de_password_conserva_la_clave_existente(self):
        Usuario = get_user_model()
        medico = Usuario.objects.create_user(
            username="valeria.ruiz",
            password="clave-existente",
            email="valeria.ruiz@hnsb.gob.pe",
            dni="40123456",
        )

        self.ejecutar_seed()

        medico.refresh_from_db()
        self.assertTrue(medico.check_password("clave-existente"))
