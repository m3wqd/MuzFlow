import {
  useEffect,
  useRef,
  useState,
} from "react";

import "./Player.css";


const API_URL =
  "http://localhost:8000";


interface Track {
  id: number;
  title: string;
  artist: string | null;
  album: string | null;
  cover_path: string | null;
}


interface PlayerProps {
  track: Track | null;
  onNext: () => void;
  onPrevious: () => void;
}


export default function Player({
  track,
  onNext,
  onPrevious,
}: PlayerProps) {

  const audioRef =
    useRef<HTMLAudioElement>(null);


  const [isPlaying, setIsPlaying] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [volume, setVolume] =
    useState(1);


  // =========================
  // TRACK CHANGE
  // =========================

  useEffect(() => {

    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }


    if (!track) {

      audio.pause();

      audio.removeAttribute(
        "src"
      );

      audio.load();

      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      return;
    }


    const url =
      `${API_URL}/api/tracks/${track.id}/stream`;


    audio.src = url;

    audio.load();

    setCurrentTime(0);
    setDuration(0);


    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((error) => {

        console.error(
          "Cannot play audio:",
          error
        );

        setIsPlaying(false);

      });

  }, [track]);


  // =========================
  // AUDIO EVENTS
  // =========================

  useEffect(() => {

    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }


    const timeUpdate =
      () => {
        setCurrentTime(
          audio.currentTime
        );
      };


    const loadedMetadata =
      () => {
        setDuration(
          audio.duration || 0
        );
      };


    const ended =
      () => {

        setIsPlaying(false);

        setCurrentTime(0);

        onNext();

      };


    audio.addEventListener(
      "timeupdate",
      timeUpdate
    );

    audio.addEventListener(
      "loadedmetadata",
      loadedMetadata
    );

    audio.addEventListener(
      "ended",
      ended
    );


    return () => {

      audio.removeEventListener(
        "timeupdate",
        timeUpdate
      );

      audio.removeEventListener(
        "loadedmetadata",
        loadedMetadata
      );

      audio.removeEventListener(
        "ended",
        ended
      );

    };

  }, [onNext]);


  // =========================
  // PLAY / PAUSE
  // =========================

  function togglePlay() {

    const audio =
      audioRef.current;


    if (!audio || !track) {
      return;
    }


    if (audio.paused) {

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(console.error);

    } else {

      audio.pause();

      setIsPlaying(false);

    }

  }


  // =========================
  // SEEK
  // =========================

  function seek(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const value =
      Number(event.target.value);


    const audio =
      audioRef.current;


    if (!audio) {
      return;
    }


    audio.currentTime =
      value;

    setCurrentTime(value);

  }


  // =========================
  // VOLUME
  // =========================

  function changeVolume(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const value =
      Number(event.target.value);


    const audio =
      audioRef.current;


    if (!audio) {
      return;
    }


    audio.volume =
      value;

    setVolume(value);

  }


  // =========================
  // TIME
  // =========================

  function formatTime(
    value: number
  ) {

    if (
      !Number.isFinite(value)
    ) {
      return "0:00";
    }


    const minutes =
      Math.floor(
        value / 60
      );


    const seconds =
      Math.floor(
        value % 60
      );


    return (
      `${minutes}:` +
      `${seconds
        .toString()
        .padStart(2, "0")}`
    );

  }


  // =========================
  // EMPTY
  // =========================

  if (!track) {

    return (
      <div className="player player-empty">

        <audio
          ref={audioRef}
        />

        <span>
          Выберите трек
        </span>

      </div>
    );

  }


  // =========================
  // PLAYER
  // =========================

  return (

    <div className="player">

      <audio
        ref={audioRef}
        preload="metadata"
      />


      {/* TRACK */}

      <div className="player-track">

        <div className="player-cover">

          {track.cover_path ? (

            <img
              src={
                `${API_URL}${track.cover_path}`
              }
              alt={track.title}
            />

          ) : (

            <div className="player-no-cover">
              ♪
            </div>

          )}

        </div>


        <div className="player-info">

          <div className="player-title">
            {track.title}
          </div>

          <div className="player-artist">
            {track.artist ??
              "Unknown Artist"}
          </div>

        </div>

      </div>


      {/* CONTROLS */}

      <div className="player-center">

        <div className="player-buttons">

          <button
            className="player-button"
            onClick={onPrevious}
          >
            ⏮
          </button>


          <button
            className="player-play-button"
            onClick={togglePlay}
          >
            {isPlaying
              ? "❚❚"
              : "▶"}
          </button>


          <button
            className="player-button"
            onClick={onNext}
          >
            ⏭
          </button>

        </div>


        <div className="player-progress">

          <span>
            {formatTime(
              currentTime
            )}
          </span>


          <input
            type="range"
            min="0"
            max={
              duration || 0
            }
            step="0.1"
            value={
              Math.min(
                currentTime,
                duration || 0
              )
            }
            onChange={seek}
          />


          <span>
            {formatTime(
              duration
            )}
          </span>

        </div>

      </div>


      {/* VOLUME */}

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
          onChange={
            changeVolume
          }
        />

      </div>

    </div>

  );
}