from django.db import migrations, models

import usuarios.models


class Migration(migrations.Migration):
    dependencies = [("usuarios", "0001_initial")]

    operations = [
        migrations.AddField(
            model_name="usuario",
            name="foto_perfil",
            field=models.FileField(
                blank=True,
                null=True,
                upload_to=usuarios.models.ruta_foto_perfil,
                verbose_name="foto de perfil",
            ),
        ),
    ]
