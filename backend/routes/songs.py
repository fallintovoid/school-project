from fastapi import APIRouter, Depends
from utils.auth import get_current_user
from models.user import User
from pydantic import BaseModel
from services.song import song_service_dependency

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
def create_song(create_song: SongCreate, song_service: song_service_dependency, _: User = Depends(get_current_user)):
    return song_service.create_song(
        title=create_song.title,
        genre=create_song.genre,
        author=create_song.author,
        playlist_id=create_song.playlist_id
    )