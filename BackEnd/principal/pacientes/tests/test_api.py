from datetime import date

from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from usuarios.models import PerfilMedico, Usuario

from pacientes.models import AsignacionMedica, CuentaMovilPaciente, Paciente, TutorPaciente


class RegistroPacienteMedicoAPITests(APITestCase):
    def setUp(self):
        self.medico = Usuario.objects.create_user(
            username="medico-registro",
            password="ClaveSegura-2026",
            first_name="Valeria",
            last_name="Ruiz",
            rol=Usuario.Rol.MEDICO,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        PerfilMedico.objects.create(
            usuario=self.medico,
            especialidad="Hematologia pediatrica",
        )
        token = Token.objects.create(user=self.medico)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.key}")

    def test_paciente_creado_aparece_en_listado_y_ficha_del_medico(self):
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

        self.assertEqual(
            respuesta_creacion.status_code,
            status.HTTP_201_CREATED,
            respuesta_creacion.data,
        )
        paciente = Paciente.objects.get(dni="55667788")
        self.assertTrue(
            AsignacionMedica.objects.filter(
                paciente=paciente,
                medico=self.medico,
                activa=True,
                es_principal=True,
            ).exists()
        )
        respuesta_lista = self.client.get(
            reverse("pacientes:medico-pacientes"),
            {"q": "55667788", "tipoBusqueda": "DNI"},
        )
        self.assertEqual(respuesta_lista.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta_lista.data["paginacion"]["total"], 1)
        self.assertEqual(respuesta_lista.data["resultados"][0]["id"], str(paciente.id))
        self.assertEqual(
            respuesta_lista.data["resultados"][0]["nombre"],
            "Sofia Elena Castro Diaz",
        )

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

    def test_registro_medico_mantiene_fecha_nacimiento_obligatoria(self):
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

    def test_todos_los_medicos_del_hospital_comparten_el_listado_de_pacientes(self):
        paciente = Paciente.objects.create(
            historia_clinica="HC-COMPARTIDO-01",
            dni="33445566",
            nombres="Paciente",
            apellidos="Compartido",
            fecha_nacimiento=date(2018, 2, 3),
            creado_por=self.medico,
        )
        otro_medico = Usuario.objects.create_user(
            username="otro-medico-hospital",
            email="otro.medico.hospital@hnsb.gob.pe",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.MEDICO,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        otro_token = Token.objects.create(user=otro_medico)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {otro_token.key}")

        listado = self.client.get(reverse("pacientes:medico-pacientes"), {"q": "33445566"})
        ficha = self.client.get(
            reverse("pacientes:medico-ficha-paciente", kwargs={"paciente_id": paciente.id})
        )

        self.assertEqual(listado.status_code, status.HTTP_200_OK)
        self.assertEqual(listado.data["paginacion"]["total"], 1)
        self.assertEqual(listado.data["resultados"][0]["registradoPor"]["id"], str(self.medico.id))
        self.assertEqual(ficha.status_code, status.HTTP_200_OK)

    def test_alta_provisional_crea_ficha_asignacion_y_acceso_local_utilizable(self):
        respuesta = self.client.post(
            reverse("pacientes:medico-alta-paciente"),
            {
                "nombreCompleto": "Mateo Gabriel Flores",
                "dni": "74585684",
                "telefono": "+51 987 654 321",
                "correo": "familia.mateo@example.com",
            },
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED, respuesta.data)
        paciente = Paciente.objects.get(pk=respuesta.data["paciente"]["id"])
        self.assertEqual(paciente.nombre_completo, "Mateo Gabriel Flores")
        self.assertEqual(paciente.dni, "74585684")
        self.assertIsNone(paciente.fecha_nacimiento)
        self.assertFalse(paciente.perfil_completo)
        self.assertTrue(paciente.historia_clinica.startswith("HC-"))
        self.assertTrue(
            AsignacionMedica.objects.filter(
                paciente=paciente,
                medico=self.medico,
                activa=True,
                es_principal=True,
            ).exists()
        )
        tutor = TutorPaciente.objects.get(paciente=paciente, es_principal=True)
        self.assertEqual(tutor.telefono_principal, "+51 987 654 321")
        self.assertEqual(tutor.correo, "familia.mateo@example.com")

        cuenta = CuentaMovilPaciente.objects.select_related("usuario").get(paciente=paciente)
        self.assertEqual(cuenta.estado, CuentaMovilPaciente.Estado.ACTIVA)
        self.assertEqual(cuenta.usuario.dni, "74585684")
        self.assertEqual(cuenta.usuario.telefono, "+51 987 654 321")
        self.assertTrue(cuenta.usuario.requiere_cambio_password)
        self.assertEqual(respuesta.data["cuenta"]["usuario"], cuenta.usuario.username)
        self.assertTrue(respuesta.data["cuenta"]["contrasenaTemporal"])

        cliente_paciente = self.client_class()
        login = cliente_paciente.post(
            reverse("usuarios:login-paciente"),
            {
                "identificador": respuesta.data["cuenta"]["usuario"],
                "password": respuesta.data["cuenta"]["contrasenaTemporal"],
            },
            format="json",
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK, login.data)
        cliente_paciente.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['token']}")
        inicio = cliente_paciente.get(reverse("pacientes:paciente-inicio"))
        self.assertEqual(inicio.status_code, status.HTTP_200_OK, inicio.data)
        self.assertEqual(inicio.data["paciente"]["id"], str(paciente.id))

        listado = self.client.get(reverse("pacientes:medico-pacientes"), {"q": "74585684"})
        self.assertEqual(listado.status_code, status.HTTP_200_OK)
        self.assertEqual(listado.data["resultados"][0]["id"], str(paciente.id))
        ficha = self.client.get(
            reverse("pacientes:medico-ficha-paciente", kwargs={"paciente_id": paciente.id})
        )
        self.assertEqual(ficha.status_code, status.HTTP_200_OK)
        self.assertEqual(ficha.data["nombre"], "Mateo Gabriel Flores")

    def test_alta_provisional_rechaza_dni_duplicado_sin_crear_datos_parciales(self):
        Paciente.objects.create(
            historia_clinica="HC-EXISTENTE-01",
            dni="74585684",
            nombres="Mateo",
            apellidos="Existente",
            fecha_nacimiento=None,
        )
        total_usuarios = Usuario.objects.count()

        respuesta = self.client.post(
            reverse("pacientes:medico-alta-paciente"),
            {
                "nombreCompleto": "Otro Mateo Flores",
                "dni": "74585684",
                "telefono": "987654321",
            },
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("dni", respuesta.data)
        self.assertEqual(Usuario.objects.count(), total_usuarios)
        self.assertEqual(Paciente.objects.filter(dni="74585684").count(), 1)
