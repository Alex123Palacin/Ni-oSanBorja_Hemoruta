from datetime import date

from django.test import TestCase

from pacientes.models import Paciente


class PacienteModelTests(TestCase):
    def test_nombre_completo_y_edad_se_calculan(self):
        paciente = Paciente(
            historia_clinica="HC-TEST-001",
            nombres="Mateo Gabriel",
            apellidos="Flores",
            fecha_nacimiento=date(2017, 3, 16),
        )

        self.assertEqual(paciente.nombre_completo, "Mateo Gabriel Flores")
        self.assertGreaterEqual(paciente.edad, 0)

