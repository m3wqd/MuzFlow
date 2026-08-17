import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import "./LibraryPages.css";


const API_URL =
  "http://localhost:8000";


interface Artist {
  name: string;
  tracks: number;
}


interface Track {
  id: number;
  title: string;
  artist: string | null;
  album: string | null;
  cover_path: string | null;
}


interface ArtistsProps {
  onPlay: (
    track: Track
  ) => void;
}


export default function Artists({
  onPlay,
}: ArtistsProps) {

  const [artists, setArtists] =
    useState<Artist[]>([]);

  const [selectedArtist, setSelectedArtist] =
    useState<string | null>(null);

  const [tracks, setTracks] =
    useState<Track[]>([]);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    loadArtists();

  }, []);


  async function loadArtists() {

    try {

      setLoading(true);

      const response =
        await axios.get<string[]>(
          `${API_URL}/api/artists/`
        );


      const result: Artist[] =
        await Promise.all(

          response.data.map(
            async (name) => {

              const tracksResponse =
                await axios.get<Track[]>(
                  `${API_URL}/api/tracks/`,
                  {
                    params: {
                      artist: name,
                    },
                  }
                );


              return {
                name,
                tracks:
                  tracksResponse.data
                    .length,
              };

            }
          )

        );


      setArtists(result);

    } catch (error) {

      console.error(
        "Failed to load artists:",
        error
      );

    } finally {

      setLoading(false);

    }

  }


  async function openArtist(
    artist: string
  ) {

    try {

      setSelectedArtist(
        artist
      );


      const response =
        await axios.get<Track[]>(
          `${API_URL}/api/tracks/`,
          {
            params: {
              artist,
            },
          }
        );


      setTracks(
        response.data
      );

    } catch (error) {

      console.error(
        "Failed to load artist:",
        error
      );

    }

  }


  if (selectedArtist) {

    return (

      <div className="library-page">


        <button
          className="back-button"
          onClick={() => {
            setSelectedArtist(null);
            setTracks([]);
          }}
        >
          ← Исполнители
        </button>


        <div className="page-title">

          <h1>
            {selectedArtist}
          </h1>

          <span>
            {tracks.length} треков
          </span>

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


                <div className="library-cover">

                  {track.cover_path ? (

                    <img
                      src={
                        `${API_URL}${track.cover_path}`
                      }
                      alt={track.title}
                    />

                  ) : (

                    <div>
                      ♪
                    </div>

                  )}

                </div>


                <div className="library-track-info">

                  <strong>
                    {track.title}
                  </strong>

                  <span>
                    {track.album ??
                      "Unknown Album"}
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
          Исполнители
        </h1>

        <span>
          {artists.length}
        </span>

      </div>


      {loading ? (

        <div className="loading">
          Загружаем исполнителей...
        </div>

      ) : (

        <div className="artist-grid">

          {artists.map(
            (artist) => (

              <div
                className="artist-card"
                key={artist.name}
                onClick={() =>
                  openArtist(
                    artist.name
                  )
                }
              >

                <div className="artist-avatar">
                  ♪
                </div>


                <div className="artist-name">
                  {artist.name}
                </div>


                <div className="artist-count">
                  {artist.tracks} треков
                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>

  );

}