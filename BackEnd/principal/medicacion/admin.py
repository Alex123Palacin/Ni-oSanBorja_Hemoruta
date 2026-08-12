from django.contrib import admin

from .models import (
    DiaHorarioPrescripcion,
    DosisProgramada,
    HorarioPrescripcion,
    Medicamento,
    Prescripcion,
    ReporteDosis,
)

admin.site.register(
    (Medicamento, Prescripcion, HorarioPrescripcion, DiaHorarioPrescripcion, DosisProgramada, ReporteDosis)
)

