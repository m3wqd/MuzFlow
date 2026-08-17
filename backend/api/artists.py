from fastapi import APIRouter, Depends
from sqlalchemy import distinct
from sqlalchemy.orm import Session

from database import get_db
from models import Track


router = APIRouter(
    prefix="/api/artists",
    tags=["Artists"],
)


@router.get("/")
def get_artists(
    db: Session = Depends(get_db),
):
    artists = (
        db.query(distinct(Track.artist))
        .filter(
            Track.artist.isnot(None)
        )
        .order_by(
            Track.artist
        )
        .all()
    )

    return [
        artist[0]
        for artist in artists
    ]