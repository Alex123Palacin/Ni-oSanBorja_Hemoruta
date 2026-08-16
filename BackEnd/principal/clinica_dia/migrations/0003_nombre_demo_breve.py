from django.db import migrations


def actualizar_nombre_demo(apps, schema_editor):
    Solicitud = apps.get_model("clinica_dia", "SolicitudQuimioterapia")
    Solicitud.objects.filter(codigo_externo="DEMO-CD-006").update(
        nombre_completo_importado="Renata López",
        historia_clinica_importada="",
    )


class Migration(migrations.Migration):
    dependencies = [
        ("clinica_dia", "0002_dejar_demo_sin_programar"),
    ]

    operations = [
        migrations.RunPython(actualizar_nombre_demo, migrations.RunPython.noop),
    ]
