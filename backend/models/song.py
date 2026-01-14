from database import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from time import time

class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    genre = Column(String, index=True)
    author = Column(String, index=True)
    created_at = Column(Integer, default=lambda: int(time()))
    playlist_id = Column(Integer,ForeignKey("playlists.id"))