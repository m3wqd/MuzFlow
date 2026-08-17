from contextlib import asynccontextmanager
from pathlib import Path
import mimetypes

from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from database import Base, engine, get_db
import models

from api.tracks import router as tracks_router
from api.artists import router as artists_router
from api.albums import router as albums_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="MuzFlow",
    description="Personal music streaming service",
    version="0.1.0",
    lifespan=lifespan,
)


# API routers
app.include_router(tracks_router)
app.include_router(artists_router)
app.include_router(albums_router)


# Static files
app.mount(
    "/storage",
    StaticFiles(directory="/storage"),
    name="storage",
)


@app.get("/")
def root():
    return {
        "service": "MuzFlow",
        "status": "ok",
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
    }


@app.get("/api/tracks/{track_id}/stream")
def stream_track(
    track_id: int,
    db=Depends(get_db),
):
    track = (
        db.query(models.Track)
        .filter(models.Track.id == track_id)
        .first()
    )

    if not track:
        raise HTTPException(
            status_code=404,
            detail="Track not found",
        )

    file_path = Path(track.file_path)

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Audio file not found",
        )

    media_type = mimetypes.guess_type(
        file_path.name
    )[0]

    if media_type is None:
        media_type = "application/octet-stream"

    return FileResponse(
        file_path,
        media_type=media_type,
        filename=file_path.name,
    )