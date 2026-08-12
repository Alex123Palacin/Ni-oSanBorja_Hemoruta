from django.core.exceptions import ValidationError
from django.test import SimpleTestCase

from medicacion.models import ReporteDosis


class ReporteDosisModelTests(SimpleTestCase):
    def test_no_tomada_requiere_motivo(self):
        reporte = ReporteDosis(respuesta=ReporteDosis.Respuesta.NO_TOMADA, motivo_no_toma="")

        with self.assertRaises(ValidationError) as error:
            reporte.clean()
        self.assertIn("motivo_no_toma", error.exception.message_dict)
