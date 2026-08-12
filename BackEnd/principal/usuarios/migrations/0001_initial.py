# Generado para la estructura inicial de identidad de HemoRuta.
import uuid

import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models

import usuarios.managers


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="Usuario",
            fields=[
                (
                    "password",
                    models.CharField(max_length=128, verbose_name="password"),
                ),
                (
                    "last_login",
                    models.DateTimeField(blank=True, null=True, verbose_name="last login"),
                ),
                (
                    "is_superuser",
                    models.BooleanField(
                        default=False,
                        help_text="Designates that this user has all permissions without explicitly assigning them.",
                        verbose_name="superuser status",
                    ),
                ),
                (
                    "username",
                    models.CharField(
                        error_messages={"unique": "A user with that username already exists."},
                        help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.",
                        max_length=150,
                        unique=True,
                        validators=[django.contrib.auth.validators.UnicodeUsernameValidator()],
                        verbose_name="username",
                    ),
                ),
                ("first_name", models.CharField(blank=True, max_length=150, verbose_name="first name")),
                ("last_name", models.CharField(blank=True, max_length=150, verbose_name="last name")),
                (
                    "is_staff",
                    models.BooleanField(
                        default=False,
                        help_text="Designates whether the user can log into this admin site.",
                        verbose_name="staff status",
                    ),
                ),
                (
                    "date_joined",
                    models.DateTimeField(default=django.utils.timezone.now, verbose_name="date joined"),
                ),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("creado_en", models.DateTimeField(auto_now_add=True)),
                ("actualizado_en", models.DateTimeField(auto_now=True)),
                (
                    "email",
                    models.EmailField(blank=True, max_length=254, null=True, unique=True, verbose_name="correo electrónico"),
                ),
                ("dni", models.CharField(blank=True, max_length=8, null=True, unique=True, verbose_name="DNI")),
                ("telefono", models.CharField(blank=True, max_length=20, verbose_name="teléfono")),
                (
                    "rol",
                    models.CharField(
                        choices=[
                            ("ADMINISTRADOR", "Administrador"),
                            ("MEDICO", "Médico"),
                            ("PACIENTE", "Paciente o responsable"),
                        ],
                        default="PACIENTE",
                        max_length=20,
                    ),
                ),
                (
                    "estado",
                    models.CharField(
                        choices=[
                            ("PENDIENTE", "Pendiente"),
                            ("ACTIVO", "Activo"),
                            ("INACTIVO", "Inactivo"),
                            ("BLOQUEADO", "Bloqueado"),
                        ],
                        default="PENDIENTE",
                        max_length=12,
                    ),
                ),
                ("requiere_cambio_password", models.BooleanField(default=True)),
                (
                    "is_active",
                    models.BooleanField(
                        default=False,
                        help_text="Indica si la cuenta puede autenticarse.",
                        verbose_name="activo",
                    ),
                ),
                (
                    "groups",
                    models.ManyToManyField(
                        blank=True,
                        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.group",
                        verbose_name="groups",
                    ),
                ),
                (
                    "user_permissions",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Specific permissions for this user.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.permission",
                        verbose_name="user permissions",
                    ),
                ),
            ],
            options={
                "verbose_name": "usuario",
                "verbose_name_plural": "usuarios",
                "ordering": ("first_name", "last_name", "username"),
                "indexes": [
                    models.Index(fields=["rol", "estado"], name="usuario_rol_estado_idx")
                ],
            },
            managers=[("objects", usuarios.managers.UsuarioManager())],
        ),
        migrations.CreateModel(
            name="PerfilMedico",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("creado_en", models.DateTimeField(auto_now_add=True)),
                ("actualizado_en", models.DateTimeField(auto_now=True)),
                (
                    "numero_colegiatura",
                    models.CharField(blank=True, max_length=30, null=True, unique=True, verbose_name="número de colegiatura"),
                ),
                ("especialidad", models.CharField(blank=True, max_length=120)),
                ("cargo", models.CharField(blank=True, max_length=120)),
                (
                    "estado_laboral",
                    models.CharField(
                        choices=[("ACTIVO", "Activo"), ("INACTIVO", "Inactivo")],
                        default="ACTIVO",
                        max_length=10,
                    ),
                ),
                (
                    "usuario",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="perfil_medico",
                        to="usuarios.usuario",
                    ),
                ),
            ],
            options={
                "verbose_name": "perfil médico",
                "verbose_name_plural": "perfiles médicos",
                "ordering": ("usuario__first_name", "usuario__last_name"),
            },
        ),
    ]
