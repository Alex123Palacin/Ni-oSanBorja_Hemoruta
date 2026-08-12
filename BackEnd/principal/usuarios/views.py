from django.contrib.auth.models import update_last_login
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from nucleo.permissions import EsUsuarioActivo
from pacientes.services import registrar_acceso_cuenta_paciente

from .autenticacion import BearerTokenAuthentication
from .detalle_administrativo import construir_detalle_administrativo
from .models import Usuario
from .permissions import EsAdministrador
from .serializers import (
    CambiarContrasenaPropiaSerializer,
    CambiarContrasenaSerializer,
    LoginSerializer,
    PerfilPropioSerializer,
    UsuarioEscrituraSerializer,
    UsuarioLecturaSerializer,
)
from .servicios import activar_usuario, cambiar_contrasena, desactivar_usuario


class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    roles_permitidos = None

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identificador = serializer.validated_data["identificador"]
        password = serializer.validated_data["password"]

        usuario = Usuario.objects.filter(
            Q(username__iexact=identificador)
            | Q(email__iexact=identificador)
            | Q(dni=identificador)
        ).first()
        credenciales_invalidas = (
            usuario is None
            or not usuario.check_password(password)
            or not usuario.is_active
            or usuario.estado != Usuario.Estado.ACTIVO
            or (
                self.roles_permitidos is not None
                and usuario.rol not in self.roles_permitidos
            )
        )
        if credenciales_invalidas:
            return Response(
                {"detalle": "Credenciales inválidas o cuenta inactiva."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = Token.objects.get_or_create(user=usuario)
        update_last_login(None, usuario)
        registrar_acceso_cuenta_paciente(usuario)
        return Response(
            {
                "token": token.key,
                "usuario": UsuarioLecturaSerializer(
                    usuario,
                    context={"request": request},
                ).data,
            }
        )


class LogoutAPIView(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [EsUsuarioActivo]

    def post(self, request):
        if request.auth:
            request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UsuarioActualAPIView(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [EsUsuarioActivo]

    def get(self, request):
        return Response(
            UsuarioLecturaSerializer(
                request.user,
                context={"request": request},
            ).data
        )


class PerfilPropioAPIView(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [EsUsuarioActivo]

    def get(self, request):
        return Response(
            PerfilPropioSerializer(request.user, context={"request": request}).data
        )

    def patch(self, request):
        serializer = PerfilPropioSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        return Response(
            PerfilPropioSerializer(usuario, context={"request": request}).data
        )


class CambiarContrasenaPropiaAPIView(APIView):
    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [EsUsuarioActivo]

    def post(self, request):
        serializer = CambiarContrasenaPropiaSerializer(
            data=request.data,
            context={"usuario": request.user},
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["nueva_contrasena"])
        request.user.requiere_cambio_password = False
        request.user.save(update_fields=("password", "requiere_cambio_password", "actualizado_en"))
        return Response({"detalle": "Contraseña actualizada correctamente."})


class UsuarioViewSet(viewsets.ModelViewSet):
    """Administración local de cuentas hospitalarias."""

    authentication_classes = [BearerTokenAuthentication]
    permission_classes = [EsAdministrador]
    queryset = Usuario.objects.select_related("perfil_medico").all()
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ("rol", "estado", "is_active")
    search_fields = ("username", "first_name", "last_name", "dni", "email")
    ordering_fields = ("first_name", "last_name", "username", "creado_en", "last_login")
    ordering = ("first_name", "last_name", "username")

    def get_serializer_class(self):
        if self.action in {"list", "retrieve"}:
            return UsuarioLecturaSerializer
        return UsuarioEscrituraSerializer

    def destroy(self, request, *args, **kwargs):
        usuario = self.get_object()
        if usuario == request.user:
            return Response(
                {"detalle": "No puede desactivar su propia cuenta."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if usuario.is_superuser:
            return Response(
                {"detalle": "No puede desactivar un superusuario desde este endpoint."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        desactivar_usuario(usuario)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=("post",), url_path="activar")
    def activar(self, request, pk=None):
        usuario = activar_usuario(self.get_object())
        return Response(UsuarioLecturaSerializer(usuario).data)

    @action(detail=True, methods=("post",), url_path="desactivar")
    def desactivar(self, request, pk=None):
        usuario = self.get_object()
        if usuario == request.user or usuario.is_superuser:
            return Response(
                {"detalle": "Esta cuenta no puede desactivarse desde este endpoint."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        desactivar_usuario(usuario)
        return Response(UsuarioLecturaSerializer(usuario).data)

    @action(detail=True, methods=("post",), url_path="cambiar-contrasena")
    def cambiar_password(self, request, pk=None):
        usuario = self.get_object()
        serializer = CambiarContrasenaSerializer(
            data=request.data,
            context={"usuario": usuario},
        )
        serializer.is_valid(raise_exception=True)
        cambiar_contrasena(
            usuario,
            serializer.validated_data["nueva_contrasena"],
            serializer.validated_data["requiere_cambio_password"],
        )
        return Response({"detalle": "Contraseña actualizada correctamente."})

    @action(detail=True, methods=("get",), url_path="detalle-administrativo")
    def detalle_administrativo(self, request, pk=None):
        return Response(construir_detalle_administrativo(self.get_object()))
    PerfilPropioSerializer,
