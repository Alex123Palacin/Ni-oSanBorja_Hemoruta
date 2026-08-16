from django.urls import path

from .views import (
    CancelarProgramacionAPIView,
    ClinicaDiaPanelAPIView,
    CompletarProgramacionAPIView,
    ConfirmarAgendaAPIView,
    ConfirmarProgramacionAPIView,
    ExportarAgendaAPIView,
    GenerarAgendaAPIView,
    HistorialProgramacionAPIView,
    ImportarSolicitudesAPIView,
    PlantillaSolicitudesAPIView,
    ProgramacionDetalleAPIView,
    ProgramacionesAPIView,
    RecordatorioProgramacionAPIView,
    SolicitudQuimioterapiaCrearAPIView,
)


app_name = "clinica_dia"

urlpatterns = [
    path("admin/clinica-dia/", ClinicaDiaPanelAPIView.as_view(), name="panel"),
    path(
        "admin/clinica-dia/solicitudes/",
        SolicitudQuimioterapiaCrearAPIView.as_view(),
        name="crear-solicitud",
    ),
    path(
        "admin/clinica-dia/importar/",
        ImportarSolicitudesAPIView.as_view(),
        name="importar",
    ),
    path(
        "admin/clinica-dia/plantilla/",
        PlantillaSolicitudesAPIView.as_view(),
        name="plantilla",
    ),
    path(
        "admin/clinica-dia/generar-agenda/",
        GenerarAgendaAPIView.as_view(),
        name="generar-agenda",
    ),
    path(
        "admin/clinica-dia/confirmar-agenda/",
        ConfirmarAgendaAPIView.as_view(),
        name="confirmar-agenda",
    ),
    path(
        "admin/clinica-dia/programaciones/",
        ProgramacionesAPIView.as_view(),
        name="programar",
    ),
    path(
        "admin/clinica-dia/programaciones/<uuid:programacion_id>/",
        ProgramacionDetalleAPIView.as_view(),
        name="ajustar-programacion",
    ),
    path(
        "admin/clinica-dia/programaciones/<uuid:programacion_id>/confirmar/",
        ConfirmarProgramacionAPIView.as_view(),
        name="confirmar-programacion",
    ),
    path(
        "admin/clinica-dia/programaciones/<uuid:programacion_id>/completar/",
        CompletarProgramacionAPIView.as_view(),
        name="completar-programacion",
    ),
    path(
        "admin/clinica-dia/programaciones/<uuid:programacion_id>/cancelar/",
        CancelarProgramacionAPIView.as_view(),
        name="cancelar-programacion",
    ),
    path(
        "admin/clinica-dia/programaciones/<uuid:programacion_id>/recordatorio/",
        RecordatorioProgramacionAPIView.as_view(),
        name="recordatorio-programacion",
    ),
    path(
        "admin/clinica-dia/programaciones/<uuid:programacion_id>/historial/",
        HistorialProgramacionAPIView.as_view(),
        name="historial-programacion",
    ),
    path(
        "admin/clinica-dia/exportar/",
        ExportarAgendaAPIView.as_view(),
        name="exportar",
    ),
]

