from ninja import Schema
from ninja_jwt.schema import TokenObtainPairOutputSchema
from ninja_jwt.tokens import RefreshToken
from ninja_extra import Router
from django.contrib.auth import authenticate
from ninja.errors import HttpError
from ninja_jwt.authentication import JWTAuth
from django.http import HttpRequest

auth_router = Router()

class LoginSchema(Schema):
    email: str
    password: str

class UserSchema(Schema):
    email: str

@auth_router.post("/token", response=TokenObtainPairOutputSchema)
def get_token(request, data: LoginSchema):
    """
    Obtient une paire de tokens JWT (access et refresh) à partir de l'email et du mot de passe.
    """
    user = authenticate(request, email=data.email, password=data.password)
    if user is None:
        raise HttpError(401, "Identifiants invalides")
    
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "email": user.email,
    }

@auth_router.get("/me", response=UserSchema, auth=JWTAuth())
def get_me(request: HttpRequest):
    """
    Retourne les informations de l'utilisateur actuellement authentifié via son token JWT.
    """
    return request.user
