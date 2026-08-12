from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("pacientes", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="paciente",
            name="fecha_nacimiento",
            field=models.DateField(blank=True, null=True),
        ),
    ]
