from datetime import date

from django.test import SimpleTestCase

from documentos.models import DocumentoPaciente, ruta_documento_paciente
from pacientes.models import Paciente


class RutaDocumentoPacienteTests(SimpleTestCase):
    def test_ruta_no_expone_el_nombre_original(self):
        paciente = Paciente(
            historia_clinica="HC-TEST-DOC",
            nombres="Mateo",
            apellidos="Flores",
            fecha_nacimiento=date(2017, 3, 16),
        )
        documento = DocumentoPaciente(paciente=paciente, titulo="Hemograma")

        ruta = ruta_documento_paciente(documento, "resultado privado.PDF")

        self.assertTrue(ruta.endswith(".pdf"))
        self.assertNotIn("resultado privado", ruta)

