from django.contrib import admin

from .models import (
    ConsultaClinica,
    Diagnostico,
    ItemPlanTratamiento,
    ItemSeccionConsulta,
    PlanTratamiento,
    SeccionConsulta,
)

admin.site.register(
    (Diagnostico, ConsultaClinica, SeccionConsulta, ItemSeccionConsulta, PlanTratamiento, ItemPlanTratamiento)
)

