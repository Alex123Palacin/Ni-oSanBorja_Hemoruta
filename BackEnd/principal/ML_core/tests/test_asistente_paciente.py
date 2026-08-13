from datetime import date, datetime, time, timedelta
from unittest.mock import Mock, patch

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from citas.models import Cita
from clinica.models import ItemPlanTratamiento, PlanTratamiento
from documentos.models import DocumentoPaciente
from medicacion.models import DosisProgramada, HorarioPrescripcion, Medicamento, Prescripcion, ReporteDosis
from pacientes.models import CuentaMovilPaciente, Paciente
from usuarios.models import Usuario

from ML_core.proveedores import ErrorProveedorIA


class AsistentePacienteAPITests(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            username="familia-asistente",
            email="familia.asistente@example.com",
            password="ClaveSegura-2026",
            first_name="María",
            rol=Usuario.Rol.PACIENTE,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        self.paciente = Paciente.objects.create(
            historia_clinica="HC-ASIST-001",
            dni="10293847",
            nombres="Mateo Gabriel",
            apellidos="Flores",
            fecha_nacimiento=date(2017, 3, 16),
            estado=Paciente.Estado.ACTIVO,
        )
        CuentaMovilPaciente.objects.create(
            paciente=self.paciente,
            usuario=self.usuario,
            alias="mateo.asistente",
            estado=CuentaMovilPaciente.Estado.ACTIVA,
        )
        self.token = Token.objects.create(user=self.usuario)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token.key}")
        self.url = reverse("ml_core:asistente_paciente:consultar")

    def crear_contexto_clinico(self):
        medico = Usuario.objects.create_user(
            username="medico-asistente",
            email="medico.asistente@example.com",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.MEDICO,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        plan = PlanTratamiento.objects.create(
            paciente=self.paciente,
            medico=medico,
            nombre="Plan de mantenimiento",
            indicacion_general="Mantener hidratación.",
            estado=PlanTratamiento.Estado.VIGENTE,
        )
        ItemPlanTratamiento.objects.create(
            plan=plan,
            tipo=ItemPlanTratamiento.Tipo.CUIDADO_CASA,
            titulo="Indicaciones para casa",
            descripcion="Vigilar signos de alarma.",
        )
        medicamento = Medicamento.objects.create(
            nombre_generico="Paracetamol",
            forma_farmaceutica="Tableta",
            concentracion="500 mg",
        )
        prescripcion = Prescripcion.objects.create(
            paciente=self.paciente,
            medicamento=medicamento,
            plan_tratamiento=plan,
            medico=medico,
            cantidad_dosis=1,
            unidad_dosis="tableta",
            frecuencia_texto="Cada 12 horas",
            estado=Prescripcion.Estado.ACTIVA,
        )
        horario = HorarioPrescripcion.objects.create(prescripcion=prescripcion, hora=time(9, 0))
        zona = timezone.get_current_timezone()
        programada = timezone.make_aware(
            datetime.combine(timezone.localdate(), time(9, 0)),
            zona,
        )
        dosis = DosisProgramada.objects.create(
            prescripcion=prescripcion,
            horario=horario,
            programada_para=programada,
        )
        Cita.objects.create(
            paciente=self.paciente,
            medico=medico,
            inicio=timezone.now() + timedelta(days=5),
            tipo=Cita.Tipo.CONTROL,
            sede="Hospital del Niño San Borja",
            estado=Cita.Estado.CONFIRMADA,
        )
        return dosis

    @patch("ML_core.servicio_asistente_paciente.obtener_cliente_asistente_paciente")
    def test_responde_con_contexto_real_y_ruta_permitida(self, obtener_cliente):
        self.crear_contexto_clinico()
        cliente = Mock()
        cliente.responder.return_value = {
            "respuesta": "Hoy tienes Paracetamol a las 09:00.",
            "rutaSugerida": "/paciente/medicacion",
        }
        obtener_cliente.return_value = cliente

        respuesta = self.client.post(
            self.url,
            {"mensaje": "¿Qué pastilla me toca hoy?", "rutaActual": "/paciente/inicio"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        self.assertEqual(respuesta.data["rutaSugerida"], "/paciente/medicamento")
        self.assertTrue(respuesta.data["iaDisponible"])
        contexto = cliente.responder.call_args.kwargs["contexto"]
        self.assertEqual(contexto["medicacionHoy"][0]["medicamento"], "Paracetamol")
        self.assertEqual(contexto["proximaCita"]["sede"], "Hospital del Niño San Borja")
        self.assertEqual(contexto["tratamientoVigente"]["nombre"], "Plan de mantenimiento")

    @patch("ML_core.servicio_asistente_paciente.obtener_cliente_asistente_paciente")
    def test_respaldo_no_inventa_si_el_modelo_no_responde(self, obtener_cliente):
        self.crear_contexto_clinico()
        obtener_cliente.return_value.responder.side_effect = ErrorProveedorIA("Sin conexión")

        respuesta = self.client.post(
            self.url,
            {"mensaje": "Que medicacion me toca hoy?", "rutaActual": "/paciente/inicio"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertFalse(respuesta.data["iaDisponible"])
        self.assertIn("Paracetamol", respuesta.data["respuesta"])
        self.assertEqual(respuesta.data["rutaSugerida"], "/paciente/medicamento")

    def test_rechaza_personal_hospitalario(self):
        medico = Usuario.objects.create_user(
            username="medico-sin-asistente",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.MEDICO,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        token = Token.objects.create(user=medico)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.key}")

        respuesta = self.client.post(
            self.url,
            {"mensaje": "Hola", "rutaActual": "/paciente/inicio"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_403_FORBIDDEN)

    @patch("ML_core.servicio_asistente_paciente.obtener_cliente_asistente_paciente")
    def test_no_responde_temas_ajenos_al_portal(self, obtener_cliente):
        respuesta = self.client.post(
            self.url,
            {"mensaje": "Cuéntame una receta de cocina", "rutaActual": "/paciente/inicio"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        self.assertIn("HemoRuta", respuesta.data["respuesta"])
        self.assertIsNone(respuesta.data["rutaSugerida"])
        obtener_cliente.assert_not_called()

    @patch("ML_core.servicio_asistente_paciente.obtener_cliente_asistente_paciente")
    def test_puede_marcar_proxima_dosis_pendiente_como_tomada(self, obtener_cliente):
        dosis = self.crear_contexto_clinico()

        respuesta = self.client.post(
            self.url,
            {"mensaje": "Listo, ya la tomé", "rutaActual": "/paciente/medicamento"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        self.assertEqual(respuesta.data["accionEjecutada"], "MARCAR_DOSIS_TOMADA")
        self.assertEqual(respuesta.data["rutaSugerida"], "/paciente/medicamento")
        dosis.refresh_from_db()
        self.assertEqual(dosis.estado, DosisProgramada.Estado.TOMADA)
        self.assertEqual(dosis.reporte.respuesta, ReporteDosis.Respuesta.TOMADA)
        obtener_cliente.assert_not_called()

    @patch("ML_core.servicio_asistente_paciente.obtener_cliente_asistente_paciente")
    def test_no_ejecuta_accion_ambigua_si_hay_varias_dosis(self, obtener_cliente):
        self.crear_contexto_clinico()
        medicamento = Medicamento.objects.create(
            nombre_generico="Omeprazol",
            forma_farmaceutica="Cápsula",
            concentracion="20 mg",
        )
        medico = Usuario.objects.get(username="medico-asistente")
        prescripcion = Prescripcion.objects.create(
            paciente=self.paciente,
            medicamento=medicamento,
            medico=medico,
            cantidad_dosis=1,
            unidad_dosis="cápsula",
            frecuencia_texto="Diaria",
            estado=Prescripcion.Estado.ACTIVA,
        )
        horario = HorarioPrescripcion.objects.create(prescripcion=prescripcion, hora=time(20, 0))
        DosisProgramada.objects.create(
            prescripcion=prescripcion,
            horario=horario,
            programada_para=timezone.make_aware(
                datetime.combine(timezone.localdate(), time(20, 0)),
                timezone.get_current_timezone(),
            ),
        )

        respuesta = self.client.post(
            self.url,
            {"mensaje": "Ya la tomé", "rutaActual": "/paciente/medicamento"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        self.assertIsNone(respuesta.data["accionEjecutada"])
        self.assertIn("más de una dosis pendiente", respuesta.data["respuesta"])
        self.assertEqual(DosisProgramada.objects.filter(estado=DosisProgramada.Estado.PENDIENTE).count(), 2)
        obtener_cliente.assert_not_called()

    @patch("ML_core.servicio_asistente_paciente.obtener_cliente_asistente_paciente")
    def test_puede_reportar_dosis_tarde_identificada_por_nombre(self, obtener_cliente):
        dosis = self.crear_contexto_clinico()

        respuesta = self.client.post(
            self.url,
            {"mensaje": "Tomé Paracetamol tarde", "rutaActual": "/paciente/medicamento"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        self.assertEqual(respuesta.data["accionEjecutada"], "MARCAR_DOSIS_TARDE")
        dosis.refresh_from_db()
        self.assertEqual(dosis.estado, DosisProgramada.Estado.TARDE)
        self.assertEqual(dosis.reporte.respuesta, ReporteDosis.Respuesta.TARDE)
        obtener_cliente.assert_not_called()

    @patch("ML_core.servicio_asistente_paciente.obtener_cliente_asistente_paciente")
    def test_urgencia_se_responde_antes_de_filtrar_tema(self, obtener_cliente):
        respuesta = self.client.post(
            self.url,
            {"mensaje": "No puedo respirar", "rutaActual": "/paciente/inicio"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        self.assertIn("atención inmediata", respuesta.data["respuesta"])
        self.assertEqual(respuesta.data["rutaSugerida"], "/paciente/sintomas")
        obtener_cliente.assert_not_called()

    @patch("ML_core.servicio_asistente_paciente.obtener_cliente_asistente_paciente")
    def test_contexto_del_modelo_incluye_solo_datos_clinicos_del_paciente(self, obtener_cliente):
        self.crear_contexto_clinico()
        otro = Paciente.objects.create(
            historia_clinica="HC-ASIST-OTRO",
            nombres="Paciente",
            apellidos="Ajeno",
            fecha_nacimiento=date(2016, 1, 1),
        )
        DocumentoPaciente.objects.create(
            paciente=otro,
            titulo="Documento secreto ajeno",
            tipo=DocumentoPaciente.Tipo.LABORATORIO,
            subido_por=self.usuario,
        )
        cliente = Mock()
        cliente.responder.return_value = {"respuesta": "Revisa tus documentos.", "rutaSugerida": "/paciente/documentos"}
        obtener_cliente.return_value = cliente

        respuesta = self.client.post(
            self.url,
            {"mensaje": "¿Cuáles son mis documentos?", "rutaActual": "/paciente/inicio"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        contexto = cliente.responder.call_args.kwargs["contexto"]
        self.assertNotIn("Documento secreto ajeno", str(contexto))
        self.assertEqual(contexto["paciente"]["nombre"], self.paciente.nombre_completo)
