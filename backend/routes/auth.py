from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import select
from models.user import User
from utils.auth import create_access_token, get_current_user
from database import db_dependency
from passlib.context import CryptContext

router = APIRouter()

class UserRegister(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    class Config: from_attributes = True

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__ident="2b")

@router.post("/auth/register", response_model=UserOut)
def register(user_in: UserRegister, db: db_dependency):
    if db.execute(select(User).where(User.username == user_in.username)).scalar():
        raise HTTPException(status_code=400, detail="Username taken")
    
    new_user = User(
        username=user_in.username,
        password_hash=pwd_context.hash(user_in.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/auth/login")
def login(response: Response, db: db_dependency, form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.execute(select(User).where(User.username == form_data.username)).scalar()
    if not user or not pwd_context.verify(form_data.password, str(user.password_hash)):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user.username})
    response.set_cookie(
        key="access_token", 
        value=f"Bearer {token}", 
        httponly=True,
        samesite="lax",
        secure=False
    )
    return {"message": "Logged in"}

@router.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}

@router.get("/auth/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    return user