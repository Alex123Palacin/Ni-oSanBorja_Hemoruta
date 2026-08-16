from django.db import migrations


CODIGOS_CONSERVADOS = tuple(f"DEMO-CD-{numero:03d}" for numero in range(1, 7))


def dejar_demo_sin_programar(apps, schema_editor):
    Solicitud = apps.get_model("clinica_dia", "SolicitudQuimioterapia")
    Programacion = apps.get_model("clinica_dia", "ProgramacionQuimioterapia")
    Cita = apps.get_model("citas", "Cita")

    solicitudes_demo = Solicitud.objects.filter(codigo_externo__startswith="DEMO-CD-")
    programaciones = Programacion.objects.filter(solicitud__in=solicitudes_demo)
    citas_ids = list(
        programaciones.exclude(cita_id=None).values_list("cita_id", flat=True)
    )
    programaciones.delete()
    Cita.objects.filter(id__in=citas_ids).delete()
    solicitudes_demo.exclude(codigo_externo__in=CODIGOS_CONSERVADOS).delete()
    solicitudes_demo.filter(codigo_externo__in=CODIGOS_CONSERVADOS).update(
        estado="PENDIENTE"
    )


class Migration(migrations.Migration):
    dependencies = [
        ("clinica_dia", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(dejar_demo_sin_programar, migrations.RunPython.noop),
    ]
