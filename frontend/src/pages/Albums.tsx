import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import "./LibraryPages.css";


const API_URL =
  "http://localhost:8000";


interface Album {
  artist: string | null;
  album: string | null;
  year: number | null;
  cover_path: string | null;
  tracks: number;
}


interface Track {
  id: number;
  title: string;
  artist: string | null;
  album: string | null;
  cover_path: string | null;
}


interface AlbumsProps {
  onPlay: (
    track: Track
  ) => void;
}


export default function Albums({
  onPlay,
}: AlbumsProps) {

  const [albums, setAlbums] =
    useState<Album[]>([]);

  const [selectedAlbum, setSelectedAlbum] =
    useState<Album | null>(null);

  const [tracks, setTracks] =
    useState<Track[]>([]);


  useEffect(() => {

    loadAlbums();

  }, []);


  async function loadAlbums() {

    try {

      const response =
        await axios.get<Album[]>(
          `${API_URL}/api/albums/`
        );


      setAlbums(
        response.data
      );

    } catch (error) {

      console.error(
        "Failed to load albums:",
        error
      );

    }

  }


  async function openAlbum(
    album: Album
  ) {

    try {

      setSelectedAlbum(
        album
      );


      const response =
        await axios.get<Track[]>(
          `${API_URL}/api/tracks/`,
          {
            params: {
              artist:
                album.artist,
              album:
                album.album,
            },
          }
        );


      setTracks(
        response.data
      );

    } catch (error) {

      console.error(
        "Failed to load album:",
        error
      );

    }

  }


  if (selectedAlbum) {

    return (

      <div className="library-page">


        <button
          className="back-button"
          onClick={() => {
            setSelectedAlbum(null);
            setTracks([]);
          }}
        >
          ← Альбомы
        </button>


        <div className="album-header">


          <div className="album-large-cover">

            {selectedAlbum.cover_path ? (

              <img
                src={
                  `${API_URL}${selectedAlbum.cover_path}`
                }
                alt={
                  selectedAlbum.album ??
                  "Album"
                }
              />

            ) : (

              <div>
                ♪
              </div>

            )}

          </div>


          <div>

            <div className="album-label">
              АЛЬБОМ
            </div>

            <h1>
              {selectedAlbum.album ??
                "Unknown Album"}
            </h1>

            <p>
              {selectedAlbum.artist ??
                "Unknown Artist"}
            </p>

            <span>
              {selectedAlbum.year ??
                "—"}{" "}
              ·{" "}
              {tracks.length} треков
            </span>

          </div>

        </div>


        <div className="library-tracks">

          {tracks.map(
            (track, index) => (

              <div
                className="library-track"
                key={track.id}
                onClick={() =>
                  onPlay(track)
                }
              >

                <div className="library-number">
                  {index + 1}
                </div>


                <div className="library-track-info">

                  <strong>
                    {track.title}
                  </strong>

                  <span>
                    {track.artist ??
                      "Unknown Artist"}
                  </span>

                </div>


                <button
                  className="library-play"
                  onClick={(event) => {
                    event.stopPropagation();
                    onPlay(track);
                  }}
                >
                  ▶
                </button>

              </div>

            )
          )}

        </div>

      </div>

    );

  }


  return (

    <div className="library-page">


      <div className="page-title">

        <h1>
          Альбомы
        </h1>

        <span>
          {albums.length}
        </span>

      </div>


      <div className="album-grid">

        {albums.map(
          (album, index) => (

            <div
              className="album-card"
              key={`${album.artist}-${album.album}-${index}`}
              onClick={() =>
                openAlbum(
                  album
                )
              }
            >

              <div className="album-cover">

                {album.cover_path ? (

                  <img
                    src={
                      `${API_URL}${album.cover_path}`
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

            </div>

          )
        )}

      </div>

    </div>

  );

}