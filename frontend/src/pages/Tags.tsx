import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import "./LibraryPages.css";


const API_URL =
  "http://localhost:8000";


interface Tag {
  id: number;
  name: string;
}


interface Track {
  id: number;
  title: string;
  artist: string | null;
  album: string | null;
  cover_path: string | null;
}


interface TagsProps {
  onPlay: (
    track: Track
  ) => void;
}


export default function Tags({
  onPlay,
}: TagsProps) {

  const [tags, setTags] =
    useState<Tag[]>([]);


  const [selectedTag, setSelectedTag] =
    useState<Tag | null>(null);


  const [tracks, setTracks] =
    useState<Track[]>([]);


  const [newTag, setNewTag] =
    useState("");


  useEffect(() => {

    loadTags();

  }, []);


  async function loadTags() {

    try {

      const response =
        await axios.get<Tag[]>(
          `${API_URL}/api/tags/`
        );


      setTags(
        response.data
      );

    } catch (error) {

      console.error(
        "Failed to load tags:",
        error
      );

    }

  }


  /*
   * ВАЖНО:
   *
   * Сейчас backend tags.py не имеет
   * endpoint GET /api/tags/{tag_id}/tracks.
   *
   * Поэтому ниже используем все треки
   * и фильтруем по tags.
   */

  async function openTag(
    tag: Tag
  ) {

    try {

      setSelectedTag(
        tag
      );


      const response =
        await axios.get<Track[]>(
          `${API_URL}/api/tracks/`
        );


      const filtered =
        response.data.filter(
          (
            track: any
          ) => {

            return track.tags?.some(
              (
                trackTag: Tag
              ) =>
                trackTag.id ===
                tag.id
            );

          }
        );


      setTracks(
        filtered
      );

    } catch (error) {

      console.error(
        "Failed to load tag:",
        error
      );

    }

  }


  async function createTag() {

    const name =
      newTag.trim();


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


      setNewTag("");

      await loadTags();

    } catch (error) {

      console.error(
        "Failed to create tag:",
        error
      );

    }

  }


  async function deleteTag(
    tag: Tag
  ) {

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
        selectedTag?.id ===
        tag.id
      ) {

        setSelectedTag(null);

        setTracks([]);

      }


      await loadTags();

    } catch (error) {

      console.error(
        "Failed to delete tag:",
        error
      );

    }

  }


  if (selectedTag) {

    return (

      <div className="library-page">


        <button
          className="back-button"
          onClick={() => {
            setSelectedTag(null);
            setTracks([]);
          }}
        >
          ← Теги
        </button>


        <div className="page-title">

          <h1>
            #{selectedTag.name}
          </h1>

          <span>
            {tracks.length} треков
          </span>

        </div>


        {tracks.length === 0 ? (

          <div className="empty-library">

            <div className="empty-icon">
              #
            </div>

            <h2>
              В этом теге пока нет треков
            </h2>

          </div>

        ) : (

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
                        alt={
                          track.title
                        }
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

        )}

      </div>

    );

  }


  return (

    <div className="library-page">


      <div className="page-title">

        <h1>
          Теги
        </h1>

        <span>
          {tags.length}
        </span>

      </div>


      <div className="tag-create">

        <input
          value={newTag}
          onChange={(event) =>
            setNewTag(
              event.target.value
            )
          }
          placeholder="Новый тег..."
          onKeyDown={(event) => {

            if (
              event.key ===
              "Enter"
            ) {

              createTag();

            }

          }}
        />


        <button
          onClick={
            createTag
          }
        >
          + Добавить
        </button>

      </div>


      <div className="tag-grid">

        {tags.map(
          (tag) => (

            <div
              className="tag-card"
              key={tag.id}
              onClick={() =>
                openTag(tag)
              }
            >

              <span>
                #{tag.name}
              </span>


              <button
                onClick={(event) => {

                  event.stopPropagation();

                  deleteTag(tag);

                }}
              >
                ×
              </button>

            </div>

          )
        )}

      </div>

    </div>

  );

}