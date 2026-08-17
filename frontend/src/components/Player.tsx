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

  duration?: number | null;
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


  const [isLoading, setIsLoading] =
    useState(false);


  const [error, setError] =
    useState(false);


  /*
   * Храним актуальный onNext.
   *
   * Это важно: обработчик ended
   * не будет постоянно пересоздаваться.
   */

  const onNextRef =
    useRef(onNext);


  useEffect(() => {

    onNextRef.current =
      onNext;

  }, [onNext]);


  /*
   * Сохраняем громкость.
   */

  useEffect(() => {

    const savedVolume =
      localStorage.getItem(
        "muzflow-volume"
      );


    if (savedVolume !== null) {

      const value =
        Number(savedVolume);


      if (
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 1
      ) {

        setVolume(value);

      }

    }

  }, []);


  /*
   * Применяем громкость
   * к audio.
   */

  useEffect(() => {

    const audio =
      audioRef.current;


    if (!audio) {
      return;
    }


    audio.volume =
      volume;

  }, [volume]);


  /*
   * Смена трека.
   */

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

      setError(false);

      return;

    }


    const url =
      `${API_URL}/api/tracks/${track.id}/stream`;


    setIsLoading(true);

    setError(false);

    setCurrentTime(0);


    /*
     * Если backend уже знает
     * длительность — используем её
     * до загрузки metadata.
     */

    if (
      track.duration &&
      track.duration > 0
    ) {

      setDuration(
        track.duration
      );

    } else {

      setDuration(0);

    }


    audio.pause();


    audio.src =
      url;


    audio.load();


    /*
     * Автоматически запускаем новый трек.
     */

    audio
      .play()
      .then(() => {

        setIsPlaying(true);

        setIsLoading(false);

      })
      .catch((error) => {

        console.error(
          "Cannot play audio:",
          error
        );

        setIsPlaying(false);

        setIsLoading(false);

      });


  }, [track]);


  /*
   * AUDIO EVENTS
   */

  useEffect(() => {

    const audio =
      audioRef.current;


    if (!audio) {
      return;
    }


    const handleTimeUpdate =
      () => {

        setCurrentTime(
          audio.currentTime
        );

      };


    const handleLoadedMetadata =
      () => {

        if (
          Number.isFinite(
            audio.duration
          )
        ) {

          setDuration(
            audio.duration
          );

        }

        setIsLoading(false);

      };


    const handleCanPlay =
      () => {

        setIsLoading(false);

      };


    const handleWaiting =
      () => {

        setIsLoading(true);

      };


    const handlePlaying =
      () => {

        setIsPlaying(true);

        setIsLoading(false);

        setError(false);

      };


    const handlePause =
      () => {

        setIsPlaying(false);

      };


    const handleError =
      () => {

        setIsPlaying(false);

        setIsLoading(false);

        setError(true);

      };


    const handleEnded =
      () => {

        setIsPlaying(false);

        setCurrentTime(0);


        /*
         * Переходим на следующий трек.
         */

        onNextRef.current();

      };


    audio.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );


    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );


    audio.addEventListener(
      "canplay",
      handleCanPlay
    );


    audio.addEventListener(
      "waiting",
      handleWaiting
    );


    audio.addEventListener(
      "playing",
      handlePlaying
    );


    audio.addEventListener(
      "pause",
      handlePause
    );


    audio.addEventListener(
      "error",
      handleError
    );


    audio.addEventListener(
      "ended",
      handleEnded
    );


    return () => {

      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );


      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );


      audio.removeEventListener(
        "canplay",
        handleCanPlay
      );


      audio.removeEventListener(
        "waiting",
        handleWaiting
      );


      audio.removeEventListener(
        "playing",
        handlePlaying
      );


      audio.removeEventListener(
        "pause",
        handlePause
      );


      audio.removeEventListener(
        "error",
        handleError
      );


      audio.removeEventListener(
        "ended",
        handleEnded
      );

    };

  }, []);


  /*
   * PLAY / PAUSE
   */

  async function togglePlay() {

    const audio =
      audioRef.current;


    if (
      !audio ||
      !track
    ) {
      return;
    }


    if (audio.paused) {

      try {

        await audio.play();

        setIsPlaying(true);

      } catch (error) {

        console.error(
          "Play error:",
          error
        );

        setError(true);

      }

    } else {

      audio.pause();

      setIsPlaying(false);

    }

  }


  /*
   * SEEK
   */

  function seek(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const value =
      Number(
        event.target.value
      );


    const audio =
      audioRef.current;


    if (!audio) {
      return;
    }


    audio.currentTime =
      value;


    setCurrentTime(
      value
    );

  }


  /*
   * REWIND -10
   */

  function rewind() {

    const audio =
      audioRef.current;


    if (!audio) {
      return;
    }


    audio.currentTime =
      Math.max(
        0,
        audio.currentTime - 10
      );

  }


  /*
   * FORWARD +10
   */

  function forward() {

    const audio =
      audioRef.current;


    if (!audio) {
      return;
    }


    audio.currentTime =
      Math.min(
        audio.duration || duration,
        audio.currentTime + 10
      );

  }


  /*
   * VOLUME
   */

  function changeVolume(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const value =
      Number(
        event.target.value
      );


    const audio =
      audioRef.current;


    if (!audio) {
      return;
    }


    audio.volume =
      value;


    setVolume(
      value
    );


    localStorage.setItem(
      "muzflow-volume",
      String(value)
    );

  }


  /*
   * MUTE
   */

  function toggleMute() {

    const audio =
      audioRef.current;


    if (!audio) {
      return;
    }


    if (audio.volume > 0) {

      audio.volume =
        0;


      setVolume(0);

      localStorage.setItem(
        "muzflow-volume",
        "0"
      );

    } else {

      const restored =
        0.7;


      audio.volume =
        restored;


      setVolume(
        restored
      );


      localStorage.setItem(
        "muzflow-volume",
        String(restored)
      );

    }

  }


  /*
   * TIME FORMAT
   */

  function formatTime(
    value: number
  ) {

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {

      return "0:00";

    }


    const hours =
      Math.floor(
        value / 3600
      );


    const minutes =
      Math.floor(
        (value % 3600) / 60
      );


    const seconds =
      Math.floor(
        value % 60
      );


    if (hours > 0) {

      return (
        `${hours}:` +
        `${minutes
          .toString()
          .padStart(2, "0")}:` +
        `${seconds
          .toString()
          .padStart(2, "0")}`
      );

    }


    return (
      `${minutes}:` +
      `${seconds
        .toString()
        .padStart(2, "0")}`
    );

  }


  /*
   * EMPTY PLAYER
   */

  if (!track) {

    return (

      <div className="player player-empty">

        <audio
          ref={audioRef}
        />


        <div className="player-empty-icon">
          ♪
        </div>


        <span>
          Выберите трек
        </span>

      </div>

    );

  }


  /*
   * PROGRESS
   */

  const progress =
    duration > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (currentTime /
              duration) *
              100
          )
        )
      : 0;


  /*
   * VOLUME ICON
   */

  let volumeIcon = "🔊";

  if (volume === 0) {

    volumeIcon = "🔇";

  } else if (volume < 0.5) {

    volumeIcon = "🔉";

  }


  /*
   * PLAYER
   */

  return (

    <div className="player">

      <audio
        ref={audioRef}
        preload="metadata"
      />


      {/* ===============================================
          TRACK INFO
          =============================================== */}

      <div className="player-track">

        <div className="player-cover">

          {track.cover_path ? (

            <img
              src={
                `${API_URL}${track.cover_path}`
              }
              alt={
                track.title
              }
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


          {track.album && (

            <div className="player-album">

              {track.album}

            </div>

          )}

        </div>

      </div>


      {/* ===============================================
          CENTER
          =============================================== */}

      <div className="player-center">


        {/* CONTROLS */}

        <div className="player-buttons">


          <button
            className="player-button small"
            onClick={rewind}
            title="Назад 10 секунд"
          >
            ↶10
          </button>


          <button
            className="player-button"
            onClick={onPrevious}
            title="Предыдущий"
          >
            ⏮
          </button>


          <button
            className="player-play-button"
            onClick={togglePlay}
            disabled={isLoading}
            title={
              isPlaying
                ? "Пауза"
                : "Воспроизвести"
            }
          >

            {isLoading
              ? "…"
              : isPlaying
                ? "❚❚"
                : "▶"}

          </button>


          <button
            className="player-button"
            onClick={onNext}
            title="Следующий"
          >
            ⏭
          </button>


          <button
            className="player-button small"
            onClick={forward}
            title="Вперёд 10 секунд"
          >
            10↷
          </button>

        </div>


        {/* PROGRESS */}

        <div className="player-progress">


          <span className="player-time">
            {formatTime(
              currentTime
            )}
          </span>


          <div className="progress-container">

            <div
              className="progress-background"
            />

            <div
              className="progress-fill"
              style={{
                width:
                  `${progress}%`,
              }}
            />

            <input
              className="progress-input"
              type="range"
              min="0"
              max={
                duration ||
                0
              }
              step="0.1"
              value={
                Math.min(
                  currentTime,
                  duration ||
                    0
                )
              }
              onChange={
                seek
              }
            />

          </div>


          <span className="player-time">

            {formatTime(
              duration
            )}

          </span>

        </div>


        {/* ERROR */}

        {error && (

          <div className="player-error">

            Не удалось воспроизвести трек

          </div>

        )}

      </div>


      {/* ===============================================
          VOLUME
          =============================================== */}

      <div className="player-volume">


        <button
          className="volume-button"
          onClick={
            toggleMute
          }
          title="Громкость"
        >

          {volumeIcon}

        </button>


        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={
            volume
          }
          onChange={
            changeVolume
          }
        />

      </div>

    </div>

  );

}