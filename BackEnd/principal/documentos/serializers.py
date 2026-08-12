import hashlib
from pathlib import Path

from rest_framework import serializers

from .models import DocumentoPaciente


EXTENSIONES_DOCUMENTO_PERMITIDAS = {".pdf", ".png", ".jpg", ".jpeg"}
TAMANO_MAXIMO_DOCUMENTO = 15 * 1024 * 1024
TIPO_MIME_POR_EXTENSION = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
}


def _firma_coincide(extension, cabecera):
    if extension == ".pdf":
        return cabecera.startswith(b"%PDF-")
    if extension == ".png":
        return cabecera.startswith(b"\x89PNG\r\n\x1a\n")
    return cabecera.startswith(b"\xff\xd8\xff")


def validar_archivo_documento(archivo):
    extension = Path(archivo.name).suffix.lower()
    if extension not in EXTENSIONES_DOCUMENTO_PERMITIDAS:
        raise serializers.ValidationError("Formato no permitido. Use PDF, PNG o JPG.")
    if archivo.size > TAMANO_MAXIMO_DOCUMENTO:
        raise serializers.ValidationError("El archivo no puede superar 15 MB.")
    if archivo.size == 0:
        raise serializers.ValidationError("El archivo no puede estar vacío.")
    cabecera = archivo.read(12)
    archivo.seek(0)
    if not _firma_coincide(extension, cabecera):
        raise serializers.ValidationError("El contenido del archivo no coincide con su formato.")
    return archivo


def agregar_metadatos_archivo(validated_data):
    archivo = validated_data.get("archivo")
    if not archivo:
        return

    resumen = hashlib.sha256()
    for fragmento in archivo.chunks():
        resumen.update(fragmento)
    archivo.seek(0)

    validated_data.update(
        nombre_original=archivo.name,
        tipo_mime=TIPO_MIME_POR_EXTENSION[Path(archivo.name).suffix.lower()],
        tamano_bytes=archivo.size,
        sha256=resumen.hexdigest(),
    )


class DocumentoPacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentoPaciente
        fields = "__all__"
        read_only_fields = (
            "id",
            "nombre_original",
            "tipo_mime",
            "tamano_bytes",
            "sha256",
            "subido_por",
            "creado_en",
            "actualizado_en",
        )

    def validate(self, attrs):
        consulta = attrs.get("consulta", getattr(self.instance, "consulta", None))
        paciente = attrs.get("paciente", getattr(self.instance, "paciente", None))
        if consulta and paciente and consulta.paciente_id != paciente.id:
            raise serializers.ValidationError({"consulta": "La consulta pertenece a otro paciente."})

        return attrs

    def validate_archivo(self, archivo):
        return validar_archivo_documento(archivo)

    def create(self, validated_data):
        agregar_metadatos_archivo(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        agregar_metadatos_archivo(validated_data)
        return super().update(instance, validated_data)


class CargaDocumentoPacienteSerializer(serializers.ModelSerializer):
    archivo = serializers.FileField(required=True, allow_empty_file=False)
    fechaDocumento = serializers.DateField(
        source="fecha_documento",
        required=False,
        allow_null=True,
    )

    class Meta:
        model = DocumentoPaciente
        fields = ("tipo", "titulo", "descripcion", "fechaDocumento", "archivo")

    def validate_archivo(self, archivo):
        return validar_archivo_documento(archivo)

    def create(self, validated_data):
        agregar_metadatos_archivo(validated_data)
        return super().create(validated_data)
