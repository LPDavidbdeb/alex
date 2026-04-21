from ninja import Schema

class LoginSchema(Schema):
    email: str
    password: str

class SignUpSchema(Schema):
    email: str
    password: str

class UserSchema(Schema):
    email: str
