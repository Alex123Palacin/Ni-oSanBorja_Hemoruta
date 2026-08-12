from datetime import date
import shutil
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient, APITestCase

from clinica.models import ConsultaClinica
from pacientes.models import (
    AsignacionMedica,
    CuentaMovilPaciente,
    Paciente,
    TutorPaciente,
)
from usuarios.models import PerfilMedico, Usuario


class AutenticacionAPITests(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            username="medica",
            email="medica@hospital.local",
            password="ClaveSegura-2026",
            first_name="Valeria",
            last_name="Ruiz",
            rol=Usuario.Rol.MEDICO,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        PerfilMedico.objects.create(usuario=self.usuario, especialidad="Hematología pediátrica")

    def test_login_me_y_logout_con_bearer_token(self):
        respuesta_login = self.client.post(
            reverse("usuarios:login-personal"),
            {"identificador": "medica@hospital.local", "password": "ClaveSegura-2026"},
            format="json",
        )

        self.assertEqual(respuesta_login.status_code, status.HTTP_200_OK)
        token = respuesta_login.data["token"]
        self.assertEqual(respuesta_login.data["usuario"]["nombre"], "Valeria")

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        respuesta_me = self.client.get(reverse("usuarios:usuario-actual"))
        self.assertEqual(respuesta_me.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta_me.data["rol"], Usuario.Rol.MEDICO)

        respuesta_logout = self.client.post(reverse("usuarios:logout"))
        self.assertEqual(respuesta_logout.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Token.objects.filter(user=self.usuario).exists())

    def test_cuenta_inactiva_no_puede_iniciar_sesion(self):
        self.usuario.estado = Usuario.Estado.INACTIVO
        self.usuario.is_active = False
        self.usuario.save()

        respuesta = self.client.post(
            reverse("usuarios:login-personal"),
            {"identificador": "medica", "password": "ClaveSegura-2026"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_acepta_el_esquema_token_usado_por_defecto_en_frontend(self):
        token = Token.objects.create(user=self.usuario)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        respuesta = self.client.get(reverse("usuarios:usuario-actual"))

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)

    def test_usuarios_distintos_mantienen_sesiones_independientes(self):
        paciente = Usuario.objects.create_user(
            username="responsable",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.PACIENTE,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        respuesta_paciente = self.client.post(
            reverse("usuarios:login-paciente"),
            {"identificador": "responsable", "password": "ClaveSegura-2026"},
            format="json",
        )
        respuesta_medica = self.client.post(
            reverse("usuarios:login-personal"),
            {"identificador": "medica", "password": "ClaveSegura-2026"},
            format="json",
        )

        self.assertEqual(respuesta_paciente.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta_medica.status_code, status.HTTP_200_OK)
        self.assertNotEqual(respuesta_paciente.data["token"], respuesta_medica.data["token"])

        cliente_paciente = APIClient()
        cliente_paciente.credentials(
            HTTP_AUTHORIZATION=f"Bearer {respuesta_paciente.data['token']}"
        )
        cliente_medica = APIClient()
        cliente_medica.credentials(
            HTTP_AUTHORIZATION=f"Bearer {respuesta_medica.data['token']}"
        )
        self.assertEqual(
            cliente_paciente.get(reverse("usuarios:usuario-actual")).data["rol"],
            Usuario.Rol.PACIENTE,
        )
        self.assertEqual(
            cliente_medica.get(reverse("usuarios:usuario-actual")).data["rol"],
            Usuario.Rol.MEDICO,
        )
        self.assertEqual(
            cliente_medica.post(reverse("usuarios:logout")).status_code,
            status.HTTP_204_NO_CONTENT,
        )
        self.assertEqual(
            cliente_paciente.get(reverse("usuarios:usuario-actual")).status_code,
            status.HTTP_200_OK,
        )


class PerfilPropioAPITests(APITestCase):
    def setUp(self):
        self.media_temporal = tempfile.mkdtemp(prefix="hemoruta-perfiles-")
        self.override_media = override_settings(MEDIA_ROOT=self.media_temporal)
        self.override_media.enable()
        self.addCleanup(self.override_media.disable)
        self.addCleanup(shutil.rmtree, self.media_temporal, True)

    def crear_usuario(self, rol, indice):
        return Usuario.objects.create_user(
            username=f"cuenta-{indice}",
            email=f"cuenta-{indice}@hospital.test",
            password="ClaveSegura-2026",
            first_name="Nombre",
            last_name=f"Rol {indice}",
            rol=rol,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )

    def autenticar(self, usuario):
        token = Token.objects.create(user=usuario)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.key}")

    def test_los_tres_roles_actualizan_datos_y_foto(self):
        for indice, rol in enumerate(Usuario.Rol.values, start=1):
            with self.subTest(rol=rol):
                usuario = self.crear_usuario(rol, indice)
                self.autenticar(usuario)
                foto = SimpleUploadedFile(
                    f"perfil-{indice}.png",
                    b"\x89PNG\r\n\x1a\n" + b"contenido-prueba",
                    content_type="image/png",
                )

                respuesta = self.client.patch(
                    reverse("usuarios:perfil-propio"),
                    {
                        "nombre": f"Nombre {indice}",
                        "apellidos": "Actualizado",
                        "telefono": f"9876543{indice:02d}",
                        "foto": foto,
                    },
                    format="multipart",
                )

                self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
                self.assertEqual(respuesta.data["nombre"], f"Nombre {indice}")
                self.assertTrue(respuesta.data["foto_perfil"].startswith("http://testserver/media/"))
                usuario.refresh_from_db()
                self.assertTrue(usuario.foto_perfil.name.startswith(f"perfiles/{usuario.id}/"))

    def test_rechaza_archivo_que_no_es_imagen(self):
        usuario = self.crear_usuario(Usuario.Rol.PACIENTE, 9)
        self.autenticar(usuario)
        archivo = SimpleUploadedFile("perfil.png", b"esto no es una imagen", content_type="image/png")

        respuesta = self.client.patch(
            reverse("usuarios:perfil-propio"),
            {"foto": archivo},
            format="multipart",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_los_tres_roles_cambian_contrasena_y_la_anterior_deja_de_servir(self):
        for indice, rol in enumerate(Usuario.Rol.values, start=20):
            with self.subTest(rol=rol):
                usuario = self.crear_usuario(rol, indice)
                self.autenticar(usuario)
                nueva = f"NuevaClave-Fuerte-{indice}"

                respuesta = self.client.post(
                    reverse("usuarios:cambiar-contrasena-propia"),
                    {
                        "contrasena_actual": "ClaveSegura-2026",
                        "nueva_contrasena": nueva,
                        "confirmar_contrasena": nueva,
                    },
                    format="json",
                )

                self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
                usuario.refresh_from_db()
                self.assertFalse(usuario.check_password("ClaveSegura-2026"))
                self.assertTrue(usuario.check_password(nueva))
                ruta_login = (
                    reverse("usuarios:login-paciente")
                    if rol == Usuario.Rol.PACIENTE
                    else reverse("usuarios:login-personal")
                )
                cliente_login = APIClient()
                respuesta_anterior = cliente_login.post(
                    ruta_login,
                    {"identificador": usuario.username, "password": "ClaveSegura-2026"},
                    format="json",
                )
                respuesta_nueva = cliente_login.post(
                    ruta_login,
                    {"identificador": usuario.username, "password": nueva},
                    format="json",
                )
                self.assertEqual(respuesta_anterior.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertEqual(respuesta_nueva.status_code, status.HTTP_200_OK)


class AdministracionUsuariosAPITests(APITestCase):
    def setUp(self):
        self.administrador = Usuario.objects.create_superuser(
            username="alex",
            email="alex@hemoruta.local",
            password="ClaveSegura-2026",
        )
        token = Token.objects.create(user=self.administrador)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.key}")

    def test_administrador_crea_medico_con_perfil(self):
        respuesta = self.client.post(
            reverse("usuarios:usuario-list"),
            {
                "first_name": "Ana",
                "last_name": "Torres",
                "dni": "12345678",
                "email": "ana.torres@hospital.local",
                "telefono": "987654321",
                "password": "ClaveSegura-2026",
                "rol": Usuario.Rol.MEDICO,
                "estado": Usuario.Estado.ACTIVO,
                "perfil_medico": {
                    "numero_colegiatura": "CMP-12345",
                    "especialidad": "Hematología pediátrica",
                    "cargo": "Médica tratante",
                },
            },
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED, respuesta.data)
        usuario = Usuario.objects.get(dni="12345678")
        self.assertTrue(usuario.is_active)
        self.assertEqual(usuario.perfil_medico.numero_colegiatura, "CMP-12345")

    def test_administrador_crea_cuenta_paciente_lista_para_iniciar_sesion(self):
        password = "ClavePaciente-2026"
        respuesta = self.client.post(
            reverse("usuarios:usuario-list"),
            {
                "first_name": "Mateo Gabriel",
                "last_name": "Flores",
                "dni": "33445566",
                "email": "mateo.flores@hospital.local",
                "telefono": "987654321",
                "password": password,
                "rol": Usuario.Rol.PACIENTE,
                "estado": Usuario.Estado.ACTIVO,
            },
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED, respuesta.data)
        usuario = Usuario.objects.get(dni="33445566")
        paciente = Paciente.objects.get(dni="33445566")
        cuenta = CuentaMovilPaciente.objects.get(usuario=usuario, paciente=paciente)
        self.assertIsNone(paciente.fecha_nacimiento)
        self.assertFalse(paciente.perfil_completo)
        self.assertEqual(cuenta.estado, CuentaMovilPaciente.Estado.ACTIVA)

        cliente_paciente = APIClient()
        respuesta_login = cliente_paciente.post(
            reverse("usuarios:login-paciente"),
            {"identificador": "33445566", "password": password},
            format="json",
        )
        self.assertEqual(respuesta_login.status_code, status.HTTP_200_OK, respuesta_login.data)
        cliente_paciente.credentials(
            HTTP_AUTHORIZATION=f"Bearer {respuesta_login.data['token']}"
        )
        respuesta_inicio = cliente_paciente.get(reverse("pacientes:paciente-inicio"))
        self.assertEqual(respuesta_inicio.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta_inicio.data["paciente"]["id"], str(paciente.id))
        cuenta.refresh_from_db()
        self.assertIsNotNone(cuenta.ultimo_acceso_en)

    def test_cuenta_paciente_se_vincula_a_ficha_preexistente_por_dni(self):
        paciente = Paciente.objects.create(
            historia_clinica="HC-VINCULO-001",
            dni="44556677",
            nombres="Luciana",
            apellidos="Rojas",
            fecha_nacimiento=date(2019, 7, 8),
            creado_por=self.administrador,
        )

        respuesta = self.client.post(
            reverse("usuarios:usuario-list"),
            {
                "first_name": "Luciana",
                "last_name": "Rojas",
                "dni": "44556677",
                "email": "luciana.rojas@hospital.local",
                "password": "ClavePaciente-2026",
                "rol": Usuario.Rol.PACIENTE,
                "estado": Usuario.Estado.ACTIVO,
            },
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED, respuesta.data)
        self.assertEqual(Paciente.objects.filter(dni="44556677").count(), 1)
        self.assertEqual(
            CuentaMovilPaciente.objects.get(usuario__dni="44556677").paciente_id,
            paciente.id,
        )

    def test_desactivar_usuario_revoca_su_token(self):
        usuario = Usuario.objects.create_user(
            username="paciente",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.PACIENTE,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        Token.objects.create(user=usuario)

        respuesta = self.client.post(
            reverse("usuarios:usuario-desactivar", kwargs={"pk": usuario.pk})
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        usuario.refresh_from_db()
        self.assertFalse(usuario.is_active)
        self.assertFalse(Token.objects.filter(user=usuario).exists())

    def test_usuario_no_administrador_no_accede_al_crud(self):
        medico = Usuario.objects.create_user(
            username="otro-medico",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.MEDICO,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        token = Token.objects.create(user=medico)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.key}")

        respuesta = self.client.get(reverse("usuarios:usuario-list"))

        self.assertEqual(respuesta.status_code, status.HTTP_403_FORBIDDEN)
        respuesta_detalle = self.client.get(
            reverse(
                "usuarios:usuario-detalle-administrativo",
                kwargs={"pk": medico.pk},
            )
        )
        self.assertEqual(respuesta_detalle.status_code, status.HTTP_403_FORBIDDEN)

    def test_detalle_medico_muestra_perfil_y_asignaciones(self):
        medico = Usuario.objects.create_user(
            username="hematologo",
            password="ClaveSegura-2026",
            first_name="Luis",
            last_name="Paredes",
            rol=Usuario.Rol.MEDICO,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        PerfilMedico.objects.create(
            usuario=medico,
            numero_colegiatura="CMP-7654",
            especialidad="Hematología pediátrica",
            cargo="Médico tratante",
        )
        paciente = Paciente.objects.create(
            historia_clinica="HC-DET-001",
            dni="87654321",
            nombres="Mateo",
            apellidos="Flores",
            fecha_nacimiento=date(2017, 3, 16),
            creado_por=self.administrador,
        )
        AsignacionMedica.objects.create(
            paciente=paciente,
            medico=medico,
            asignado_por=self.administrador,
        )
        ConsultaClinica.objects.create(
            paciente=paciente,
            medico=medico,
            titulo="Control mensual",
            iniciada_en=timezone.now(),
        )

        respuesta = self.client.get(
            reverse(
                "usuarios:usuario-detalle-administrativo",
                kwargs={"pk": medico.pk},
            )
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["tipo_detalle"], Usuario.Rol.MEDICO)
        self.assertEqual(respuesta.data["detalle_medico"]["numero_colegiatura"], "CMP-7654")
        self.assertEqual(respuesta.data["detalle_medico"]["pacientes_asignados"], 1)
        self.assertEqual(respuesta.data["detalle_medico"]["consultas_este_mes"], 1)
        self.assertEqual(sum(item["total"] for item in respuesta.data["detalle_medico"]["consultas_por_semana"]), 1)
        self.assertEqual(respuesta.data["pacientes"], [])

    def test_detalle_paciente_solo_expone_ficha_administrativa(self):
        responsable = Usuario.objects.create_user(
            username="madre-mateo",
            password="ClaveSegura-2026",
            first_name="María",
            last_name="Flores",
            rol=Usuario.Rol.PACIENTE,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        paciente = Paciente.objects.create(
            historia_clinica="HC-DET-002",
            dni="11223344",
            nombres="Mateo Gabriel",
            apellidos="Flores",
            fecha_nacimiento=date(2017, 3, 16),
            sexo=Paciente.Sexo.MASCULINO,
            creado_por=self.administrador,
        )
        TutorPaciente.objects.create(
            paciente=paciente,
            usuario=responsable,
            nombres="María",
            apellidos="Flores",
            parentesco=TutorPaciente.Parentesco.MADRE,
            telefono_principal="987654321",
            correo="maria@hospital.local",
            es_principal=True,
        )

        respuesta = self.client.get(
            reverse(
                "usuarios:usuario-detalle-administrativo",
                kwargs={"pk": responsable.pk},
            )
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertFalse(respuesta.data["incluye_datos_clinicos"])
        self.assertEqual(respuesta.data["pacientes"][0]["historia_clinica"], "HC-DET-002")
        self.assertEqual(respuesta.data["pacientes"][0]["vinculo"]["parentesco"], "Madre")
        self.assertNotIn("diagnostico", respuesta.data["pacientes"][0])
