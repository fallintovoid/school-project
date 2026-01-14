from fastapi import APIRouter, Depends
from pydantic import BaseModel
from models.user import User
from utils.auth import get_current_user
from models.vote import Vote
from database import db_dependency
from models.playlist import Playlist
from models.song import Song
from sqlalchemy import func

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
async def get_playlists(db: db_dependency, _: User = Depends(get_current_user)):
    playlists = db.query(Playlist).all()
    return playlists

@router.post("/playlists")
async def create_playlist(playlist: PlaylistCreate, db: db_dependency, _: User = Depends(get_current_user)):
    db_playlist = Playlist(name=playlist.name)
    db.add(db_playlist)
    db.commit()
    db.refresh(db_playlist)
    return db_playlist

@router.get("/playlists/{playlist_id}", response_model=PlaylistResponse)
async def get_playlist(playlist_id: int, db: db_dependency, _: User = Depends(get_current_user)):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if playlist:
        songs = db.query(Song).filter(Song.playlist_id == playlist_id).all()
        
        # Add votes count to each song
        songs_with_votes = []
        for song in songs:
            vote_count = db.query(func.count(Vote.id)).filter(Vote.song_id == song.id).scalar()
            song_dict = {
                "id": song.id,
                "title": song.title,
                "genre": song.genre,
                "author": song.author,
                "created_at": song.created_at,
                "playlist_id": song.playlist_id,
                "votes": vote_count or 0
            }
            songs_with_votes.append(song_dict)
        
        return {"id": playlist.id, "name": playlist.name, "songs": songs_with_votes}
    return None

@router.post("/playlists/vote")
async def vote(song_id: int, db: db_dependency, user: User = Depends(get_current_user)):
    vote = Vote(song_id=song_id, user_id=user.id)
    db.add(vote)
    db.commit()
    db.refresh(vote)
    return vote