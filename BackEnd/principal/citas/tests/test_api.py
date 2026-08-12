from datetime import date, datetime

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from pacientes.models import Paciente
from usuarios.models import Usuario

from citas.models import Cita


class AgendaPacienteMedicoAPITests(APITestCase):
    def setUp(self):
        self.medico = Usuario.objects.create_user(
            username="medico-agenda",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.MEDICO,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        self.paciente = Paciente.objects.create(
            historia_clinica="HC-AGENDA-001",
            nombres="Mateo",
            apellidos="Flores",
            fecha_nacimiento=date(2017, 3, 16),
        )
        self.cita = Cita.objects.create(
            paciente=self.paciente,
            inicio=timezone.make_aware(datetime(2026, 8, 20, 9, 30)),
            motivo="Control médico",
            especialidad="Hematología pediátrica",
        )
        token = Token.objects.create(user=self.medico)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.key}")

    def test_cualquier_medico_del_hospital_puede_ver_la_agenda_completa(self):
        respuesta = self.client.get(
            reverse("citas:medico-agenda-paciente", kwargs={"paciente_id": self.paciente.id})
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["paginacion"]["total"], 1)
        self.assertEqual(respuesta.data["resultados"][0]["id"], str(self.cita.id))
        self.assertEqual(respuesta.data["resultados"][0]["motivo"], "Control médico")
