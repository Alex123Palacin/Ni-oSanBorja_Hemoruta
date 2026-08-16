from io import StringIO

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase

from clinica_dia.models import ProgramacionQuimioterapia, SolicitudQuimioterapia
from usuarios.models import Usuario


class SeedClinicaDiaTests(TestCase):
    def setUp(self):
        self.admin = get_user_model().objects.create_user(
            username="alex",
            password="admin",
            rol=Usuario.Rol.ADMINISTRADOR,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )

    def _ejecutar(self):
        salida = StringIO()
        call_command("seed_clinica_dia_demo", stdout=salida)
        return salida.getvalue()

    def test_es_idempotente_y_deja_todas_las_solicitudes_pendientes(self):
        self.assertIn("Seed Clínica de Día listo", self._ejecutar())
        self.assertEqual(SolicitudQuimioterapia.objects.count(), 4)
        self.assertEqual(ProgramacionQuimioterapia.objects.count(), 0)
        self.assertFalse(
            SolicitudQuimioterapia.objects.exclude(
                estado=SolicitudQuimioterapia.Estado.PENDIENTE
            ).exists()
        )
        conteos = (
            SolicitudQuimioterapia.objects.count(),
            ProgramacionQuimioterapia.objects.count(),
        )
        self._ejecutar()
        self.assertEqual(
            conteos,
            (
                SolicitudQuimioterapia.objects.count(),
                ProgramacionQuimioterapia.objects.count(),
            ),
        )
