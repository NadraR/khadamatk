from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token):
    try:
        # تحقق من صلاحية التوكن
        UntypedToken(token)
        from rest_framework_simplejwt.authentication import JWTAuthentication
        validated = JWTAuthentication().get_validated_token(token)
        user = JWTAuthentication().get_user(validated)
        return user
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        return JWTAuthMiddlewareInstance(scope, self)

class JWTAuthMiddlewareInstance:
    def __init__(self, scope, middleware):
        self.scope = scope
        self.middleware = middleware

    async def __call__(self, receive, send):
        query_string = self.scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token = params.get("token", [None])[0]

        if token:
            self.scope["user"] = await get_user_from_token(token)
        else:
            self.scope["user"] = AnonymousUser()

        inner = self.middleware.inner(self.scope)
        return await inner(receive, send)

def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
