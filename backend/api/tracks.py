from pathlib import Path
import re
import shutil
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from mutagen import File as MutagenFile
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from models import Track


router = APIRouter(
    prefix="/api/tracks",
    tags=["Tracks"],
)


MUSIC_DIR = Path("/storage/music")
COVERS_DIR = Path("/storage/covers")

MUSIC_DIR.mkdir(parents=True, exist_ok=True)
COVERS_DIR.mkdir(parents=True, exist_ok=True)


def clean_name(value: str | None, fallback: str) -> str:
    if not value:
        value = fallback

    value = value.strip()
    value = re.sub(r'[<>:"/\\|?*]', "_", value)
    value = value.rstrip(". ")

    return value or fallback


def get_first_tag(audio, *names):
    for name in names:
        value = audio.get(name)

        if value:
            if isinstance(value, list):
                return str(value[0]).strip()

            return str(value).strip()

    return None


def extract_cover(audio, cover_path: Path) -> bool:
    if not audio.tags:
        return False

    # MP3 / ID3
    for tag in audio.tags.values():
        if hasattr(tag, "FrameID") and tag.FrameID == "APIC":
            cover_path.write_bytes(tag.data)
            return True

    # FLAC
    pictures = getattr(audio, "pictures", None)

    if pictures:
        cover_path.write_bytes(pictures[0].data)
        return True

    return False


@router.get("/")
def get_tracks(
    db: Session = Depends(get_db),
    artist: str | None = None,
    album: str | None = None,
    genre: str | None = None,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    query = db.query(Track)

    if artist:
        query = query.filter(Track.artist == artist)

    if album:
        query = query.filter(Track.album == album)

    if genre:
        query = query.filter(Track.genre == genre)

    return (
        query
        .order_by(Track.artist, Track.album, Track.title)
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/search")
def search_tracks(
    q: str = Query(min_length=1),
    db: Session = Depends(get_db),
):
    search = f"%{q}%"

    return (
        db.query(Track)
        .filter(
            or_(
                Track.title.ilike(search),
                Track.artist.ilike(search),
                Track.album.ilike(search),
                Track.genre.ilike(search),
            )
        )
        .order_by(Track.artist, Track.album, Track.title)
        .limit(100)
        .all()
    )


@router.get("/{track_id}")
def get_track(
    track_id: int,
    db: Session = Depends(get_db),
):
    track = db.query(Track).filter(Track.id == track_id).first()

    if not track:
        raise HTTPException(
            status_code=404,
            detail="Track not found",
        )

    return track


@router.post("/upload")
async def upload_track(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is missing",
        )

    extension = Path(file.filename).suffix.lower()

    allowed_extensions = {
        ".mp3",
        ".flac",
        ".wav",
        ".ogg",
        ".m4a",
        ".aac",
    }

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: {extension}",
        )

    temp_dir = Path("/storage/.tmp")
    temp_dir.mkdir(parents=True, exist_ok=True)

    temp_path = temp_dir / f"{uuid.uuid4()}{extension}"

    with temp_path.open("wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            buffer.write(chunk)

    audio = MutagenFile(temp_path, easy=True)

    if audio is None:
        temp_path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=400,
            detail="Could not read audio metadata",
        )

    title = get_first_tag(audio, "title")

    if not title:
        title = Path(file.filename).stem

    artist = get_first_tag(
        audio,
        "artist",
        "albumartist",
    )

    album = get_first_tag(audio, "album")

    album_artist = get_first_tag(
        audio,
        "albumartist",
        "artist",
    )

    genre = get_first_tag(audio, "genre")

    date = get_first_tag(
        audio,
        "date",
        "year",
    )

    year = None

    if date:
        match = re.search(r"\d{4}", date)

        if match:
            year = int(match.group())

    artist = clean_name(
        artist,
        "Unknown Artist",
    )

    album = clean_name(
        album,
        "Unknown Album",
    )

    title = clean_name(
        title,
        Path(file.filename).stem,
    )

    album_artist = clean_name(
        album_artist,
        artist,
    )

    artist_dir = MUSIC_DIR / artist
    album_dir = artist_dir / album

    artist_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    album_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    final_filename = f"{title}{extension}"
    final_path = album_dir / final_filename

    if final_path.exists():
        final_filename = (
            f"{title} [{uuid.uuid4().hex[:8]}]{extension}"
        )

        final_path = album_dir / final_filename

    shutil.move(
        str(temp_path),
        str(final_path),
    )

    original_audio = MutagenFile(
        final_path,
        easy=False,
    )

    cover_path = None

    if original_audio is not None:
        cover_filename = f"{uuid.uuid4()}.jpg"
        possible_cover_path = COVERS_DIR / cover_filename

        if extract_cover(
            original_audio,
            possible_cover_path,
        ):
            cover_path = str(possible_cover_path)

    duration = None

    if original_audio is not None:
        try:
            duration = original_audio.info.length
        except (AttributeError, TypeError):
            duration = None

    track = Track(
        title=title,
        artist=artist,
        album=album,
        album_artist=album_artist,
        genre=genre,
        year=year,
        duration=duration,
        file_path=str(final_path),
        cover_path=cover_path,
    )

    db.add(track)
    db.commit()
    db.refresh(track)

    return track