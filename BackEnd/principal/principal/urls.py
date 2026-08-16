from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from usuarios.urls import router as router_usuarios


api_v1 = [
    path("", include("nucleo.urls")),
    path("", include("usuarios.urls")),
    # Alias orientado al modulo administrativo del frontend.
    path("admin/", include(router_usuarios.urls)),
    path("", include("pacientes.urls")),
    path("", include("clinica_dia.urls")),
    path("", include("clinica.urls")),
    path("", include("citas.urls")),
    path("", include("medicacion.urls")),
    path("", include("seguimiento.urls")),
    path("", include("documentos.urls")),
    path("", include("ML_core.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_v1)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
