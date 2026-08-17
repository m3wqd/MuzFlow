import { useRef, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000";

interface UploadModalProps {
  onClose: () => void;
  onUploaded: () => void;
}

function UploadModal({
  onClose,
  onUploaded,
}: UploadModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");

  const allowedExtensions = [
    ".mp3",
    ".flac",
    ".wav",
    ".ogg",
    ".m4a",
    ".aac",
  ];

  function addFiles(newFiles: File[]) {
    const validFiles = newFiles.filter((file) => {
      const extension =
        "." +
        file.name
          .split(".")
          .pop()
          ?.toLowerCase();

      return allowedExtensions.includes(extension);
    });

    setFiles((current) => {
      const combined = [...current, ...validFiles];

      return combined.filter(
        (file, index, array) =>
          array.findIndex(
            (item) =>
              item.name === file.name &&
              item.size === file.size
          ) === index
      );
    });
  }

  function handleFileSelect(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!event.target.files) {
      return;
    }

    addFiles(Array.from(event.target.files));

    event.target.value = "";
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setDragging(false);

    addFiles(
      Array.from(event.dataTransfer.files)
    );
  }

  function removeFile(index: number) {
    setFiles((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  async function uploadFiles() {
    if (files.length === 0 || uploading) {
      return;
    }

    setUploading(true);
    setProgress(0);

    let completed = 0;

    try {
      for (const file of files) {
        setCurrentFile(file.name);

        const formData = new FormData();

        formData.append("file", file);

        await axios.post(
          `${API_URL}/api/tracks/upload`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },

            onUploadProgress: (event) => {
              if (!event.total) {
                return;
              }

              const fileProgress =
                event.loaded / event.total;

              const totalProgress =
                ((completed + fileProgress) /
                  files.length) *
                100;

              setProgress(
                Math.round(totalProgress)
              );
            },
          }
        );

        completed++;

        setProgress(
          Math.round(
            (completed / files.length) * 100
          )
        );
      }

      setCurrentFile("");
      setFiles([]);

      onUploaded();
      onClose();

    } catch (error) {
      console.error(
        "Upload failed:",
        error
      );

      alert(
        "Не удалось загрузить один из файлов."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >

      <div
        className="upload-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="upload-header">

          <h2>
            Загрузка музыки
          </h2>

          <button
            className="close-button"
            onClick={onClose}
            disabled={uploading}
          >
            ×
          </button>

        </div>


        <div
          className={`drop-zone ${
            dragging ? "dragging" : ""
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={handleDrop}
          onClick={() =>
            inputRef.current?.click()
          }
        >

          <div className="upload-icon">
            ↑
          </div>

          <h3>
            Перетащи музыку сюда
          </h3>

          <p>
            или нажми, чтобы выбрать файлы
          </p>

          <span>
            MP3, FLAC, WAV, OGG, M4A, AAC
          </span>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".mp3,.flac,.wav,.ogg,.m4a,.aac"
            onChange={handleFileSelect}
            hidden
          />

        </div>


        {files.length > 0 && (

          <div className="selected-files">

            <div className="selected-header">

              <span>
                Выбрано: {files.length}
              </span>

              {!uploading && (
                <button
                  onClick={() => setFiles([])}
                >
                  Очистить
                </button>
              )}

            </div>


            <div className="file-list">

              {files.map((file, index) => (

                <div
                  className="file-item"
                  key={`${file.name}-${file.size}`}
                >

                  <div className="file-icon">
                    ♪
                  </div>


                  <div className="file-info">

                    <div className="file-name">
                      {file.name}
                    </div>

                    <div className="file-size">
                      {formatFileSize(file.size)}
                    </div>

                  </div>


                  {!uploading && (
                    <button
                      className="remove-file"
                      onClick={() =>
                        removeFile(index)
                      }
                    >
                      ×
                    </button>
                  )}

                </div>

              ))}

            </div>

          </div>

        )}


        {uploading && (

          <div className="upload-progress">

            <div className="progress-info">

              <span>
                Загружается: {currentFile}
              </span>

              <span>
                {progress}%
              </span>

            </div>


            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>

        )}


        <div className="upload-footer">

          <button
            className="cancel-button"
            onClick={onClose}
            disabled={uploading}
          >
            Отмена
          </button>


          <button
            className="upload-button"
            onClick={uploadFiles}
            disabled={
              files.length === 0 ||
              uploading
            }
          >
            {uploading
              ? "Загрузка..."
              : `Загрузить${
                  files.length
                    ? ` (${files.length})`
                    : ""
                }`}
          </button>

        </div>

      </div>

    </div>
  );
}


function formatFileSize(
  bytes: number
) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(1)} MB`;
}


export default UploadModal;