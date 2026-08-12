from django.utils.translation import gettext_lazy as _
from rest_framework import exceptions
from rest_framework.authentication import TokenAuthentication, get_authorization_header


class BearerTokenAuthentication(TokenAuthentication):
    """Acepta ``Bearer`` y ``Token`` durante la integración local del frontend."""

    keyword = "Bearer"

    def authenticate(self, request):
        auth = get_authorization_header(request).split()
        if not auth or auth[0].lower() not in {b"bearer", b"token"}:
            return None
        if len(auth) == 1:
            raise exceptions.AuthenticationFailed(
                _("Invalid token header. No credentials provided.")
            )
        if len(auth) > 2:
            raise exceptions.AuthenticationFailed(
                _("Invalid token header. Token string should not contain spaces.")
            )
        try:
            token = auth[1].decode()
        except UnicodeError as error:
            raise exceptions.AuthenticationFailed(
                _("Invalid token header. Token contains invalid characters.")
            ) from error
        return self.authenticate_credentials(token)
