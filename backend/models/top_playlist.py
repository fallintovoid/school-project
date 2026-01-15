from database import Base
from sqlalchemy import Column, Integer, String

class TopPlaylist(Base):
    __tablename__ = "top_playlists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)