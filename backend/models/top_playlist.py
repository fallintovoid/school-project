from database import Base
from sqlalchemy import Column, Integer, String, ForeignKey

class TopPlaylist(Base):
    __tablename__ = "top_playlists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    origin_playlist_id = Column(Integer, ForeignKey("top_playlists.id", ondelete="SET NULL"))