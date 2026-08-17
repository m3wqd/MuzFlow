import { useEffect, useState } from "react";
import axios from "axios";

import Player from "./components/Player";
import UploadModal from "./components/UploadModal";

import "./App.css";


const API_URL = "http://localhost:8000";


interface Tag {
  id: number;
  name: string;
}


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
  tags?: Tag[];
}


interface Album {
  artist: string | null;
  album: string | null;
  year: number | null;
  cover_path: string | null;
  tracks: number;
}


type Section =
  | "music"
  | "artists"
  | "albums"
  | "tags";


function App() {

  const [tracks, setTracks] =
    useState<Track[]>([]);

  const [allTracks, setAllTracks] =
    useState<Track[]>([]);

  const [artists, setArtists] =
    useState<string[]>([]);

  const [albums, setAlbums] =
    useState<Album[]>([]);

  const [tags, setTags] =
    useState<Tag[]>([]);

  const [currentTrack, setCurrentTrack] =
    useState<Track | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [uploadOpen, setUploadOpen] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState<Section>("music");

  const [selectedArtist, setSelectedArtist] =
    useState<string | null>(null);

  const [selectedAlbum, setSelectedAlbum] =
    useState<Album | null>(null);

  const [selectedTag, setSelectedTag] =
    useState<Tag | null>(null);

  const [showTagManager, setShowTagManager] =
    useState(false);

  const [newTagName, setNewTagName] =
    useState("");


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadTracks();
    loadArtists();
    loadAlbums();
    loadTags();
  }, []);


  // =====================================================
  // LOAD TRACKS
  // =====================================================

  async function loadTracks() {

    try {

      setLoading(true);

      const response =
        await axios.get<Track[]>(
          `${API_URL}/api/tracks/`
        );

      setTracks(response.data);
      setAllTracks(response.data);

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
  // LOAD ARTISTS
  // =====================================================

  async function loadArtists() {

    try {

      const response =
        await axios.get<string[]>(
          `${API_URL}/api/artists/`
        );

      setArtists(response.data);

    } catch (error) {

      console.error(
        "Failed to load artists:",
        error
      );

    }
  }


  // =====================================================
  // LOAD ALBUMS
  // =====================================================

  async function loadAlbums() {

    try {

      const response =
        await axios.get<Album[]>(
          `${API_URL}/api/albums/`
        );

      setAlbums(response.data);

    } catch (error) {

      console.error(
        "Failed to load albums:",
        error
      );

    }
  }


  // =====================================================
  // LOAD TAGS
  // =====================================================

  async function loadTags() {

    try {

      const response =
        await axios.get<Tag[]>(
          `${API_URL}/api/tags/`
        );

      setTags(response.data);

    } catch (error) {

      console.error(
        "Failed to load tags:",
        error
      );

    }
  }


  // =====================================================
  // SEARCH
  // =====================================================

  async function searchTracks(
    query: string
  ) {

    if (!query.trim()) {

      setTracks(allTracks);

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

      setTracks(response.data);

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

    setSearchQuery(value);

    searchTracks(value);
  }


  // =====================================================
  // PLAY
  // =====================================================

  function playTrack(
    track: Track
  ) {

    setCurrentTrack(track);

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
        track =>
          track.id === currentTrack.id
      );


    if (currentIndex === -1) {
      return;
    }


    if (
      currentIndex >=
      tracks.length - 1
    ) {
      return;
    }


    setCurrentTrack(
      tracks[currentIndex + 1]
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
        track =>
          track.id === currentTrack.id
      );


    if (currentIndex <= 0) {
      return;
    }


    setCurrentTrack(
      tracks[currentIndex - 1]
    );

  }


  // =====================================================
  // DELETE TRACK
  // =====================================================

  async function deleteTrack(
    event: React.MouseEvent,
    track: Track
  ) {

    event.stopPropagation();


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


      if (
        currentTrack?.id === track.id
      ) {

        setCurrentTrack(null);

      }


      await loadTracks();
      await loadArtists();
      await loadAlbums();

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
    loadArtists();
    loadAlbums();
    loadTags();

  }


  // =====================================================
  // SELECT ARTIST
  // =====================================================

  async function selectArtist(
    artist: string
  ) {

    try {

      setLoading(true);

      setActiveSection("music");

      setSelectedArtist(artist);
      setSelectedAlbum(null);
      setSelectedTag(null);


      const response =
        await axios.get<Track[]>(
          `${API_URL}/api/tracks/`,
          {
            params: {
              artist,
            },
          }
        );


      setTracks(response.data);

    } catch (error) {

      console.error(
        "Failed to load artist tracks:",
        error
      );

    } finally {

      setLoading(false);

    }
  }


  // =====================================================
  // SELECT ALBUM
  // =====================================================

  async function selectAlbum(
    album: Album
  ) {

    try {

      setLoading(true);

      setActiveSection("music");

      setSelectedArtist(null);
      setSelectedAlbum(album);
      setSelectedTag(null);


      const response =
        await axios.get<Track[]>(
          `${API_URL}/api/tracks/`,
          {
            params: {
              artist: album.artist,
              album: album.album,
            },
          }
        );


      setTracks(response.data);

    } catch (error) {

      console.error(
        "Failed to load album tracks:",
        error
      );

    } finally {

      setLoading(false);

    }
  }


  // =====================================================
  // SELECT TAG
  // =====================================================

  async function selectTag(
    tag: Tag
  ) {

    try {

      setLoading(true);

      setActiveSection("music");

      setSelectedArtist(null);
      setSelectedAlbum(null);
      setSelectedTag(tag);


      const response =
        await axios.get<Track[]>(
          `${API_URL}/api/tracks/`
        );


      const filtered =
        response.data.filter(
          track =>
            track.tags?.some(
              trackTag =>
                trackTag.id === tag.id
            )
        );


      setTracks(filtered);

    } catch (error) {

      console.error(
        "Failed to load tag tracks:",
        error
      );

    } finally {

      setLoading(false);

    }
  }


  // =====================================================
  // SHOW ALL MUSIC
  // =====================================================

  function showAllMusic() {

    setSelectedArtist(null);
    setSelectedAlbum(null);
    setSelectedTag(null);

    setSearchQuery("");

    setActiveSection("music");

    setTracks(allTracks);

  }


  // =====================================================
  // CREATE TAG
  // =====================================================

  async function createTag() {

    const name =
      newTagName.trim();


    if (!name) {
      return;
    }


    try {

      await axios.post(
        `${API_URL}/api/tags/`,
        null,
        {
          params: {
            name,
          },
        }
      );


      setNewTagName("");

      await loadTags();

    } catch (error) {

      console.error(
        "Failed to create tag:",
        error
      );

      alert(
        "Не удалось создать тег."
      );

    }
  }


  // =====================================================
  // DELETE TAG
  // =====================================================

  async function deleteTag(
    event: React.MouseEvent,
    tag: Tag
  ) {

    event.stopPropagation();


    const confirmed =
      window.confirm(
        `Удалить тег «${tag.name}»?`
      );


    if (!confirmed) {
      return;
    }


    try {

      await axios.delete(
        `${API_URL}/api/tags/${tag.id}`
      );


      if (
        selectedTag?.id === tag.id
      ) {

        showAllMusic();

      }


      await loadTags();
      await loadTracks();

    } catch (error) {

      console.error(
        "Failed to delete tag:",
        error
      );

      alert(
        "Не удалось удалить тег."
      );

    }
  }


  // =====================================================
  // COVER
  // =====================================================

  function getCover(
    path: string | null
  ) {

    if (!path) {
      return null;
    }

    return `${API_URL}${path}`;

  }


  // =====================================================
  // DURATION
  // =====================================================

  function formatDuration(
    duration: number | null
  ) {

    if (!duration) {
      return "—";
    }


    const minutes =
      Math.floor(duration / 60);


    const seconds =
      Math.floor(duration % 60);


    return (
      `${minutes}:` +
      `${seconds
        .toString()
        .padStart(2, "0")}`
    );

  }


  // =====================================================
  // TRACK COMPONENT
  // =====================================================

  function renderTrack(
    track: Track,
    index: number
  ) {

    return (

      <div
        className={`track ${
          currentTrack?.id === track.id
            ? "active"
            : ""
        }`}
        key={track.id}
        onClick={() =>
          playTrack(track)
        }
      >

        <div className="track-number">

          {currentTrack?.id === track.id
            ? "▶"
            : index + 1}

        </div>


        <div className="cover">

          {getCover(
            track.cover_path
          ) ? (

            <img
              src={
                getCover(
                  track.cover_path
                ) as string
              }
              alt={track.title}
            />

          ) : (

            <div className="no-cover">
              ♪
            </div>

          )}

        </div>


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


          {track.tags &&
            track.tags.length > 0 && (

              <div className="track-tags">

                {track.tags.map(
                  tag => (

                    <span
                      className="track-tag"
                      key={tag.id}
                      onClick={(event) => {

                        event.stopPropagation();

                        selectTag(tag);

                      }}
                    >
                      #{tag.name}
                    </span>

                  )
                )}

              </div>

            )}

        </div>


        <div className="track-year">
          {track.year ?? "—"}
        </div>


        <div className="track-genre">
          {track.genre ?? "—"}
        </div>


        <div className="track-duration">
          {formatDuration(
            track.duration
          )}
        </div>


        <button
          className="track-delete"
          onClick={(event) =>
            deleteTrack(
              event,
              track
            )
          }
          title="Удалить трек"
        >
          ×
        </button>

      </div>

    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="app">


      {/* HEADER */}

      <header className="header">

        <div
          className="logo"
          onClick={showAllMusic}
        >
          MuzFlow
        </div>


        <input
          className="search"
          type="text"
          placeholder="Поиск музыки..."
          value={searchQuery}
          onChange={handleSearch}
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


      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-title">
          Библиотека
        </div>


        <button
          className={
            activeSection === "music"
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={showAllMusic}
        >
          <span>♫</span>
          Моя музыка
        </button>


        <button
          className={
            activeSection === "artists"
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={() => {

            setActiveSection("artists");

            setSelectedArtist(null);
            setSelectedAlbum(null);
            setSelectedTag(null);

          }}
        >
          <span>◉</span>
          Исполнители
        </button>


        <button
          className={
            activeSection === "albums"
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={() => {

            setActiveSection("albums");

            setSelectedArtist(null);
            setSelectedAlbum(null);
            setSelectedTag(null);

          }}
        >
          <span>▣</span>
          Альбомы
        </button>


        <button
          className={
            activeSection === "tags"
              ? "sidebar-item active"
              : "sidebar-item"
          }
          onClick={() => {

            setActiveSection("tags");

            setSelectedArtist(null);
            setSelectedAlbum(null);
            setSelectedTag(null);

          }}
        >
          <span>#</span>
          Теги
        </button>

      </aside>


      {/* CONTENT */}

      <main className="content">


        {/* MUSIC */}

        {activeSection === "music" && (

          <>

            <div className="content-header">

              <div>

                <h1>

                  {selectedArtist
                    ? selectedArtist
                    : selectedAlbum
                    ? selectedAlbum.album
                    : selectedTag
                    ? `#${selectedTag.name}`
                    : "Моя музыка"}

                </h1>


                {(selectedArtist ||
                  selectedAlbum ||
                  selectedTag) && (

                  <button
                    className="back-button"
                    onClick={showAllMusic}
                  >
                    ← Все треки
                  </button>

                )}

              </div>


              <span className="track-count">
                {tracks.length} треков
              </span>

            </div>


            {loading && (

              <div className="loading">
                Загружаем библиотеку...
              </div>

            )}


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
                  Здесь появятся ваши треки.
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


            {!loading &&
              tracks.length > 0 && (

              <div className="tracks">

                {tracks.map(
                  (track, index) =>
                    renderTrack(
                      track,
                      index
                    )
                )}

              </div>

            )}

          </>

        )}


        {/* ARTISTS */}

        {activeSection === "artists" && (

          <>

            <div className="content-header">

              <h1>
                Исполнители
              </h1>


              <span className="track-count">
                {artists.length}
              </span>

            </div>


            <div className="library-grid">

              {artists.map(
                artist => (

                  <button
                    className="library-card"
                    key={artist}
                    onClick={() =>
                      selectArtist(
                        artist
                      )
                    }
                  >

                    <div className="library-card-icon">
                      ♪
                    </div>


                    <div>
                      {artist}
                    </div>

                  </button>

                )
              )}

            </div>

          </>

        )}


        {/* ALBUMS */}

        {activeSection === "albums" && (

          <>

            <div className="content-header">

              <h1>
                Альбомы
              </h1>


              <span className="track-count">
                {albums.length}
              </span>

            </div>


            <div className="library-grid">

              {albums.map(
                (album, index) => (

                  <button
                    className="library-card album-card"
                    key={
                      `${album.artist}-${album.album}-${index}`
                    }
                    onClick={() =>
                      selectAlbum(
                        album
                      )
                    }
                  >

                    <div className="album-cover">

                      {getCover(
                        album.cover_path
                      ) ? (

                        <img
                          src={
                            getCover(
                              album.cover_path
                            ) as string
                          }
                          alt={
                            album.album ??
                            "Album"
                          }
                        />

                      ) : (

                        <div>
                          ♪
                        </div>

                      )}

                    </div>


                    <div className="album-name">
                      {album.album ??
                        "Unknown Album"}
                    </div>


                    <div className="album-artist">
                      {album.artist ??
                        "Unknown Artist"}
                    </div>


                    <div className="album-meta">
                      {album.year ??
                        "—"}{" "}
                      ·{" "}
                      {album.tracks} треков
                    </div>

                  </button>

                )
              )}

            </div>

          </>

        )}


        {/* TAGS */}

        {activeSection === "tags" && (

          <>

            <div className="content-header">

              <h1>
                Теги
              </h1>


              <button
                className="upload-header-button"
                onClick={() =>
                  setShowTagManager(
                    !showTagManager
                  )
                }
              >
                {showTagManager
                  ? "Закрыть"
                  : "+ Создать тег"}
              </button>

            </div>


            {showTagManager && (

              <div className="tag-manager">

                <input
                  type="text"
                  placeholder="Название тега"
                  value={newTagName}
                  onChange={event =>
                    setNewTagName(
                      event.target.value
                    )
                  }
                  onKeyDown={event => {

                    if (
                      event.key ===
                      "Enter"
                    ) {
                      createTag();
                    }

                  }}
                />


                <button
                  onClick={createTag}
                >
                  Создать
                </button>

              </div>

            )}


            <div className="tags-list">

              {tags.map(
                tag => (

                  <div
                    className="tag-card"
                    key={tag.id}
                    onClick={() =>
                      selectTag(tag)
                    }
                  >

                    <div className="tag-card-name">
                      #{tag.name}
                    </div>


                    <button
                      className="tag-delete"
                      onClick={(event) =>
                        deleteTag(
                          event,
                          tag
                        )
                      }
                    >
                      ×
                    </button>

                  </div>

                )
              )}

            </div>


            {tags.length === 0 && (

              <div className="empty-library">

                <div className="empty-icon">
                  #
                </div>


                <h2>
                  Тегов пока нет
                </h2>


                <p>
                  Создайте первый тег.
                </p>

              </div>

            )}

          </>

        )}

      </main>


      {/* PLAYER */}

      <Player
        track={currentTrack}
        onNext={playNext}
        onPrevious={playPrevious}
      />


      {/* UPLOAD MODAL */}

      {uploadOpen && (

        <UploadModal
          onClose={() =>
            setUploadOpen(false)
          }
          onUploaded={() => {

            setUploadOpen(false);

            handleUploaded();

          }}
        />

      )}

    </div>

  );

}


export default App;