from time import time
from database import Base
from sqlalchemy import Column, DateTime, Integer, ForeignKey
from sqlalchemy.sql import func

class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    song_id = Column(Integer, ForeignKey("songs.id"))
    created_at = Column(Integer, default=lambda: int(time()))