from django.core.paginator import Paginator
from rest_framework.response import Response


def paginar_resultados(request, queryset, transformar, *, tamano_predeterminado=20, tamano_maximo=100):
    try:
        pagina = max(1, int(request.query_params.get("pagina", 1)))
    except (TypeError, ValueError):
        pagina = 1
    try:
        tamano = int(request.query_params.get("tamanoPagina", tamano_predeterminado))
    except (TypeError, ValueError):
        tamano = tamano_predeterminado
    tamano = min(tamano_maximo, max(1, tamano))

    paginador = Paginator(queryset, tamano)
    pagina_objeto = paginador.get_page(pagina)
    return Response(
        {
            "paginacion": {
                "pagina": pagina_objeto.number,
                "paginasTotales": paginador.num_pages,
                "tamanoPagina": tamano,
                "total": paginador.count,
            },
            "resultados": [transformar(objeto) for objeto in pagina_objeto.object_list],
        }
    )

