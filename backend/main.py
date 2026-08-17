from contextlib import asynccontextmanager

from fastapi import FastAPI

from database import Base, engine
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
    description="Персональный стриминг сервис",
    version="0.1.0",
    lifespan=lifespan,
)


app.include_router(tracks_router)
app.include_router(artists_router)
app.include_router(albums_router)


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