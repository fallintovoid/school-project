from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from models.user import User
from utils.auth import get_current_user
from passlib.context import CryptContext
from services.user import user_service_dependency, UserRegister

router = APIRouter()

class UserOut(BaseModel):
    id: int
    username: str
    class Config: from_attributes = True

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__ident="2b")

@router.post("/auth/register", response_model=UserOut)
def register(user_in: UserRegister, user_service: user_service_dependency):
   return user_service.register_user(user_in.username, user_in.password)

@router.post("/auth/login")
def login(response: Response, user_service: user_service_dependency, form_data: OAuth2PasswordRequestForm = Depends()):
    return user_service.login_user(form_data.password, form_data.username, response)

@router.post("/auth/logout")
def logout(response: Response, user_service: user_service_dependency):
    return user_service.logout_user(response)

@router.get("/auth/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    return user