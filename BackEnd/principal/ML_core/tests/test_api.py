from datetime import date, timedelta
from unittest.mock import Mock, patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from citas.models import Cita
from clinica.models import ConsultaClinica, PlanTratamiento
from medicacion.models import DosisProgramada, Prescripcion
from pacientes.models import AsignacionMedica, CuentaMovilPaciente, Paciente
from usuarios.models import Usuario

from ML_core.models import SesionConsultaVoz
from ML_core.esquemas import es_comando_siguiente


class ConsultaVozAPITests(APITestCase):
    def setUp(self):
        self.medico = Usuario.objects.create_user(
            username="medico-voz",
            email="medico.voz@hospital.local",
            password="ClaveSegura-2026",
            first_name="Valeria",
            last_name="Ruiz",
            rol=Usuario.Rol.MEDICO,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        self.paciente = Paciente.objects.create(
            historia_clinica="HC-VOZ-001",
            dni="12345678",
            nombres="Mateo Gabriel",
            apellidos="Flores",
            fecha_nacimiento=date(2017, 3, 16),
            estado=Paciente.Estado.ACTIVO,
            creado_por=self.medico,
        )
        AsignacionMedica.objects.create(paciente=self.paciente, medico=self.medico)
        token = Token.objects.create(user=self.medico)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.key}")

    def crear_sesion(self):
        respuesta = self.client.post(
            reverse("ml_core:crear-sesion-voz"),
            {"pacienteId": str(self.paciente.id)},
            format="json",
        )
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED, respuesta.data)
        return respuesta

    def test_crea_borrador_vacio_con_pregunta_inicial(self):
        respuesta = self.crear_sesion()

        self.assertEqual(respuesta.data["estado"], SesionConsultaVoz.Estado.BORRADOR)
        self.assertEqual(respuesta.data["preguntaActual"], "¿Cuál es el motivo de consulta?")
        self.assertEqual(respuesta.data["secciones"]["motivoConsulta"], "")
        consulta = ConsultaClinica.objects.get(pk=respuesta.data["consultaId"])
        self.assertEqual(consulta.origen, ConsultaClinica.Origen.VOZ)
        self.assertEqual(consulta.estado, ConsultaClinica.Estado.BORRADOR)

    @patch("ML_core.servicios.obtener_cliente_ollama")
    def test_transcribe_texto_y_estructura_con_ollama_simulado(self, obtener_cliente):
        sesion = self.crear_sesion().data
        cliente = Mock()
        cliente.estructurar.return_value = {
            "secciones": {"motivoConsulta": "Control posterior a quimioterapia"},
            "preguntaSiguiente": "¿Cómo ha evolucionado el paciente?",
            "listo": False,
        }
        obtener_cliente.return_value = cliente

        respuesta = self.client.post(
            reverse("ml_core:transcribir-sesion-voz", kwargs={"sesion_id": sesion["id"]}),
            {"texto": "Control posterior a quimioterapia"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        self.assertEqual(respuesta.data["transcripcion"], "Control posterior a quimioterapia")
        self.assertEqual(
            respuesta.data["secciones"]["motivoConsulta"],
            "Control posterior a quimioterapia",
        )
        self.assertEqual(
            respuesta.data["preguntaActual"],
            "¿Cómo ha evolucionado clínicamente el paciente?",
        )

    @patch("ML_core.servicios.obtener_cliente_ollama")
    def test_comando_para_avanzar_omite_pregunta_sin_contaminar_resumen(self, obtener_cliente):
        sesion = self.crear_sesion().data
        url = reverse("ml_core:transcribir-sesion-voz", kwargs={"sesion_id": sesion["id"]})

        respuesta = self.client.post(
            url,
            {"texto": "Podemos pasar a la siguiente pregunta, por favor"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        self.assertEqual(respuesta.data["preguntasOmitidas"], ["motivoConsulta"])
        self.assertEqual(respuesta.data["transcripcion"], "")
        self.assertEqual(respuesta.data["secciones"]["motivoConsulta"], "")
        self.assertEqual(
            respuesta.data["preguntaActual"],
            "¿Cómo ha evolucionado clínicamente el paciente?",
        )
        self.assertTrue(
            any(
                intervencion["rol"] == "MEDICO" and intervencion.get("tipo") == "control"
                for intervencion in respuesta.data["intervenciones"]
            )
        )
        obtener_cliente.assert_not_called()

    @patch("ML_core.servicios.obtener_cliente_ollama")
    def test_duda_del_medico_orienta_sin_contaminar_resumen(self, obtener_cliente):
        sesion = self.crear_sesion().data
        cliente = Mock()
        cliente.orientar_medico.return_value = "Puede indicar motivo, tiempo de evolucion y si hubo fiebre."
        obtener_cliente.return_value = cliente

        respuesta = self.client.post(
            reverse("ml_core:transcribir-sesion-voz", kwargs={"sesion_id": sesion["id"]}),
            {"texto": "Como puedo decirlo mejor?"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        self.assertEqual(respuesta.data["transcripcion"], "")
        self.assertEqual(respuesta.data["secciones"]["motivoConsulta"], "")
        self.assertEqual(respuesta.data["preguntaActual"], "¿Cuál es el motivo de consulta?")
        cliente.orientar_medico.assert_called_once()
        cliente.estructurar.assert_not_called()

    def test_volver_a_preguntas_repite_el_punto_actual(self):
        sesion = self.crear_sesion().data

        respuesta = self.client.post(
            reverse("ml_core:transcribir-sesion-voz", kwargs={"sesion_id": sesion["id"]}),
            {"texto": "Volvamos a las preguntas del formulario"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        self.assertEqual(respuesta.data["transcripcion"], "")
        self.assertEqual(respuesta.data["preguntaActual"], "¿Cuál es el motivo de consulta?")

    @patch("ML_core.servicios.obtener_cliente_ollama")
    def test_puede_omitir_toda_la_entrevista_con_comandos_breves(self, obtener_cliente):
        sesion = self.crear_sesion().data
        url = reverse("ml_core:transcribir-sesion-voz", kwargs={"sesion_id": sesion["id"]})

        respuesta = None
        for comando in ("siguiente", "pasa", "continuemos", "omitir", "salta esta pregunta", "avanza"):
            respuesta = self.client.post(url, {"texto": comando}, format="json")
            self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)

        assert respuesta is not None
        self.assertEqual(respuesta.data["estado"], SesionConsultaVoz.Estado.LISTO)
        self.assertEqual(len(respuesta.data["preguntasOmitidas"]), 6)
        self.assertEqual(respuesta.data["transcripcion"], "")
        obtener_cliente.assert_not_called()

    def test_no_confunde_una_descripcion_clinica_con_un_comando(self):
        self.assertFalse(es_comando_siguiente("El paciente pasó la noche sin fiebre y continúa estable"))

    @patch("ML_core.views.obtener_transcriptor")
    @patch("ML_core.servicios.obtener_cliente_ollama")
    def test_audio_usa_transcriptor_local_simulado(self, obtener_cliente, obtener_transcriptor):
        sesion = self.crear_sesion().data
        transcriptor = Mock()
        transcriptor.transcribir.return_value = "Paciente sin fiebre"
        obtener_transcriptor.return_value = transcriptor
        cliente = Mock()
        cliente.estructurar.return_value = {
            "secciones": {"evolucionClinica": "Paciente sin fiebre"},
            "preguntaSiguiente": "¿Qué tratamiento desea indicar?",
            "listo": False,
        }
        obtener_cliente.return_value = cliente
        audio = SimpleUploadedFile("consulta.webm", b"audio-simulado", content_type="audio/webm")

        respuesta = self.client.post(
            reverse("ml_core:transcribir-sesion-voz", kwargs={"sesion_id": sesion["id"]}),
            {"audio": audio},
            format="multipart",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        transcriptor.transcribir.assert_called_once()
        self.assertEqual(respuesta.data["transcripcion"], "Paciente sin fiebre")

    def test_cualquier_medico_del_hospital_puede_crear_sesion(self):
        otro_paciente = Paciente.objects.create(
            historia_clinica="HC-VOZ-002",
            nombres="Luciana",
            apellidos="Rojas",
            fecha_nacimiento=date(2018, 4, 2),
        )

        respuesta = self.client.post(
            reverse("ml_core:crear-sesion-voz"),
            {"pacienteId": str(otro_paciente.id)},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED, respuesta.data)

    def test_publicar_genera_historia_plan_medicacion_dosis_y_cita(self):
        sesion = self.crear_sesion().data
        proximo_control = timezone.localdate() + timedelta(days=14)
        secciones = {
            "motivoConsulta": "Control de rutina",
            "evolucionClinica": "Evolución favorable, sin fiebre.",
            "tratamientoIndicado": "Continuar fase de mantenimiento.",
            "medicacionIndicada": [
                {
                    "nombre": "Prednisona",
                    "dosisCantidad": "10",
                    "dosisUnidad": "mg",
                    "via": "ORAL",
                    "frecuenciaTexto": "Una tableta cada 12 horas",
                    "diasSemana": [0, 1, 2, 3, 4, 5, 6],
                    "horas": ["08:00", "20:00"],
                    "duracionDias": 7,
                    "indicaciones": "Tomar después de los alimentos.",
                }
            ],
            "indicacionesCasa": "Mantener hidratación y vigilar fiebre.",
            "proximoControl": {
                "fecha": proximo_control.isoformat(),
                "hora": "10:30",
                "detalle": "Control hematológico",
            },
        }

        respuesta = self.client.post(
            reverse("ml_core:publicar-sesion-voz", kwargs={"sesion_id": sesion["id"]}),
            {"secciones": secciones},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED, respuesta.data)
        consulta = ConsultaClinica.objects.get(pk=sesion["consultaId"])
        self.assertEqual(consulta.estado, ConsultaClinica.Estado.COMPLETADA)
        self.assertEqual(consulta.secciones.count(), 6)
        plan = PlanTratamiento.objects.get(consulta_origen=consulta)
        self.assertEqual(plan.estado, PlanTratamiento.Estado.VIGENTE)
        prescripcion = Prescripcion.objects.get(consulta=consulta)
        self.assertEqual(prescripcion.estado, Prescripcion.Estado.ACTIVA)
        self.assertEqual(prescripcion.horarios.count(), 2)
        self.assertEqual(DosisProgramada.objects.filter(prescripcion=prescripcion).count(), 14)
        self.assertTrue(Cita.objects.filter(paciente=self.paciente, inicio__date=proximo_control).exists())

        usuario_paciente = Usuario.objects.create_user(
            username="familia-mateo",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.PACIENTE,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        CuentaMovilPaciente.objects.create(
            paciente=self.paciente,
            usuario=usuario_paciente,
            alias="mateo.flores",
            estado=CuentaMovilPaciente.Estado.ACTIVA,
        )
        token_paciente = Token.objects.create(user=usuario_paciente)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_paciente.key}")
        respuesta_tratamiento = self.client.get(reverse("clinica:paciente-tratamiento"))
        respuesta_medicacion = self.client.get(reverse("medicacion:paciente-medicacion"))
        self.assertEqual(respuesta_tratamiento.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta_tratamiento.data["medicamentos"][0]["nombre"], "Prednisona")
        self.assertEqual(respuesta_medicacion.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta_medicacion.data["medicamentos"][0]["nombre"], "Prednisona")

    def test_no_permite_publicar_dos_veces(self):
        sesion = self.crear_sesion().data
        datos = {"motivoConsulta": "Control de rutina"}
        url = reverse("ml_core:publicar-sesion-voz", kwargs={"sesion_id": sesion["id"]})
        primera = self.client.post(url, {"secciones": datos}, format="json")
        segunda = self.client.post(url, {"secciones": datos}, format="json")

        self.assertEqual(primera.status_code, status.HTTP_201_CREATED, primera.data)
        self.assertEqual(segunda.status_code, status.HTTP_400_BAD_REQUEST)
