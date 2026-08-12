from django.core.management.base import BaseCommand
from django.db import transaction

from usuarios.models import Usuario


class Command(BaseCommand):
    help = "Crea o actualiza el administrador local inicial de HemoRuta."

    def add_arguments(self, parser):
        parser.add_argument("--usuario", default="alex")
        parser.add_argument("--contrasena", default="alex")
        parser.add_argument("--correo", default="alex@hemoruta.local")

    @transaction.atomic
    def handle(self, *args, **options):
        usuario, creado = Usuario.objects.get_or_create(
            username=options["usuario"],
            defaults={
                "first_name": "Alex",
                "email": options["correo"],
            },
        )
        usuario.email = options["correo"]
        usuario.rol = Usuario.Rol.ADMINISTRADOR
        usuario.estado = Usuario.Estado.ACTIVO
        usuario.is_active = True
        usuario.is_staff = True
        usuario.is_superuser = True
        usuario.requiere_cambio_password = False
        usuario.set_password(options["contrasena"])
        usuario.save()

        accion = "creada" if creado else "actualizada"
        self.stdout.write(
            self.style.SUCCESS(
                f"Cuenta administradora '{usuario.username}' {accion} correctamente."
            )
        )
