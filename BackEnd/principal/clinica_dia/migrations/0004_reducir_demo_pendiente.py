from django.db import migrations


def reducir_demo(apps, schema_editor):
    Solicitud = apps.get_model("clinica_dia", "SolicitudQuimioterapia")
    Programacion = apps.get_model("clinica_dia", "ProgramacionQuimioterapia")
    Cita = apps.get_model("citas", "Cita")

    sobrantes = Solicitud.objects.filter(
        codigo_externo__in=("DEMO-CD-005", "DEMO-CD-006")
    )
    programaciones = Programacion.objects.filter(solicitud__in=sobrantes)
    citas_ids = list(
        programaciones.exclude(cita_id=None).values_list("cita_id", flat=True)
    )
    programaciones.delete()
    Cita.objects.filter(id__in=citas_ids).delete()
    sobrantes.delete()


class Migration(migrations.Migration):
    dependencies = [
        ("clinica_dia", "0003_nombre_demo_breve"),
    ]

    operations = [
        migrations.RunPython(reducir_demo, migrations.RunPython.noop),
    ]
