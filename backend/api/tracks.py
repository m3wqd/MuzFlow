from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Track

router = APIRouter(
    prefix="/api/tracks",
    tags=["Tracks"],
)


@router.get("/")
def get_tracks(db: Session = Depends(get_db)):
    tracks = db.query(Track).all()

    return tracks