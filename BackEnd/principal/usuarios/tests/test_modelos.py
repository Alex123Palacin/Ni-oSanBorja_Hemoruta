from django.test import TestCase

from usuarios.models import Usuario


class UsuarioModeloTests(TestCase):
    def test_superusuario_tiene_rol_y_estado_administrativo(self):
        usuario = Usuario.objects.create_superuser(
            username="administrador",
            email="administrador@hemoruta.local",
            password="ClaveSegura-2026",
        )

        self.assertEqual(usuario.rol, Usuario.Rol.ADMINISTRADOR)
        self.assertEqual(usuario.estado, Usuario.Estado.ACTIVO)
        self.assertTrue(usuario.is_active)
        self.assertFalse(usuario.requiere_cambio_password)
