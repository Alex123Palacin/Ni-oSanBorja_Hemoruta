from django.db import migrations


SINTOMAS_BASE = (
    ("fiebre", "Fiebre"),
    ("dolor", "Dolor"),
    ("nauseas", "Náuseas"),
    ("vomitos", "Vómitos"),
    ("sangrado", "Sangrado"),
    ("cansancio", "Cansancio"),
    ("diarrea", "Diarrea"),
    ("otro", "Otro"),
)


def crear_catalogo_base(apps, schema_editor):
    catalogo = apps.get_model("seguimiento", "CatalogoSintoma")
    for codigo, nombre in SINTOMAS_BASE:
        catalogo.objects.update_or_create(
            codigo=codigo,
            defaults={"activo": True, "nombre": nombre},
        )


class Migration(migrations.Migration):
    dependencies = [("seguimiento", "0001_initial")]

    operations = [migrations.RunPython(crear_catalogo_base, migrations.RunPython.noop)]
