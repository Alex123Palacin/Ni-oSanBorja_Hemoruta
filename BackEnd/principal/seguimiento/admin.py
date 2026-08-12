from django.contrib import admin

from .models import (
    AlertaSeguimiento,
    CatalogoSintoma,
    EventoSeguimiento,
    ReporteSintomas,
    SemaforoPaciente,
    SintomaReportado,
)

admin.site.register(
    (CatalogoSintoma, ReporteSintomas, SintomaReportado, EventoSeguimiento, SemaforoPaciente, AlertaSeguimiento)
)

