import { useEffect, useState } from "react";
import axios from "axios";

import "./App.css";


const API_URL = "http://localhost:8000";


interface Track {
  id: number;
  title: string;
  artist: string | null;
  album: string | null;
  genre: string | null;
  year: number | null;
  duration: number | null;
  cover_path: string | null;
}


function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTracks();
  }, []);


  async function loadTracks() {
    try {
      const response = await axios.get(
        `${API_URL}/api/tracks/`
      );

      setTracks(response.data);
    } catch (error) {
      console.error(
        "Failed to load tracks:",
        error
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="app">

      <header className="header">

        <div className="logo">
          MuzFlow
        </div>

        <input
          className="search"
          placeholder="Поиск музыки..."
        />

      </header>


      <main className="content">

        <h1>
          Моя музыка
        </h1>


        {loading ? (
          <p>
            Загружаем библиотеку...
          </p>
        ) : tracks.length === 0 ? (
          <p>
            В библиотеке пока нет музыки.
          </p>
        ) : (

          <div className="tracks">

            {tracks.map((track) => (

              <div
                className="track"
                key={track.id}
              >

                <div className="cover">
                  {track.cover_path ? (
                    <img
                      src={`${API_URL}${track.cover_path}`}
                      alt=""
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
                    {track.artist ?? "Unknown Artist"}
                  </div>

                  <div className="track-album">
                    {track.album ?? "Unknown Album"}
                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}


export default App;