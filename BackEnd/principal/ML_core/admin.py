from django.contrib import admin

from .models import SesionConsultaVoz


@admin.register(SesionConsultaVoz)
class SesionConsultaVozAdmin(admin.ModelAdmin):
    list_display = ("consulta", "estado", "ia_disponible", "creado_en", "publicado_en")
    list_filter = ("estado", "ia_disponible")
    search_fields = (
        "consulta__paciente__nombres",
        "consulta__paciente__apellidos",
        "consulta__paciente__historia_clinica",
    )
    readonly_fields = ("creado_en", "actualizado_en", "publicado_en")
