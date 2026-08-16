from datetime import datetime, timedelta

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from clinica_dia.models import ProgramacionQuimioterapia, SolicitudQuimioterapia
from clinica_dia.services import (
    ajustar_programacion,
    confirmar_programacion,
    crear_programacion,
    generar_agenda_automatica,
)
from usuarios.models import Usuario


class AgendaAutomaticaTests(TestCase):
    def setUp(self):
        self.admin = Usuario.objects.create_user(
            username="admin-agenda",
            password="Clave-segura-2026",
            rol=Usuario.Rol.ADMINISTRADOR,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )

    def _viernes_futuro(self):
        hoy = timezone.localdate() + timedelta(days=1)
        return hoy + timedelta(days=(4 - hoy.weekday()) % 7)

    def _solicitud(self, indice, *, fecha=None, hora=None, duracion=60):
        return SolicitudQuimioterapia.objects.create(
            dni=f"{70000000 + indice:08d}",
            nombre_completo_importado=f"Paciente {indice}",
            telefono="987654321",
            procedencia="Hematología",
            prioridad=SolicitudQuimioterapia.Prioridad.MEDIA,
            fecha_preferida=fecha,
            hora_preferida=hora,
            duracion_minutos=duracion,
            origen=SolicitudQuimioterapia.Origen.MANUAL,
            codigo_externo=f"AUTO-{indice:03d}",
            creada_por=self.admin,
        )

    def test_veinticinco_solicitudes_balancean_8_por_turno_y_viernes_pasa_a_lunes(self):
        viernes = self._viernes_futuro()
        lunes = viernes + timedelta(days=3)
        for indice in range(25):
            self._solicitud(indice)
        creadas, pendientes = generar_agenda_automatica(
            fecha_desde=viernes,
            fecha_hasta=lunes,
            usuario=self.admin,
        )
        self.assertEqual(len(creadas), 25)
        self.assertEqual(pendientes, [])
        for turno in ProgramacionQuimioterapia.Turno.values:
            self.assertEqual(
                ProgramacionQuimioterapia.objects.filter(fecha=viernes, turno=turno).count(),
                8,
            )
        extra = ProgramacionQuimioterapia.objects.get(fecha=lunes)
        self.assertEqual(extra.turno, ProgramacionQuimioterapia.Turno.T1)
        self.assertLessEqual(
            ProgramacionQuimioterapia.objects.filter(
                fecha=viernes, turno=extra.turno
            ).count(),
            8,
        )

    def test_duracion_mayor_a_tres_horas_solo_ocupa_turno_tres(self):
        fecha = self._viernes_futuro()
        self._solicitud(90, duracion=210)
        creadas, _ = generar_agenda_automatica(
            fecha_desde=fecha,
            fecha_hasta=fecha,
            usuario=self.admin,
        )
        self.assertEqual(creadas[0].turno, ProgramacionQuimioterapia.Turno.T3)

    def test_hora_preferida_avanza_en_orden_y_luego_reinicia_al_dia_siguiente(self):
        viernes = self._viernes_futuro()
        lunes = viernes + timedelta(days=3)
        indice = 100
        for turno in (ProgramacionQuimioterapia.Turno.T2, ProgramacionQuimioterapia.Turno.T3):
            for cama in range(1, 9):
                solicitud = self._solicitud(indice, fecha=viernes, duracion=60)
                crear_programacion(
                    solicitud=solicitud,
                    fecha=viernes,
                    turno=turno,
                    cama=cama,
                    usuario=self.admin,
                    origen=ProgramacionQuimioterapia.Origen.MANUAL,
                )
                indice += 1
        objetivo = self._solicitud(indice, fecha=viernes, hora=datetime.strptime("11:30", "%H:%M").time())
        creadas, _ = generar_agenda_automatica(
            fecha_desde=viernes,
            fecha_hasta=lunes,
            usuario=self.admin,
            solicitud_ids=[objetivo.id],
        )
        self.assertEqual(creadas[0].fecha, lunes)
        self.assertEqual(creadas[0].turno, ProgramacionQuimioterapia.Turno.T1)

    def test_reemplazar_cupo_conserva_programacion_e_historial_anterior(self):
        fecha = self._viernes_futuro()
        anterior = self._solicitud(300, fecha=fecha)
        nueva = self._solicitud(301, fecha=fecha)
        programacion_anterior = crear_programacion(
            solicitud=anterior,
            fecha=fecha,
            turno=ProgramacionQuimioterapia.Turno.T1,
            cama=1,
            usuario=self.admin,
            origen=ProgramacionQuimioterapia.Origen.MANUAL,
        )
        reemplazo = ajustar_programacion(
            programacion_anterior,
            solicitud_nueva=nueva,
            usuario=self.admin,
            motivo="Cambio de prioridad clínica.",
        )
        self.assertNotEqual(reemplazo.pk, programacion_anterior.pk)
        programacion_anterior.refresh_from_db()
        anterior.refresh_from_db()
        nueva.refresh_from_db()
        self.assertEqual(programacion_anterior.estado, ProgramacionQuimioterapia.Estado.CANCELADA)
        self.assertEqual(anterior.estado, SolicitudQuimioterapia.Estado.PENDIENTE)
        self.assertEqual(nueva.estado, SolicitudQuimioterapia.Estado.PROGRAMADA)
        self.assertEqual(reemplazo.solicitud, nueva)
        self.assertTrue(programacion_anterior.historial.filter(accion="CANCELADA").exists())
        self.assertTrue(reemplazo.historial.filter(accion="CREADA").exists())

    def test_confirmada_permanece_ocupada_durante_generacion(self):
        fecha = self._viernes_futuro()
        fija = self._solicitud(400, fecha=fecha)
        programacion = crear_programacion(
            solicitud=fija,
            fecha=fecha,
            turno=ProgramacionQuimioterapia.Turno.T1,
            cama=1,
            usuario=self.admin,
            origen=ProgramacionQuimioterapia.Origen.MANUAL,
        )
        confirmar_programacion(programacion, usuario=self.admin)
        nueva = self._solicitud(401)
        generar_agenda_automatica(
            fecha_desde=fecha,
            fecha_hasta=fecha,
            usuario=self.admin,
            solicitud_ids=[nueva.id],
        )
        programacion.refresh_from_db()
        self.assertEqual(programacion.estado, ProgramacionQuimioterapia.Estado.CONFIRMADA)
        self.assertEqual(programacion.cama, 1)
        self.assertEqual(programacion.turno, ProgramacionQuimioterapia.Turno.T1)
        self.assertFalse(
            ProgramacionQuimioterapia.objects.exclude(pk=programacion.pk).filter(
                fecha=fecha, turno=ProgramacionQuimioterapia.Turno.T1, cama=1
            ).exists()
        )

    def test_programacion_manual_rechaza_fecha_pasada(self):
        solicitud = self._solicitud(500)
        with self.assertRaises(ValidationError):
            crear_programacion(
                solicitud=solicitud,
                fecha=timezone.localdate() - timedelta(days=1),
                turno=ProgramacionQuimioterapia.Turno.T1,
                cama=1,
                usuario=self.admin,
                origen=ProgramacionQuimioterapia.Origen.MANUAL,
            )
