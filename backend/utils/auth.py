from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Request
from jose import JWTError, jwt
from sqlalchemy import select
from models.user import User
from utils.env import SECRET_KEY
from database import db_dependency

ACCESS_TOKEN_EXPIRE_MINUTES = 60
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(request: Request, db: db_dependency):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        scheme, _, param = token.partition(" ")
        actual_token = param if scheme.lower() == "bearer" else token
        
        payload = jwt.decode(actual_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = str(payload.get("sub"))
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
            
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    user = db.execute(select(User).where(User.username == username)).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
        
    return user