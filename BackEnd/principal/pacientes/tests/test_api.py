from datetime import date

from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from pacientes.models import AsignacionMedica, Paciente
from usuarios.models import PerfilMedico, Usuario


class RegistroPacienteAdministrativoAPITests(APITestCase):
    def setUp(self):
        self.admin = Usuario.objects.create_user(
            username="admin-registro",
            email="admin.registro@example.com",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.ADMINISTRADOR,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
            is_staff=True,
        )
        self.medico = Usuario.objects.create_user(
            username="medico-registro",
            email="medico.registro@example.com",
            password="ClaveSegura-2026",
            first_name="Valeria",
            last_name="Ruiz",
            rol=Usuario.Rol.MEDICO,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        PerfilMedico.objects.create(
            usuario=self.medico,
            especialidad="Hematología pediátrica",
        )

    def _autenticar(self, usuario):
        token, _ = Token.objects.get_or_create(user=usuario)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.key}")

    def test_paciente_creado_por_admin_aparece_en_listado_y_ficha_del_medico(self):
        self._autenticar(self.admin)
        respuesta_creacion = self.client.post(
            reverse("pacientes:paciente-list"),
            {
                "historia_clinica": "HC-NUEVO-001",
                "dni": "55667788",
                "nombres": "Sofia Elena",
                "apellidos": "Castro Diaz",
                "fecha_nacimiento": "2018-06-04",
                "sexo": Paciente.Sexo.FEMENINO,
                "grupo_sanguineo": "A+",
                "procedencia": "Lima",
                "estado": Paciente.Estado.ACTIVO,
            },
            format="json",
        )

        self.assertEqual(respuesta_creacion.status_code, status.HTTP_201_CREATED)
        paciente = Paciente.objects.get(dni="55667788")
        self.assertFalse(AsignacionMedica.objects.filter(paciente=paciente).exists())

        self._autenticar(self.medico)
        respuesta_lista = self.client.get(
            reverse("pacientes:medico-pacientes"),
            {"q": "55667788", "tipoBusqueda": "DNI"},
        )
        self.assertEqual(respuesta_lista.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta_lista.data["paginacion"]["total"], 1)
        fila = respuesta_lista.data["resultados"][0]
        self.assertEqual(fila["id"], str(paciente.id))
        self.assertIsNone(fila["medicoResponsable"])
        self.assertNotIn("registradoPor", fila)

        respuesta_ficha = self.client.get(
            reverse("pacientes:medico-ficha-paciente", kwargs={"paciente_id": paciente.id})
        )
        self.assertEqual(respuesta_ficha.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta_ficha.data["nombre"], "Sofia Elena Castro Diaz")
        self.assertEqual(respuesta_ficha.data["historiaClinica"], "HC-NUEVO-001")
        self.assertEqual(respuesta_ficha.data["datosGenerales"]["dni"], "55667788")
        self.assertEqual(
            respuesta_ficha.data["datosGenerales"]["fechaNacimiento"],
            date(2018, 6, 4).isoformat(),
        )

    def test_admin_mantiene_fecha_nacimiento_obligatoria_en_alta_completa(self):
        self._autenticar(self.admin)
        respuesta = self.client.post(
            reverse("pacientes:paciente-list"),
            {
                "historia_clinica": "HC-NUEVO-002",
                "nombres": "Paciente",
                "apellidos": "Sin fecha",
            },
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("fecha_nacimiento", respuesta.data)

    def test_todos_los_medicos_comparten_listado_aunque_no_sean_responsables(self):
        paciente = Paciente.objects.create(
            historia_clinica="HC-COMPARTIDO-01",
            dni="33445566",
            nombres="Paciente",
            apellidos="Compartido",
            fecha_nacimiento=date(2018, 2, 3),
            creado_por=self.admin,
        )
        otro_medico = Usuario.objects.create_user(
            username="otro-medico-hospital",
            email="otro.medico.hospital@hnsb.gob.pe",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.MEDICO,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        self._autenticar(otro_medico)

        listado = self.client.get(reverse("pacientes:medico-pacientes"), {"q": "33445566"})
        ficha = self.client.get(
            reverse("pacientes:medico-ficha-paciente", kwargs={"paciente_id": paciente.id})
        )

        self.assertEqual(listado.status_code, status.HTTP_200_OK)
        self.assertEqual(listado.data["paginacion"]["total"], 1)
        self.assertIsNone(listado.data["resultados"][0]["medicoResponsable"])
        self.assertIsNone(listado.data["resultados"][0]["atendidoPor"])
        self.assertEqual(ficha.status_code, status.HTTP_200_OK)

    def test_medico_no_puede_crear_y_el_endpoint_de_alta_anterior_no_existe(self):
        self._autenticar(self.medico)
        directa = self.client.post(
            reverse("pacientes:paciente-list"),
            {
                "historia_clinica": "HC-PROHIBIDO-01",
                "nombres": "Paciente",
                "apellidos": "Prohibido",
                "fecha_nacimiento": "2018-01-01",
            },
            format="json",
        )
        anterior = self.client.post("/api/v1/medico/pacientes/alta/", {}, format="json")

        self.assertEqual(directa.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(anterior.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(Paciente.objects.filter(historia_clinica="HC-PROHIBIDO-01").exists())
