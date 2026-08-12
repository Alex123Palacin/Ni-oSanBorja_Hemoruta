import hashlib
from datetime import date
from tempfile import TemporaryDirectory

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from pacientes.models import AsignacionMedica, Paciente, TutorPaciente
from usuarios.models import Usuario

from documentos.models import DocumentoPaciente
from seguimiento.models import EventoSeguimiento


class DocumentosPacienteAPITests(APITestCase):
    def setUp(self):
        self.directorio_media = TemporaryDirectory()
        self.configuracion_media = override_settings(MEDIA_ROOT=self.directorio_media.name)
        self.configuracion_media.enable()

        self.usuario = Usuario.objects.create_user(
            username="responsable-documentos",
            email="responsable-documentos@hemoruta.local",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.PACIENTE,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        self.paciente = Paciente.objects.create(
            historia_clinica="HC-DOC-001",
            nombres="Mateo",
            apellidos="Flores",
            fecha_nacimiento=date(2017, 3, 16),
        )
        TutorPaciente.objects.create(
            paciente=self.paciente,
            usuario=self.usuario,
            nombres="Maria",
            apellidos="Flores",
            parentesco=TutorPaciente.Parentesco.MADRE,
            telefono_principal="987654321",
            es_principal=True,
        )
        token = Token.objects.create(user=self.usuario)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.key}")

        self.otro_usuario = Usuario.objects.create_user(
            username="otro-responsable-documentos",
            email="otro-responsable-documentos@hemoruta.local",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.PACIENTE,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        self.otro_paciente = Paciente.objects.create(
            historia_clinica="HC-DOC-002",
            nombres="Luciana",
            apellidos="Rojas",
            fecha_nacimiento=date(2019, 7, 8),
        )
        TutorPaciente.objects.create(
            paciente=self.otro_paciente,
            usuario=self.otro_usuario,
            nombres="Ana",
            apellidos="Rojas",
            parentesco=TutorPaciente.Parentesco.MADRE,
            telefono_principal="912345678",
            es_principal=True,
        )

    def tearDown(self):
        self.configuracion_media.disable()
        self.directorio_media.cleanup()

    def crear_documento(self, *, paciente=None, estado=DocumentoPaciente.Estado.DISPONIBLE, archivo=None):
        return DocumentoPaciente.objects.create(
            paciente=paciente or self.paciente,
            tipo=DocumentoPaciente.Tipo.LABORATORIO,
            titulo="Hemograma completo",
            archivo=archivo or "",
            nombre_original=getattr(archivo, "name", "") if archivo else "",
            tipo_mime=getattr(archivo, "content_type", "") if archivo else "",
            tamano_bytes=getattr(archivo, "size", 0) if archivo else 0,
            fecha_documento=date(2026, 8, 10),
            origen=DocumentoPaciente.Origen.APP,
            estado=estado,
            subido_por=self.usuario,
        )

    def test_paciente_carga_documento_multipart_con_metadatos_controlados(self):
        contenido = b"%PDF-1.4\ncontenido de prueba\n%%EOF"
        archivo = SimpleUploadedFile("hemograma privado.pdf", contenido, content_type="application/pdf")

        respuesta = self.client.post(
            reverse("documentos:paciente-documentos"),
            {
                "tipo": DocumentoPaciente.Tipo.LABORATORIO,
                "titulo": "Hemograma completo",
                "descripcion": "Control mensual",
                "fechaDocumento": "2026-08-10",
                "archivo": archivo,
                "estado": DocumentoPaciente.Estado.DISPONIBLE,
                "origen": DocumentoPaciente.Origen.MEDICO,
            },
            format="multipart",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED, respuesta.data)
        documento = DocumentoPaciente.objects.get(id=respuesta.data["id"])
        self.assertEqual(documento.paciente, self.paciente)
        self.assertEqual(documento.subido_por, self.usuario)
        self.assertEqual(documento.estado, DocumentoPaciente.Estado.PENDIENTE)
        self.assertEqual(documento.origen, DocumentoPaciente.Origen.APP)
        self.assertIsNone(documento.consulta)
        self.assertEqual(documento.nombre_original, "hemograma privado.pdf")
        self.assertEqual(documento.tipo_mime, "application/pdf")
        self.assertEqual(documento.tamano_bytes, len(contenido))
        self.assertEqual(documento.sha256, hashlib.sha256(contenido).hexdigest())
        self.assertEqual(documento.fecha_documento, date(2026, 8, 10))
        self.assertNotIn("hemograma privado", documento.archivo.name)
        self.assertTrue(respuesta.data["archivoDisponible"])
        self.assertEqual(
            respuesta.data["url"],
            reverse(
                "documentos:paciente-documento-archivo",
                kwargs={"documento_id": documento.id},
            ),
        )
        evento = EventoSeguimiento.objects.get(documento=documento)
        self.assertEqual(evento.paciente, self.paciente)
        self.assertEqual(evento.tipo, EventoSeguimiento.Tipo.DOCUMENTO)
        self.assertEqual(evento.estado, EventoSeguimiento.Estado.RECIBIDO)
        self.assertEqual(evento.origen, EventoSeguimiento.Origen.APP)
        self.assertIn("Hemograma completo", evento.resumen)

    def test_carga_rechaza_extension_no_permitida(self):
        archivo = SimpleUploadedFile("resultado.txt", b"no permitido", content_type="text/plain")

        respuesta = self.client.post(
            reverse("documentos:paciente-documentos"),
            {
                "tipo": DocumentoPaciente.Tipo.OTRO,
                "titulo": "Resultado",
                "archivo": archivo,
            },
            format="multipart",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("archivo", respuesta.data)

    def test_carga_rechaza_contenido_que_no_coincide_con_la_extension(self):
        archivo = SimpleUploadedFile(
            "resultado.pdf",
            b"<script>contenido que no es PDF</script>",
            content_type="application/pdf",
        )

        respuesta = self.client.post(
            reverse("documentos:paciente-documentos"),
            {
                "tipo": DocumentoPaciente.Tipo.OTRO,
                "titulo": "Resultado",
                "archivo": archivo,
            },
            format="multipart",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("archivo", respuesta.data)

    def test_listado_incluye_pendientes_y_disponibles_solo_del_paciente(self):
        disponible = self.crear_documento()
        pendiente = self.crear_documento(estado=DocumentoPaciente.Estado.PENDIENTE)
        rechazado = self.crear_documento(estado=DocumentoPaciente.Estado.RECHAZADO)
        ajeno = self.crear_documento(paciente=self.otro_paciente)

        respuesta = self.client.get(reverse("documentos:paciente-documentos"))

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        ids = {item["id"] for item in respuesta.data["resultados"]}
        self.assertEqual(ids, {str(disponible.id), str(pendiente.id)})
        self.assertNotIn(str(rechazado.id), ids)
        self.assertNotIn(str(ajeno.id), ids)

    def test_archivo_propio_se_puede_ver_y_descargar_con_autenticacion(self):
        contenido = b"%PDF-1.4\narchivo visible\n%%EOF"
        archivo = SimpleUploadedFile("informe medico.pdf", contenido, content_type="application/pdf")
        documento = self.crear_documento(archivo=archivo)
        ruta = reverse(
            "documentos:paciente-documento-archivo",
            kwargs={"documento_id": documento.id},
        )

        respuesta_ver = self.client.get(ruta)
        self.assertEqual(respuesta_ver.status_code, status.HTTP_200_OK)
        self.assertIn("inline", respuesta_ver["Content-Disposition"])
        for cerrar in respuesta_ver._resource_closers:
            cerrar()
        respuesta_ver._resource_closers.clear()

        respuesta_descargar = self.client.get(ruta, {"descargar": "1"})
        self.assertEqual(respuesta_descargar.status_code, status.HTTP_200_OK)
        self.assertIn("attachment", respuesta_descargar["Content-Disposition"])
        self.assertIn("informe medico.pdf", respuesta_descargar["Content-Disposition"])
        for cerrar in respuesta_descargar._resource_closers:
            cerrar()
        respuesta_descargar._resource_closers.clear()

    def test_no_expone_archivo_ajeno_ni_documento_sin_adjunto(self):
        ajeno = self.crear_documento(
            paciente=self.otro_paciente,
            archivo=SimpleUploadedFile("ajeno.pdf", b"%PDF-ajeno", content_type="application/pdf"),
        )
        sin_archivo = self.crear_documento()

        respuesta_ajeno = self.client.get(
            reverse(
                "documentos:paciente-documento-archivo",
                kwargs={"documento_id": ajeno.id},
            )
        )
        respuesta_sin_archivo = self.client.get(
            reverse(
                "documentos:paciente-documento-archivo",
                kwargs={"documento_id": sin_archivo.id},
            )
        )

        self.assertEqual(respuesta_ajeno.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(respuesta_sin_archivo.status_code, status.HTTP_404_NOT_FOUND)

    def test_archivo_requiere_autenticacion(self):
        documento = self.crear_documento(
            archivo=SimpleUploadedFile(
                "privado.pdf",
                b"%PDF-privado",
                content_type="application/pdf",
            )
        )
        self.client.credentials()

        respuesta = self.client.get(
            reverse(
                "documentos:paciente-documento-archivo",
                kwargs={"documento_id": documento.id},
            )
        )

        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_paciente_no_puede_publicar_documento_desde_el_viewset_general(self):
        documento = self.crear_documento(estado=DocumentoPaciente.Estado.PENDIENTE)

        respuesta = self.client.patch(
            reverse("documentos:documento-paciente-detail", kwargs={"pk": documento.id}),
            {"estado": DocumentoPaciente.Estado.DISPONIBLE},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_403_FORBIDDEN)
        documento.refresh_from_db()
        self.assertEqual(documento.estado, DocumentoPaciente.Estado.PENDIENTE)

    def test_medico_asignado_puede_abrir_documento_pendiente_del_paciente(self):
        medico = Usuario.objects.create_user(
            username="medico-documentos",
            email="medico-documentos@hemoruta.local",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.MEDICO,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        AsignacionMedica.objects.create(paciente=self.paciente, medico=medico)
        token = Token.objects.create(user=medico)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.key}")
        documento = self.crear_documento(
            estado=DocumentoPaciente.Estado.PENDIENTE,
            archivo=SimpleUploadedFile(
                "resultado-paciente.pdf",
                b"%PDF-resultado",
                content_type="application/pdf",
            ),
        )

        respuesta = self.client.get(
            reverse(
                "documentos:medico-documento-archivo",
                kwargs={"documento_id": documento.id},
            )
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertIn("inline", respuesta["Content-Disposition"])
        for cerrar in respuesta._resource_closers:
            cerrar()
        respuesta._resource_closers.clear()

    def test_medico_del_hospital_puede_listar_documentos_sin_asignacion_individual(self):
        medico = Usuario.objects.create_user(
            username="medico-lista-documentos",
            password="ClaveSegura-2026",
            rol=Usuario.Rol.MEDICO,
            estado=Usuario.Estado.ACTIVO,
            is_active=True,
        )
        token = Token.objects.create(user=medico)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.key}")
        documento = self.crear_documento(estado=DocumentoPaciente.Estado.PENDIENTE)

        respuesta = self.client.get(
            reverse(
                "documentos:medico-documentos-paciente",
                kwargs={"paciente_id": self.paciente.id},
            )
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["paginacion"]["total"], 1)
        self.assertEqual(respuesta.data["resultados"][0]["id"], str(documento.id))
