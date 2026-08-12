from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from pacientes.models import Paciente
from seguimiento.models import CatalogoSintoma, ReporteSintomas
from seguimiento.services import registrar_reporte_sintomas
from usuarios.models import Usuario


class HistorialSintomasPacienteMedicoTests(APITestCase):
    def setUp(self):
        self.medico = Usuario.objects.create_user(
            username="medico.historial",
            email="medico.historial@hnsb.gob.pe",
            password="clave-segura",
            rol=Usuario.Rol.MEDICO,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
            first_name="Lucia",
            last_name="Torres",
        )
        self.paciente = Paciente.objects.create(
            historia_clinica="HC-SINT-0001",
            nombres="Mateo",
            apellidos="Flores",
            estado=Paciente.Estado.ACTIVO,
        )
        self.otro_paciente = Paciente.objects.create(
            historia_clinica="HC-SINT-0002",
            nombres="Camila",
            apellidos="Rojas",
            estado=Paciente.Estado.ACTIVO,
        )
        self.fiebre = CatalogoSintoma.objects.create(codigo="fiebre-prueba", nombre="Fiebre prueba")
        self.reporte = registrar_reporte_sintomas(
            paciente=self.paciente,
            sintomas=[self.fiebre],
            intensidad=ReporteSintomas.Intensidad.MODERADA,
            duracion=ReporteSintomas.Duracion.ENTRE_1_6_HORAS,
            evolucion=ReporteSintomas.Evolucion.IGUAL,
            observado_en=timezone.now() - timedelta(hours=2),
            descripcion="Temperatura controlada en casa.",
            origen=ReporteSintomas.Origen.APP,
            reportado_por=self.medico,
        )

    def test_medico_lista_reportes_reales_del_paciente(self):
        self.client.force_authenticate(self.medico)

        respuesta = self.client.get(
            reverse("seguimiento:medico-sintomas-paciente", kwargs={"paciente_id": self.paciente.id})
        )

        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.data["paginacion"]["total"], 1)
        resultado = respuesta.data["resultados"][0]
        self.assertEqual(resultado["id"], str(self.reporte.id))
        self.assertEqual(resultado["intensidad"], ReporteSintomas.Intensidad.MODERADA)
        self.assertEqual(resultado["sintomas"][0]["codigo"], self.fiebre.codigo)
        self.assertEqual(resultado["reportadoPor"]["nombre"], "Lucia Torres")

    def test_requiere_un_usuario_medico(self):
        usuario_paciente = Usuario.objects.create_user(
            username="familiar.historial",
            email="familiar.historial@example.test",
            password="clave-segura",
            rol=Usuario.Rol.PACIENTE,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        self.client.force_authenticate(usuario_paciente)

        respuesta = self.client.get(
            reverse("seguimiento:medico-sintomas-paciente", kwargs={"paciente_id": self.paciente.id})
        )

        self.assertEqual(respuesta.status_code, 403)
