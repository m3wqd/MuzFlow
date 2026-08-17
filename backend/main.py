from contextlib import asynccontextmanager
from api.tracks import router as tracks_router

from fastapi import FastAPI

from database import Base, engine
import models


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="MuzFlow",
    description="Персональная хуйня для музыки",
    version="0.1.0",
    lifespan=lifespan,
)
app.include_router(tracks_router)

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