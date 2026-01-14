from fastapi import APIRouter, Depends
from pydantic import BaseModel
from models.user import User
from utils.auth import get_current_user
from services.playlist import playlist_service_dependency

router = APIRouter()

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

class PlaylistResponse(BaseModel):
    id: int
    name: str
    songs: list[SongResponse] = []

    class Config:
        from_attributes = True

class PlaylistCreate(BaseModel):
    name: str

@router.get("/playlists")
async def get_playlists(playlist_service: playlist_service_dependency, _: User = Depends(get_current_user)):
    return playlist_service.get_all_playlists()

@router.post("/playlists")
async def create_playlist(playlist: PlaylistCreate, playlist_service: playlist_service_dependency, _: User = Depends(get_current_user)):
    return playlist_service.create_playlist(playlist.name)

@router.get("/playlists/{playlist_id}", response_model=PlaylistResponse)
async def get_playlist(playlist_id: int, playlist_service: playlist_service_dependency, _: User = Depends(get_current_user)):
    return playlist_service.get_playlist_by_id(playlist_id)

@router.post("/playlists/vote")
async def vote(song_id: int, playlist_service: playlist_service_dependency, user: User = Depends(get_current_user)):
    return playlist_service.vote_song(song_id, user.id)