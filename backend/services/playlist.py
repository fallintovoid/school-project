from typing import Annotated
from fastapi import Depends, HTTPException
from database import db_dependency
from models.playlist import Playlist
from models.song import Song
from models.vote import Vote
from sqlalchemy import func, Column

def get_playlist_service(db: db_dependency):
    return PlaylistService(db)

class PlaylistService:
    def __init__(self, db: db_dependency):
        self.db = db

    def get_all_playlists(self):
        """Get all playlists"""
        return self.db.query(Playlist).all()

    def create_playlist(self, name: str):
        """Create a new playlist"""
        db_playlist = Playlist(name=name)
        self.db.add(db_playlist)
        self.db.commit()
        self.db.refresh(db_playlist)
        return db_playlist
    
    def delete_playlist(self, playlist_id: int):
        """Delete a playlist"""
        playlist = self.db.query(Playlist).filter(Playlist.id == playlist_id).first()
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        self.db.delete(playlist)
        self.db.commit()
        return playlist

    def get_playlist_by_id(self, playlist_id: int):
        """Get a playlist by ID with songs and their vote counts"""
        playlist = self.db.query(Playlist).filter(Playlist.id == playlist_id).first()
        if not playlist:
            raise HTTPException(status_code=404, detail="Top playlist not found")
        
        songs = self.db.query(Song).filter(Song.playlist_id == playlist_id).all()
        
        songs_with_votes = []
        for song in songs:
            vote_count = self.db.query(func.count(Vote.id)).filter(Vote.song_id == song.id).scalar()
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

    def vote_song(self, song_id: int, user_id: Column[int]):
        """Create a vote for a song"""
        vote = Vote(song_id=song_id, user_id=user_id)
        self.db.add(vote)
        self.db.commit()
        self.db.refresh(vote)
        return vote
    
    def unvote_song(self, song_id: int, user_id: Column[int]):
        vote = self.db.query(Vote).filter(Vote.song_id == song_id, Vote.user_id == user_id).first()
        if not vote:
            raise HTTPException(status_code=404, detail="Vote not found")
        self.db.delete(vote)
        self.db.commit()
        return vote

playlist_service_dependency = Annotated[PlaylistService, Depends(get_playlist_service)]