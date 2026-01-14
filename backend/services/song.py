from typing import Annotated
from fastapi import Depends
from database import db_dependency
from models.song import Song

def get_song_service(db: db_dependency):
    return SongService(db)

class SongService:
    def __init__(self, db: db_dependency):
        self.db = db

    def create_song(self, title: str, genre: str, author: str, playlist_id: int):
        """Create a new song"""
        try:
            db_song = Song(
                title=title,
                genre=genre,
                author=author,
                playlist_id=playlist_id,
            )
            self.db.add(db_song)
            self.db.commit()
            self.db.refresh(db_song)
            return db_song
        except Exception as e:
            self.db.rollback()
            print(f"Full error: {e}")
            raise

song_service_dependency = Annotated[SongService, Depends(get_song_service)]
