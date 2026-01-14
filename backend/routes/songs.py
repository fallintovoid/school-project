from fastapi import APIRouter, Depends
from utils.auth import get_current_user
from models.user import User
from database import db_dependency
from models.song import Song
from pydantic import BaseModel

router = APIRouter()

class SongCreate(BaseModel):
    title: str
    genre: str
    author: str
    playlist_id: int

class SongResponse(BaseModel):
    id: int
    title: str
    genre: str
    author: str
    created_at: int | None = None
    playlist_id: int
    votes: int = 0

    class Config:
        from_attributes = True

@router.post("/songs", response_model=SongResponse)
def create_song(create_song: SongCreate, db: db_dependency, _: User = Depends(get_current_user)):
    try:
        db_song = Song(
            title=create_song.title, 
            genre=create_song.genre, 
            author=create_song.author, 
            playlist_id=create_song.playlist_id,
        )
        db.add(db_song)
        db.commit()
        db.refresh(db_song)
        return db_song
    except Exception as e:
        db.rollback()
        print(f"Full error: {e}")
        raise