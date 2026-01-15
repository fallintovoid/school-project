from pydantic import BaseModel

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