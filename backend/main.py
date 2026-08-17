from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api import (
    tracks,
    tags,
    artists,
    albums,
)


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="MuzFlow API",
    description="Personal music streaming service",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# STORAGE
# =========================================================

STORAGE_DIR = Path("/storage")

MUSIC_DIR = STORAGE_DIR / "music"

COVERS_DIR = STORAGE_DIR / "covers"


MUSIC_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

COVERS_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# =========================================================
# STATIC FILES
# =========================================================

app.mount(
    "/storage/music",
    StaticFiles(
        directory=str(MUSIC_DIR)
    ),
    name="music",
)


app.mount(
    "/storage/covers",
    StaticFiles(
        directory=str(COVERS_DIR)
    ),
    name="covers",
)


# =========================================================
# API ROUTERS
# =========================================================

app.include_router(
    tracks.router
)

app.include_router(
    tags.router
)

app.include_router(
    artists.router
)

app.include_router(
    albums.router
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "service": "MuzFlow",
        "status": "online",
        "version": "1.0.0",
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "ok"
    }