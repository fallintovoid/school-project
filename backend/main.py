from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth
from database import engine
from dotenv import load_dotenv

from routes import playlists, songs

import models.playlist
import models.song
import models.user
import models.vote

load_dotenv()

app = FastAPI(title="School Project API")
models.user.Base.metadata.create_all(bind=engine)
models.song.Base.metadata.create_all(bind=engine)
models.playlist.Base.metadata.create_all(bind=engine)
models.vote.Base.metadata.create_all(bind=engine)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(playlists.router)
app.include_router(songs.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Welcome to School Project API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
