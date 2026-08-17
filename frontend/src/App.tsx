import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import Player from "./components/Player";
import UploadModal from "./components/UploadModal";

import "./App.css";


const API_URL =
  "http://localhost:8000";


interface Track {
  id: number;

  title: string;

  artist: string | null;

  album: string | null;

  album_artist?: string | null;

  genre: string | null;

  year: number | null;

  duration: number | null;

  cover_path: string | null;

  file_path: string;
}


function App() {

  const [tracks, setTracks] =
    useState<Track[]>([]);


  const [currentTrack, setCurrentTrack] =
    useState<Track | null>(null);


  const [loading, setLoading] =
    useState(true);


  const [searchQuery, setSearchQuery] =
    useState("");


  const [uploadOpen, setUploadOpen] =
    useState(false);


  // =====================================================
  // LOAD TRACKS
  // =====================================================

  useEffect(() => {

    loadTracks();

  }, []);


  async function loadTracks() {

    try {

      setLoading(true);


      const response =
        await axios.get<Track[]>(
          `${API_URL}/api/tracks/`
        );


      setTracks(
        response.data
      );


    } catch (error) {

      console.error(
        "Failed to load tracks:",
        error
      );


    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // SEARCH
  // =====================================================

  async function searchTracks(
    query: string
  ) {

    if (!query.trim()) {

      await loadTracks();

      return;

    }


    try {

      setLoading(true);


      const response =
        await axios.get<Track[]>(
          `${API_URL}/api/tracks/search`,
          {
            params: {
              q: query,
            },
          }
        );


      setTracks(
        response.data
      );


    } catch (error) {

      console.error(
        "Search failed:",
        error
      );


    } finally {

      setLoading(false);

    }

  }


  function handleSearch(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const value =
      event.target.value;


    setSearchQuery(
      value
    );


    searchTracks(
      value
    );

  }


  // =====================================================
  // PLAY
  // =====================================================

  function playTrack(
    track: Track
  ) {

    setCurrentTrack(
      track
    );

  }


  // =====================================================
  // NEXT
  // =====================================================

  function playNext() {

    if (!currentTrack) {
      return;
    }


    const currentIndex =
      tracks.findIndex(
        (track) =>
          track.id ===
          currentTrack.id
      );


    if (
      currentIndex === -1
    ) {
      return;
    }


    if (
      currentIndex >=
      tracks.length - 1
    ) {

      return;

    }


    setCurrentTrack(
      tracks[
        currentIndex + 1
      ]
    );

  }


  // =====================================================
  // PREVIOUS
  // =====================================================

  function playPrevious() {

    if (!currentTrack) {
      return;
    }


    const currentIndex =
      tracks.findIndex(
        (track) =>
          track.id ===
          currentTrack.id
      );


    if (
      currentIndex <= 0
    ) {

      return;

    }


    setCurrentTrack(
      tracks[
        currentIndex - 1
      ]
    );

  }


  // =====================================================
  // DELETE
  // =====================================================

  async function deleteTrack(
    track: Track
  ) {

    const confirmed =
      window.confirm(
        `Удалить «${track.title}»?`
      );


    if (!confirmed) {
      return;
    }


    try {

      await axios.delete(
        `${API_URL}/api/tracks/${track.id}`
      );


      /*
       * Если удаляем текущий трек,
       * останавливаем плеер.
       */

      if (
        currentTrack?.id ===
        track.id
      ) {

        setCurrentTrack(
          null
        );

      }


      /*
       * Обновляем библиотеку.
       */

      await loadTracks();


    } catch (error) {

      console.error(
        "Failed to delete track:",
        error
      );


      alert(
        "Не удалось удалить трек."
      );

    }

  }


  // =====================================================
  // UPLOAD COMPLETE
  // =====================================================

  function handleUploaded() {

    loadTracks();

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="app">


      {/* =================================================
          HEADER
          ================================================= */}

      <header className="header">


        <div className="logo">

          MuzFlow

        </div>


        <input
          className="search"
          type="text"
          placeholder="Поиск музыки..."
          value={searchQuery}
          onChange={
            handleSearch
          }
        />


        <button
          className="upload-header-button"
          onClick={() =>
            setUploadOpen(true)
          }
        >

          + Загрузить

        </button>


      </header>


      {/* =================================================
          MAIN
          ================================================= */}

      <main className="content">


        <div className="content-header">


          <h1>

            Моя музыка

          </h1>


          <span className="track-count">

            {tracks.length} треков

          </span>


        </div>


        {/* =================================================
            LOADING
            ================================================= */}

        {loading && (

          <div className="loading">

            Загружаем библиотеку...

          </div>

        )}


        {/* =================================================
            EMPTY
            ================================================= */}

        {!loading &&
          tracks.length === 0 && (

            <div className="empty-library">


              <div className="empty-icon">

                ♪

              </div>


              <h2>

                Музыки пока нет

              </h2>


              <p>

                Загрузите первый трек,
                чтобы начать слушать.

              </p>


              <button
                className="upload-empty-button"
                onClick={() =>
                  setUploadOpen(true)
                }
              >

                + Загрузить музыку

              </button>


            </div>

          )}


        {/* =================================================
            TRACK LIST
            ================================================= */}

        {!loading &&
          tracks.length > 0 && (

            <div className="tracks">


              {tracks.map(
                (
                  track,
                  index
                ) => (

                  <div
                    className={`track ${
                      currentTrack?.id ===
                      track.id
                        ? "active"
                        : ""
                    }`}
                    key={track.id}

                    /*
                     * ВСЯ СТРОКА
                     * КЛИКАБЕЛЬНАЯ
                     */

                    onClick={() =>
                      playTrack(
                        track
                      )
                    }
                  >


                    {/* =================================
                        NUMBER
                        ================================= */}

                    <div className="track-number">

                      {index + 1}

                    </div>


                    {/* =================================
                        COVER
                        ================================= */}

                    <div className="cover">


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

                        <div className="no-cover">

                          ♪

                        </div>

                      )}


                    </div>


                    {/* =================================
                        INFO
                        ================================= */}

                    <div className="track-info">


                      <div className="track-title">

                        {track.title}

                      </div>


                      <div className="track-artist">

                        {track.artist ??
                          "Unknown Artist"}

                      </div>


                      <div className="track-album">

                        {track.album ??
                          "Unknown Album"}

                      </div>


                    </div>


                    {/* =================================
                        YEAR
                        ================================= */}

                    <div className="track-year">

                      {track.year ??
                        "—"}

                    </div>


                    {/* =================================
                        GENRE
                        ================================= */}

                    <div className="track-genre">

                      {track.genre ??
                        "—"}

                    </div>


                    {/* =================================
                        PLAY
                        ================================= */}

                    <button
                      className="track-play"

                      onClick={(
                        event
                      ) => {

                        /*
                         * Не даём клику
                         * всплыть до строки.
                         */

                        event.stopPropagation();


                        playTrack(
                          track
                        );

                      }}

                      title="Воспроизвести"
                    >

                      {currentTrack?.id ===
                      track.id

                        ? "⏸"

                        : "▶"}

                    </button>


                    {/* =================================
                        DELETE
                        ================================= */}

                    <button
                      className="track-delete"

                      onClick={(
                        event
                      ) => {

                        /*
                         * Не запускаем
                         * трек при удалении.
                         */

                        event.stopPropagation();


                        deleteTrack(
                          track
                        );

                      }}

                      title="Удалить трек"
                    >

                      ×

                    </button>


                  </div>

                )
              )}


            </div>

          )}


      </main>


      {/* =================================================
          PLAYER
          ================================================= */}

      <Player
        track={
          currentTrack
        }

        onNext={
          playNext
        }

        onPrevious={
          playPrevious
        }
      />


      {/* =================================================
          UPLOAD MODAL
          ================================================= */}

      {uploadOpen && (

        <UploadModal

          onClose={() =>
            setUploadOpen(
              false
            )
          }

          onUploaded={
            handleUploaded
          }

        />

      )}


    </div>

  );

}


export default App;