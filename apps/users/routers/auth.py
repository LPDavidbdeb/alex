from ninja_jwt.schema import TokenObtainPairOutputSchema
from ninja_jwt.tokens import RefreshToken
from ninja_extra import Router
from django.contrib.auth import authenticate
from ninja.errors import HttpError
from ninja_jwt.authentication import JWTAuth
from django.http import HttpRequest

from apps.users.models.user import User
from apps.users.schemas.auth import LoginSchema, SignUpSchema, UserSchema

auth_router = Router()

@auth_router.post("/signup", response=TokenObtainPairOutputSchema)
def signup(request, data: SignUpSchema):
    if User.objects.filter(email=data.email).exists():
        raise HttpError(400, "Un utilisateur avec cet email existe déjà")
    user = User.objects.create_user(email=data.email, password=data.password)
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh), 
        "access": str(refresh.access_token),
        "email": user.email
    }

@auth_router.post("/token", response=TokenObtainPairOutputSchema)
def get_token(request, data: LoginSchema):
    user = authenticate(request, email=data.email, password=data.password)
    if user is None:
        raise HttpError(401, "Identifiants invalides")
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh), 
        "access": str(refresh.access_token),
        "email": user.email
    }

@auth_router.get("/me", response=UserSchema, auth=JWTAuth())
def get_me(request: HttpRequest):
    return request.user
