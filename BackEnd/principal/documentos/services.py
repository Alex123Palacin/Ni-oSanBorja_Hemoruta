from seguimiento.models import EventoSeguimiento


def registrar_evento_documento(documento) -> EventoSeguimiento:
    """Registra una sola vez la carga para la bandeja de seguimiento."""
    evento, _ = EventoSeguimiento.objects.get_or_create(
        documento=documento,
        defaults={
            "paciente": documento.paciente,
            "tipo": EventoSeguimiento.Tipo.DOCUMENTO,
            "origen": EventoSeguimiento.Origen.APP,
            "estado": EventoSeguimiento.Estado.RECIBIDO,
            "resumen": f"{documento.titulo} subido",
            "detalle": documento.descripcion,
            "ocurrido_en": documento.creado_en,
            "registrado_por": documento.subido_por,
        },
    )
    return evento
