from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("ML_core", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="sesionconsultavoz",
            name="preguntas_omitidas",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
