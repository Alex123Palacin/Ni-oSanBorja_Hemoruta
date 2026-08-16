from __future__ import annotations

from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from clinica_dia.models import SolicitudQuimioterapia
from clinica_dia.services import siguiente_dia_habil
from pacientes.models import Paciente


SOLICITUDES_DEMO = (
    ("DEMO-CD-001", "ALTA", 120, time(8, 30), "Protocolo LLA mantenimiento"),
    ("DEMO-CD-002", "MEDIA", 90, time(11, 30), "Metotrexato"),
    ("DEMO-CD-003", "ALTA", 210, time(14, 30), "Infusión prolongada"),
    ("DEMO-CD-004", "BAJA", 60, None, "Control ambulatorio"),
)


class Command(BaseCommand):
    help = "Crea solicitudes pendientes de Clínica de Día para programarlas desde el panel."

    def add_arguments(self, parser):
        parser.add_argument("--admin-username", default="alex")
        parser.add_argument("--fecha-base")

    @transaction.atomic
    def handle(self, *args, **options):
        Usuario = get_user_model()
        admin = Usuario.objects.filter(
            username=options["admin_username"],
            rol=Usuario.Rol.ADMINISTRADOR,
        ).first()
        if not admin:
            raise CommandError("Debe existir el administrador indicado para crear el seed.")
        fecha_indicada = self._fecha(options.get("fecha_base"))
        fecha_agenda = siguiente_dia_habil(
            max(fecha_indicada or timezone.localdate(), timezone.localdate())
            + timedelta(days=1)
        )
        pacientes = list(Paciente.objects.order_by("creado_en", "id")[:5])
        creadas = 0
        for indice, (codigo, prioridad, duracion, hora, protocolo) in enumerate(
            SOLICITUDES_DEMO
        ):
            paciente = pacientes[indice] if indice < len(pacientes) else None
            solicitud, creada = SolicitudQuimioterapia.objects.get_or_create(
                codigo_externo=codigo,
                defaults=self._valores_solicitud(
                    indice=indice,
                    paciente=paciente,
                    prioridad=prioridad,
                    duracion=duracion,
                    hora=hora,
                    protocolo=protocolo,
                    fecha=fecha_agenda,
                    admin=admin,
                ),
            )
            creadas += int(creada)
        self.stdout.write(
            self.style.SUCCESS(
                f"Seed Clínica de Día listo: {creadas} solicitudes nuevas; la agenda queda para programación manual o automática."
            )
        )

    @staticmethod
    def _fecha(valor: str | None) -> date | None:
        if not valor:
            return None
        try:
            return date.fromisoformat(valor)
        except ValueError as error:
            raise CommandError("--fecha-base debe usar el formato AAAA-MM-DD.") from error

    @staticmethod
    def _valores_solicitud(
        *, indice, paciente, prioridad, duracion, hora, protocolo, fecha, admin
    ):
        numero = indice + 1
        if paciente:
            dni = paciente.dni or f"80{numero:06d}"
            nombre = paciente.nombre_completo
            historia = paciente.historia_clinica
            tutor = paciente.tutores.filter(es_principal=True, autorizado=True).first()
            telefono = tutor.telefono_principal if tutor else "987654321"
            procedencia = paciente.procedencia or "Lima"
        else:
            dni = f"90{numero:06d}"
            nombre = "Renata López"
            historia = f"EXT-CD-{numero:03d}"
            telefono = f"98765{numero:04d}"
            procedencia = "Referencia externa"
        return {
            "paciente": paciente,
            "dni": dni,
            "nombre_completo_importado": nombre,
            "historia_clinica_importada": historia,
            "telefono": telefono,
            "procedencia": procedencia,
            "diagnostico": "Diagnóstico hematológico demo",
            "protocolo": protocolo,
            "prioridad": prioridad,
            "fecha_preferida": fecha,
            "hora_preferida": hora,
            "duracion_minutos": duracion,
            "estado": SolicitudQuimioterapia.Estado.PENDIENTE,
            "origen": SolicitudQuimioterapia.Origen.IMPORTACION,
            "observaciones": "Dato demostrativo de Clínica de Día.",
            "creada_por": admin,
        }
