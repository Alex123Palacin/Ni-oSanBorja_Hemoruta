from django.test import SimpleTestCase

from seguimiento.serializers import ReporteSintomasSerializer


class ReporteSintomasSerializerTests(SimpleTestCase):
    def test_requiere_sintomas(self):
        serializer = ReporteSintomasSerializer(data={"sintomas": []})

        self.assertFalse(serializer.is_valid())
        self.assertIn("sintomas", serializer.errors)

