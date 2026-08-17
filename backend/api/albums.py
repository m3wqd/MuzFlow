from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Track


router = APIRouter(
    prefix="/api/albums",
    tags=["Albums"],
)


@router.get("/")
def get_albums(db: Session = Depends(get_db)):
    tracks = (
        db.query(Track)
        .order_by(
            Track.artist,
            Track.album,
            Track.title,
        )
        .all()
    )

    albums = {}

    for track in tracks:
        key = (
            track.artist,
            track.album,
        )

        if key not in albums:
            albums[key] = {
                "artist": track.artist,
                "album": track.album,
                "year": track.year,
                "cover_path": track.cover_path,
                "tracks": 0,
            }

        albums[key]["tracks"] += 1

    return list(albums.values())