from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class PaginacionHemoRuta(PageNumberPagination):
    """Contrato de paginacion compartido por los tres modulos del frontend."""

    page_query_param = "pagina"
    page_size = 20
    page_size_query_param = "tamanoPagina"
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response(
            {
                "paginacion": {
                    "pagina": self.page.number,
                    "paginasTotales": self.page.paginator.num_pages,
                    "tamanoPagina": self.get_page_size(self.request),
                    "total": self.page.paginator.count,
                },
                "resultados": data,
            }
        )
