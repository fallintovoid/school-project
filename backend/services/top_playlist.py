from typing import Annotated
from fastapi import Depends, HTTPException
from sqlalchemy import func
from models.vote import Vote
from models.song import Song
from database import db_dependency
from models.top_playlist import TopPlaylist

def get_top_playlist_service(db: db_dependency):
    return TopPlaylistService(db)

class TopPlaylistService:
    def __init__(self, db: db_dependency):
        self.db = db

    def get_top_playlists(self):
        return self.db.query(TopPlaylist).all()

    def get_top_playlist(self, playlist_id: int):
        top_playlist = self.db.query(TopPlaylist).filter(TopPlaylist.id == playlist_id).first()
        if not top_playlist:
            raise HTTPException(status_code=404, detail="Top playlist not found")

        songs = self.db.query(Song).filter(Song.top_playlist_id == playlist_id).all()
        
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

        return {"id": top_playlist.id, "name": top_playlist.name, "songs": songs_with_votes}
    
    def create_top_playlist(self, name: str, origin_playlist_id: int): 
        existent_top_playlist = self.db.query(TopPlaylist).filter(TopPlaylist.origin_playlist_id == origin_playlist_id).first()
        if existent_top_playlist:
            songs = self.db.query(Song).filter(Song.playlist_id == origin_playlist_id).all()
        
            for song in songs:
                vote_count = self.db.query(func.count(Vote.id)).filter(Vote.song_id == song.id).scalar()
                if vote_count > 0:
                    song.top_playlist_id = existent_top_playlist.id
                    self.db.add(song)

            self.db.commit()

            return existent_top_playlist

        else:
            top_playlist = TopPlaylist(name=name, origin_playlist_id=origin_playlist_id)
            self.db.add(top_playlist)
            self.db.commit()
            self.db.refresh(top_playlist)

            songs = self.db.query(Song).filter(Song.playlist_id == origin_playlist_id).all()
            
            for song in songs:
                vote_count = self.db.query(func.count(Vote.id)).filter(Vote.song_id == song.id).scalar()
                if vote_count > 0:
                    song.top_playlist_id = top_playlist.id
                    self.db.add(song)

            self.db.commit()
            return top_playlist
    
    def delete_top_playlist(self, top_playlist_id: int):
        top_playlist = self.db.query(TopPlaylist).filter(TopPlaylist.id == top_playlist_id).first()
        if not top_playlist:
            raise HTTPException(status_code=404, detail="Top playlist not found")
        self.db.delete(top_playlist)
        self.db.commit()
        return top_playlist
   
top_playlist_service_dependency = Annotated[TopPlaylistService, Depends(get_top_playlist_service)]
