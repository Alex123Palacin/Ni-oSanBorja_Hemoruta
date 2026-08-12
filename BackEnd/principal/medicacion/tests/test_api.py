from calendar import monthrange
from datetime import date, datetime, time, timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from medicacion.models import (
    DiaHorarioPrescripcion,
    DosisProgramada,
    HorarioPrescripcion,
    Medicamento,
    Prescripcion,
    ReporteDosis,
)
from pacientes.models import AsignacionMedica, CuentaMovilPaciente, Paciente
from seguimiento.models import EventoSeguimiento
from usuarios.models import Usuario


class MedicacionPacienteAPITests(APITestCase):
    def setUp(self):
        self.medico = Usuario.objects.create_user(
            username="medico-medicacion",
            email="medico.medicacion@hospital.local",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.MEDICO,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        self.usuario_paciente = Usuario.objects.create_user(
            username="paciente-medicacion",
            email="paciente.medicacion@hospital.local",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.PACIENTE,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        self.paciente = Paciente.objects.create(
            historia_clinica="HC-MED-001",
            dni="81234567",
            nombres="Mateo Gabriel",
            apellidos="Flores",
            fecha_nacimiento=date(2017, 3, 16),
            estado=Paciente.Estado.ACTIVO,
            creado_por=self.medico,
        )
        CuentaMovilPaciente.objects.create(
            paciente=self.paciente,
            usuario=self.usuario_paciente,
            alias="mateo.medicacion",
            estado=CuentaMovilPaciente.Estado.ACTIVA,
        )
        AsignacionMedica.objects.create(paciente=self.paciente, medico=self.medico)
        medicamento = Medicamento.objects.create(
            nombre_generico="Prednisona",
            forma_farmaceutica="Tableta",
            concentracion="10 mg",
        )
        self.prescripcion = Prescripcion.objects.create(
            paciente=self.paciente,
            medicamento=medicamento,
            medico=self.medico,
            cantidad_dosis=10,
            unidad_dosis="mg",
            frecuencia_texto="Cada 24 horas",
            fecha_inicio=timezone.localdate(),
            estado=Prescripcion.Estado.ACTIVA,
        )
        self.horario = HorarioPrescripcion.objects.create(
            prescripcion=self.prescripcion,
            hora=time(0, 0),
        )
        DiaHorarioPrescripcion.objects.create(
            horario=self.horario,
            dia_semana=timezone.localdate().weekday(),
        )
        zona = timezone.get_current_timezone()
        self.programada_para = timezone.make_aware(
            datetime.combine(timezone.localdate(), time(0, 0)),
            zona,
        )
        self.dosis = DosisProgramada.objects.create(
            prescripcion=self.prescripcion,
            horario=self.horario,
            programada_para=self.programada_para,
        )
        self.token_paciente = Token.objects.create(user=self.usuario_paciente)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_paciente.key}")

    def test_calendario_mensual_expone_ocurrencias_y_no_infiere_cumplimiento(self):
        hoy = timezone.localdate()
        respuesta = self.client.get(
            reverse("medicacion:paciente-medicacion"),
            {"mes": hoy.strftime("%Y-%m")},
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK, respuesta.data)
        self.assertEqual(respuesta.data["mes"], hoy.strftime("%Y-%m"))
        self.assertEqual(len(respuesta.data["calendario"]), monthrange(hoy.year, hoy.month)[1])
        dia_hoy = next(dia for dia in respuesta.data["calendario"] if dia["fecha"] == hoy.isoformat())
        self.assertEqual(dia_hoy["estado"], "HOY_PENDIENTE")
        self.assertEqual(dia_hoy["pendientes"], 1)
        self.assertEqual(respuesta.data["dosisHoy"][0]["id"], str(self.dosis.id))
        self.assertEqual(
            respuesta.data["medicamentos"][0]["ocurrencias"][0]["estado"],
            DosisProgramada.Estado.PENDIENTE,
        )

    def test_reportar_toma_crea_un_solo_evento_visible_para_el_medico(self):
        url = reverse("medicacion:paciente-medicacion-tomas")
        respuesta = self.client.post(
            url,
            {"ocurrenciaId": str(self.dosis.id), "respuesta": "TOMADA"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED, respuesta.data)
        reporte = ReporteDosis.objects.get(dosis_programada=self.dosis)
        evento = EventoSeguimiento.objects.get(reporte_dosis=reporte)
        self.assertEqual(evento.paciente, self.paciente)
        self.assertEqual(evento.tipo, EventoSeguimiento.Tipo.MEDICACION)
        self.assertEqual(evento.estado, EventoSeguimiento.Estado.CUMPLIDO)
        self.assertIn("Prednisona", evento.resumen)

        duplicada = self.client.post(
            url,
            {"ocurrenciaId": str(self.dosis.id), "respuesta": "TOMADA"},
            format="json",
        )
        self.assertEqual(duplicada.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(EventoSeguimiento.objects.filter(reporte_dosis=reporte).count(), 1)

        token_medico = Token.objects.create(user=self.medico)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_medico.key}")
        seguimiento = self.client.get(
            reverse(
                "seguimiento:medico-seguimiento-paciente",
                kwargs={"paciente_id": self.paciente.id},
            ),
            {"tipo": "MEDICACION"},
        )
        self.assertEqual(seguimiento.status_code, status.HTTP_200_OK, seguimiento.data)
        self.assertEqual(seguimiento.data["resultados"][0]["id"], str(evento.id))

    def test_no_tomada_genera_alerta_con_motivo(self):
        segunda = DosisProgramada.objects.create(
            prescripcion=self.prescripcion,
            horario=self.horario,
            programada_para=self.programada_para + timedelta(minutes=1),
        )

        respuesta = self.client.post(
            reverse("medicacion:paciente-medicacion-tomas"),
            {
                "ocurrenciaId": str(segunda.id),
                "respuesta": "NO_TOMADA",
                "motivoNoToma": "SIN_MEDICAMENTO",
            },
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED, respuesta.data)
        evento = EventoSeguimiento.objects.get(reporte_dosis__dosis_programada=segunda)
        self.assertEqual(evento.estado, EventoSeguimiento.Estado.ALERTA)
        self.assertIn("No habia medicamento", evento.detalle)
