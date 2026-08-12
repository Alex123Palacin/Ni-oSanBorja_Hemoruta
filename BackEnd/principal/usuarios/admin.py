from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import PerfilMedico, Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = (
        "username",
        "nombre_completo",
        "dni",
        "email",
        "rol",
        "estado",
        "is_active",
    )
    list_filter = ("rol", "estado", "is_active", "is_staff")
    search_fields = ("username", "first_name", "last_name", "dni", "email")
    ordering = ("first_name", "last_name", "username")
    fieldsets = UserAdmin.fieldsets + (
        (
            "HemoRuta",
            {
                "fields": (
                    "dni",
                    "telefono",
                    "foto_perfil",
                    "rol",
                    "estado",
                    "requiere_cambio_password",
                    "creado_en",
                    "actualizado_en",
                )
            },
        ),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "HemoRuta",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "email",
                    "dni",
                    "telefono",
                    "foto_perfil",
                    "rol",
                    "estado",
                    "requiere_cambio_password",
                )
            },
        ),
    )
    readonly_fields = ("creado_en", "actualizado_en")


@admin.register(PerfilMedico)
class PerfilMedicoAdmin(admin.ModelAdmin):
    list_display = (
        "usuario",
        "numero_colegiatura",
        "especialidad",
        "cargo",
        "estado_laboral",
    )
    list_filter = ("estado_laboral", "especialidad")
    search_fields = (
        "usuario__first_name",
        "usuario__last_name",
        "usuario__dni",
        "numero_colegiatura",
    )
    autocomplete_fields = ("usuario",)
