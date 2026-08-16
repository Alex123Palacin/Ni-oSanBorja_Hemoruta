from django.contrib import admin

from .models import (
    CambioProgramacionQuimioterapia,
    ProgramacionQuimioterapia,
    SolicitudQuimioterapia,
)


admin.site.register(
    (
        SolicitudQuimioterapia,
        ProgramacionQuimioterapia,
        CambioProgramacionQuimioterapia,
    )
)
