from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils.text import slugify
from rest_framework import serializers

from pacientes.services import vincular_usuario_con_paciente

from .models import PerfilMedico, Usuario


class PerfilMedicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilMedico
        fields = (
            "id",
            "numero_colegiatura",
            "especialidad",
            "cargo",
            "estado_laboral",
        )
        read_only_fields = ("id",)


class UsuarioLecturaSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source="first_name", read_only=True)
    apellidos = serializers.CharField(source="last_name", read_only=True)
    correo = serializers.EmailField(source="email", read_only=True)
    nombre_completo = serializers.CharField(read_only=True)
    perfil_medico = PerfilMedicoSerializer(read_only=True)
    foto_perfil = serializers.SerializerMethodField()

    def get_foto_perfil(self, usuario):
        if not usuario.foto_perfil:
            return None
        request = self.context.get("request")
        url = usuario.foto_perfil.url
        return request.build_absolute_uri(url) if request else url

    class Meta:
        model = Usuario
        fields = (
            "id",
            "username",
            "nombre",
            "apellidos",
            "correo",
            "first_name",
            "last_name",
            "nombre_completo",
            "dni",
            "email",
            "telefono",
            "foto_perfil",
            "rol",
            "estado",
            "requiere_cambio_password",
            "is_active",
            "last_login",
            "creado_en",
            "actualizado_en",
            "perfil_medico",
        )


class UsuarioEscrituraSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    dni = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    password = serializers.CharField(write_only=True, required=False, style={"input_type": "password"})
    perfil_medico = PerfilMedicoSerializer(required=False, allow_null=True)

    class Meta:
        model = Usuario
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "dni",
            "email",
            "telefono",
            "password",
            "rol",
            "estado",
            "requiere_cambio_password",
            "perfil_medico",
        )
        read_only_fields = ("id",)
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def validate_email(self, value):
        return value or None

    def validate_dni(self, value):
        if not value:
            return None
        if len(value) != 8 or not value.isdigit():
            raise serializers.ValidationError("El DNI debe contener exactamente 8 dígitos.")
        return value

    def validate_password(self, value):
        try:
            validate_password(value, self.instance)
        except DjangoValidationError as error:
            raise serializers.ValidationError(list(error.messages)) from error
        return value

    def validate(self, attrs):
        rol = attrs.get("rol", getattr(self.instance, "rol", Usuario.Rol.PACIENTE))
        perfil = attrs.get("perfil_medico", serializers.empty)

        if perfil not in (serializers.empty, None) and rol != Usuario.Rol.MEDICO:
            raise serializers.ValidationError(
                {"perfil_medico": "Solo un usuario médico puede tener perfil médico."}
            )

        if self.instance and self.instance.is_superuser:
            estado = attrs.get("estado", self.instance.estado)
            if rol != Usuario.Rol.ADMINISTRADOR or estado != Usuario.Estado.ACTIVO:
                raise serializers.ValidationError(
                    "Una cuenta de superusuario debe continuar activa y ser administradora."
                )

        if not self.instance and not attrs.get("password"):
            raise serializers.ValidationError({"password": "Este campo es obligatorio."})
        return attrs

    @staticmethod
    def _generar_username(attrs):
        base = attrs.get("dni")
        if not base and attrs.get("email"):
            base = attrs["email"].split("@", maxsplit=1)[0]
        if not base:
            base = slugify(f"{attrs.get('first_name', '')}.{attrs.get('last_name', '')}")
        base = base or "usuario"

        candidato = base
        consecutivo = 2
        while Usuario.objects.filter(username__iexact=candidato).exists():
            candidato = f"{base}{consecutivo}"
            consecutivo += 1
        return candidato

    @transaction.atomic
    def create(self, validated_data):
        perfil_data = validated_data.pop("perfil_medico", None)
        password = validated_data.pop("password")
        if not validated_data.get("username"):
            validated_data["username"] = self._generar_username(validated_data)

        estado = validated_data.get("estado", Usuario.Estado.PENDIENTE)
        rol = validated_data.get("rol", Usuario.Rol.PACIENTE)
        validated_data["is_active"] = estado == Usuario.Estado.ACTIVO
        validated_data["is_staff"] = rol == Usuario.Rol.ADMINISTRADOR

        usuario = Usuario.objects.create_user(password=password, **validated_data)
        if rol == Usuario.Rol.MEDICO:
            PerfilMedico.objects.create(usuario=usuario, **(perfil_data or {}))
        elif rol == Usuario.Rol.PACIENTE:
            request = self.context.get("request")
            creado_por = getattr(request, "user", None)
            try:
                vincular_usuario_con_paciente(usuario, creado_por=creado_por)
            except DjangoValidationError as error:
                detalle = getattr(error, "message_dict", None) or {
                    "non_field_errors": error.messages
                }
                raise serializers.ValidationError(detalle) from error
        return usuario

    @transaction.atomic
    def update(self, instance, validated_data):
        perfil_data = validated_data.pop("perfil_medico", serializers.empty)
        password = validated_data.pop("password", None)

        for campo, valor in validated_data.items():
            setattr(instance, campo, valor)

        instance.is_active = instance.estado == Usuario.Estado.ACTIVO
        if not instance.is_superuser:
            instance.is_staff = instance.rol == Usuario.Rol.ADMINISTRADOR
        if password:
            instance.set_password(password)
        instance.save()

        if instance.rol == Usuario.Rol.MEDICO:
            perfil, _ = PerfilMedico.objects.get_or_create(usuario=instance)
            if perfil_data not in (serializers.empty, None):
                for campo, valor in perfil_data.items():
                    setattr(perfil, campo, valor)
                perfil.full_clean()
                perfil.save()

        if not instance.is_active and hasattr(instance, "auth_token"):
            instance.auth_token.delete()
        return instance

    def to_representation(self, instance):
        return UsuarioLecturaSerializer(instance, context=self.context).data


class LoginSerializer(serializers.Serializer):
    identificador = serializers.CharField(trim_whitespace=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)


class CambiarContrasenaSerializer(serializers.Serializer):
    nueva_contrasena = serializers.CharField(write_only=True, trim_whitespace=False)
    requiere_cambio_password = serializers.BooleanField(default=False)

    def validate_nueva_contrasena(self, value):
        usuario = self.context.get("usuario")
        try:
            validate_password(value, usuario)
        except DjangoValidationError as error:
            raise serializers.ValidationError(list(error.messages)) from error
        return value


class PerfilPropioSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source="first_name", required=False, max_length=150)
    apellidos = serializers.CharField(source="last_name", required=False, max_length=150)
    foto = serializers.FileField(
        source="foto_perfil",
        required=False,
        allow_null=True,
        write_only=True,
    )
    foto_perfil = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Usuario
        fields = (
            "id",
            "nombre",
            "apellidos",
            "nombre_completo",
            "telefono",
            "email",
            "rol",
            "foto",
            "foto_perfil",
        )
        read_only_fields = ("id", "nombre_completo", "email", "rol", "foto_perfil")

    def get_foto_perfil(self, usuario):
        if not usuario.foto_perfil:
            return None
        request = self.context.get("request")
        url = usuario.foto_perfil.url
        return request.build_absolute_uri(url) if request else url

    def validate_foto(self, archivo):
        if archivo is None:
            return None
        if archivo.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("La imagen no puede superar los 5 MB.")

        nombre = archivo.name.lower()
        extension = next(
            (extension for extension in (".jpg", ".jpeg", ".png", ".webp") if nombre.endswith(extension)),
            None,
        )
        if extension is None:
            raise serializers.ValidationError("Usa una imagen JPG, PNG o WEBP.")

        posicion = archivo.tell()
        cabecera = archivo.read(16)
        archivo.seek(posicion)
        es_jpeg = cabecera.startswith(b"\xff\xd8\xff")
        es_png = cabecera.startswith(b"\x89PNG\r\n\x1a\n")
        es_webp = cabecera.startswith(b"RIFF") and cabecera[8:12] == b"WEBP"
        coincide_extension = (
            (extension in (".jpg", ".jpeg") and es_jpeg)
            or (extension == ".png" and es_png)
            or (extension == ".webp" and es_webp)
        )
        if not coincide_extension:
            raise serializers.ValidationError("El archivo no contiene una imagen válida.")
        return archivo

    def update(self, instance, validated_data):
        foto_anterior = instance.foto_perfil.name if instance.foto_perfil else ""
        instance = super().update(instance, validated_data)
        foto_actual = instance.foto_perfil.name if instance.foto_perfil else ""
        if foto_anterior and foto_anterior != foto_actual:
            instance.foto_perfil.storage.delete(foto_anterior)
        return instance


class CambiarContrasenaPropiaSerializer(serializers.Serializer):
    contrasena_actual = serializers.CharField(write_only=True, trim_whitespace=False)
    nueva_contrasena = serializers.CharField(write_only=True, trim_whitespace=False)
    confirmar_contrasena = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_contrasena_actual(self, value):
        usuario = self.context["usuario"]
        if not usuario.check_password(value):
            raise serializers.ValidationError("La contraseña actual no es correcta.")
        return value

    def validate(self, attrs):
        if attrs["nueva_contrasena"] != attrs["confirmar_contrasena"]:
            raise serializers.ValidationError(
                {"confirmar_contrasena": "Las contraseñas no coinciden."}
            )
        usuario = self.context["usuario"]
        try:
            validate_password(attrs["nueva_contrasena"], usuario)
        except DjangoValidationError as error:
            raise serializers.ValidationError(
                {"nueva_contrasena": list(error.messages)}
            ) from error
        return attrs
