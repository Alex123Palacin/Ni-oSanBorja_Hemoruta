from datetime import date, timedelta

from django.core.exceptions import ValidationError
from django.test import SimpleTestCase
from django.utils import timezone

from citas.models import Cita
from pacientes.models import Paciente


class CitaModelTests(SimpleTestCase):
    def test_rechaza_fin_anterior_al_inicio(self):
        inicio = timezone.now()
        paciente = Paciente(
            historia_clinica="HC-CITA-TEST",
            nombres="Mateo",
            apellidos="Flores",
            fecha_nacimiento=date(2017, 3, 16),
        )
        cita = Cita(paciente=paciente, inicio=inicio, fin=inicio - timedelta(minutes=30))

        with self.assertRaises(ValidationError) as error:
            cita.clean()
        self.assertIn("fin", error.exception.message_dict)
