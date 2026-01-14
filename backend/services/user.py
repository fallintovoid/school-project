from typing import Annotated
from fastapi import Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database import db_dependency
from utils.auth import create_access_token

from models.user import User

class UserRegister(BaseModel):
    username: str
    password: str

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__ident="2b")

def get_user_service(db: db_dependency):
    return UserService(db)

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def register_user(self, username: str, password: str):
        if self.db.execute(select(User).where(User.username == username)).scalar():
            raise HTTPException(status_code=400, detail="Username taken")
    
        new_user = User(
            username=username,
            password_hash=pwd_context.hash(password)
        )
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return new_user
    
    def login_user(self, password: str, username: str, response: Response):
        user = self.db.execute(select(User).where(User.username == username)).scalar()
        if not user or not pwd_context.verify(password, str(user.password_hash)):
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
    
    def logout_user(self, response: Response):
        response.delete_cookie("access_token")
        return {"message": "Logged out"}
    
user_service_dependency = Annotated[UserService, Depends(get_user_service)]