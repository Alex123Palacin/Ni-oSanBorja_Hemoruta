from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class EstadoServicioAPITests(APITestCase):
    def test_informa_que_el_servicio_esta_disponible(self):
        respuesta = self.client.get(reverse("nucleo:estado-servicio"))

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["estado"], "disponible")
