from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Tag, Track


router = APIRouter(
    prefix="/api/tags",
    tags=["Tags"],
)


# =========================================================
# GET ALL TAGS
# =========================================================

@router.get("/")
def get_tags(
    db: Session = Depends(get_db),
):
    return (
        db.query(Tag)
        .order_by(Tag.name)
        .all()
    )


# =========================================================
# CREATE TAG
# =========================================================

@router.post("/")
def create_tag(
    name: str,
    db: Session = Depends(get_db),
):

    name = name.strip()


    if not name:
        raise HTTPException(
            status_code=400,
            detail="Tag name cannot be empty",
        )


    existing = (
        db.query(Tag)
        .filter(
            Tag.name == name
        )
        .first()
    )


    if existing:
        return existing


    tag = Tag(
        name=name
    )


    db.add(tag)

    db.commit()

    db.refresh(tag)


    return tag


# =========================================================
# DELETE TAG
# =========================================================

@router.delete("/{tag_id}")
def delete_tag(
    tag_id: int,

    db: Session = Depends(get_db),
):

    tag = (
        db.query(Tag)
        .filter(
            Tag.id == tag_id
        )
        .first()
    )


    if not tag:

        raise HTTPException(
            status_code=404,
            detail="Tag not found",
        )


    db.delete(tag)

    db.commit()


    return {
        "status": "ok",
        "message": "Tag deleted",
    }


# =========================================================
# ADD TAG TO TRACK
# =========================================================

@router.post(
    "/track/{track_id}/{tag_id}"
)
def add_tag_to_track(
    track_id: int,
    tag_id: int,

    db: Session = Depends(get_db),
):

    track = (
        db.query(Track)
        .filter(
            Track.id == track_id
        )
        .first()
    )


    if not track:

        raise HTTPException(
            status_code=404,
            detail="Track not found",
        )


    tag = (
        db.query(Tag)
        .filter(
            Tag.id == tag_id
        )
        .first()
    )


    if not tag:

        raise HTTPException(
            status_code=404,
            detail="Tag not found",
        )


    if tag not in track.tags:

        track.tags.append(tag)

        db.commit()


    return track


# =========================================================
# REMOVE TAG FROM TRACK
# =========================================================

@router.delete(
    "/track/{track_id}/{tag_id}"
)
def remove_tag_from_track(
    track_id: int,
    tag_id: int,

    db: Session = Depends(get_db),
):

    track = (
        db.query(Track)
        .filter(
            Track.id == track_id
        )
        .first()
    )


    if not track:

        raise HTTPException(
            status_code=404,
            detail="Track not found",
        )


    tag = (
        db.query(Tag)
        .filter(
            Tag.id == tag_id
        )
        .first()
    )


    if not tag:

        raise HTTPException(
            status_code=404,
            detail="Tag not found",
        )


    if tag in track.tags:

        track.tags.remove(tag)

        db.commit()


    return track