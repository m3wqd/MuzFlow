from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


track_tags = Table(
    "track_tags",
    Base.metadata,
    Column(
        "track_id",
        ForeignKey("tracks.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Track(Base):
    __tablename__ = "tracks"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(String(500))
    artist: Mapped[str | None] = mapped_column(String(500))
    album: Mapped[str | None] = mapped_column(String(500))
    album_artist: Mapped[str | None] = mapped_column(String(500))
    genre: Mapped[str | None] = mapped_column(String(200))
    year: Mapped[int | None]
    duration: Mapped[float | None]

    file_path: Mapped[str] = mapped_column(String(1000), unique=True)
    cover_path: Mapped[str | None] = mapped_column(String(1000))

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )

    tags: Mapped[list["Tag"]] = relationship(
        secondary=track_tags,
        back_populates="tracks",
    )


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
    )

    tracks: Mapped[list[Track]] = relationship(
        secondary=track_tags,
        back_populates="tags",
    )