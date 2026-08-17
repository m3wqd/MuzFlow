import { useEffect, useRef, useState } from "react";

interface Track {
  id: number;
  title: string;
  artist: string | null;
  album: string | null;
  cover_path: string | null;
  duration: number | null;
}

interface PlayerProps {
  track: Track | null;
  onNext?: () => void;
  onPrevious?: () => void;
}

const API_URL = "http://localhost:8000";

function Player({
  track,
  onNext,
  onPrevious,
}: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!audioRef.current || !track) {
      return;
    }

    audioRef.current.src =
      `${API_URL}/api/tracks/${track.id}/stream`;

    audioRef.current.load();

    audioRef.current
      .play()
      .then(() => {
        setPlaying(true);
      })
      .catch(() => {
        setPlaying(false);
      });
  }, [track]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.volume = volume;
  }, [volume]);

  function togglePlay() {
    if (!audioRef.current || !track) {
      return;
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setPlaying(true);
        })
        .catch(console.error);
    }
  }

  function handleTimeUpdate() {
    if (!audioRef.current) {
      return;
    }

    setCurrentTime(
      audioRef.current.currentTime
    );
  }

  function handleSeek(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!audioRef.current) {
      return;
    }

    const time = Number(event.target.value);

    audioRef.current.currentTime = time;

    setCurrentTime(time);
  }

  function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${minutes}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  if (!track) {
    return (
      <div className="player empty-player">
        <span>
          Выберите трек
        </span>
      </div>
    );
  }

  return (
    <div className="player">

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onNext}
      />


      <div className="player-track">

        <div className="player-cover">

          {track.cover_path ? (
            <img
              src={`${API_URL}${track.cover_path}`}
              alt=""
            />
          ) : (
            <span>♪</span>
          )}

        </div>


        <div className="player-info">

          <div className="player-title">
            {track.title}
          </div>

          <div className="player-artist">
            {track.artist ?? "Unknown Artist"}
          </div>

        </div>

      </div>


      <div className="player-controls">

        <button onClick={onPrevious}>
          ⏮
        </button>

        <button
          className="play-button"
          onClick={togglePlay}
        >
          {playing ? "⏸" : "▶"}
        </button>

        <button onClick={onNext}>
          ⏭
        </button>

      </div>


      <div className="player-progress">

        <span>
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min="0"
          max={track.duration ?? 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
        />

        <span>
          {formatTime(track.duration ?? 0)}
        </span>

      </div>


      <div className="player-volume">

        <span>
          🔊
        </span>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(event) =>
            setVolume(
              Number(event.target.value)
            )
          }
          />

      </div>

    </div>
  );
}

export default Player;