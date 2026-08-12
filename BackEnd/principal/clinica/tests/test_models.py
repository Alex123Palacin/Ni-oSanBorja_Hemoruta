from datetime import date

from django.test import TestCase

from clinica.models import SeccionConsulta


class SeccionConsultaChoicesTests(TestCase):
    def test_incluye_las_secciones_del_resumen_estructurado(self):
        valores = {valor for valor, _ in SeccionConsulta.Tipo.choices}
        self.assertTrue({"MOTIVO", "EVOLUCION", "TRATAMIENTO", "MEDICACION", "INDICACIONES"} <= valores)

