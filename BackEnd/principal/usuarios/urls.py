from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .models import Usuario
from .views import (
    CambiarContrasenaPropiaAPIView,
    LoginAPIView,
    LogoutAPIView,
    PerfilPropioAPIView,
    UsuarioActualAPIView,
    UsuarioViewSet,
)

app_name = "usuarios"

router = DefaultRouter()
router.register("usuarios", UsuarioViewSet, basename="usuario")

urlpatterns = [
    path(
        "auth/personal/login/",
        LoginAPIView.as_view(
            roles_permitidos=(Usuario.Rol.ADMINISTRADOR, Usuario.Rol.MEDICO)
        ),
        name="login-personal",
    ),
    path(
        "auth/paciente/login/",
        LoginAPIView.as_view(roles_permitidos=(Usuario.Rol.PACIENTE,)),
        name="login-paciente",
    ),
    path("auth/login/", LoginAPIView.as_view(), name="login"),
    path("auth/logout/", LogoutAPIView.as_view(), name="logout"),
    path("auth/me/", UsuarioActualAPIView.as_view(), name="usuario-actual"),
    path("auth/perfil/", PerfilPropioAPIView.as_view(), name="perfil-propio"),
    path(
        "auth/cambiar-contrasena/",
        CambiarContrasenaPropiaAPIView.as_view(),
        name="cambiar-contrasena-propia",
    ),
    path("", include(router.urls)),
]
