from fastapi import APIRouter, Depends
from pydantic import BaseModel
from utils.types import SongResponse
from models.user import User
from utils.auth import get_current_user
from services.playlist import playlist_service_dependency

router = APIRouter()

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

@router.delete("/playlists/{playlist_id}")
async def delete_playlist(playlist_id: int, playlist_service: playlist_service_dependency, _: User = Depends(get_current_user)):
    return playlist_service.delete_playlist(playlist_id)

@router.post("/playlists/vote/{song_id}")
async def vote(song_id: int, playlist_service: playlist_service_dependency, user: User = Depends(get_current_user)):
    return playlist_service.vote_song(song_id, user.id)

@router.delete("/playlists/vote/{song_id}")
async def unvote(song_id: int, playlist_service: playlist_service_dependency, user: User = Depends(get_current_user)):
    return playlist_service.unvote_song(song_id, user.id)