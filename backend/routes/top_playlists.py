from pydantic import BaseModel
from utils.types import SongResponse
from utils.auth import get_current_user
from models.user import User
from fastapi import APIRouter, Depends
from services.top_playlist import top_playlist_service_dependency

router = APIRouter()

class TopPlaylistCreate(BaseModel):
    name: str
    origin_playlist_id: int

class TopPlaylistResponse(BaseModel):
    id: int
    name: str
    songs: list[SongResponse] = []

    class Config:
        from_attributes = True

@router.get("/top-playlists")
def get_top_playlists(service: top_playlist_service_dependency, _: User = Depends(get_current_user)):
    return service.get_top_playlists()

@router.get("/top-playlists/{playlist_id}", response_model=TopPlaylistResponse)
def get_top_playlist(playlist_id: int, service: top_playlist_service_dependency, _: User = Depends(get_current_user)):
    return service.get_top_playlist(playlist_id)

@router.post("/top-playlists")
def create_top_playlist(create_top_playlist: TopPlaylistCreate, service: top_playlist_service_dependency, _: User = Depends(get_current_user)):
    return service.create_top_playlist(create_top_playlist.name, create_top_playlist.origin_playlist_id)

@router.delete("/top-playlists/{playlist_id}")
def delete_top_playlist(playlist_id: int, service: top_playlist_service_dependency, _: User = Depends(get_current_user)):
    return service.delete_top_playlist(playlist_id)