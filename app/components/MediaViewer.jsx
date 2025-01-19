import React, {useState} from 'react';

const MediaViewer = ({file}) => {
  const [error, setError] = useState(false);

  if (!file) {
    return (
      <div className="media-placeholder">
        <p>No file provided.</p>
      </div>
    );
  }

  // Determine if the file is an image or video based on its MIME type
  const isImage = file.mimeType.startsWith('image/');
  const isVideo = file.mimeType.startsWith('video/');

  // Error message for unsupported file types
  if (!isImage && !isVideo) {
    return (
      <div className="media-placeholder">
        <p>Unsupported file type. Please upload an image or video.</p>
      </div>
    );
  }

  // Handle errors during loading
  const handleError = () => {
    setError(true);
  };

  // Render fallback content in case of an error
  if (error) {
    return (
      <div className="media-placeholder">
        <p>Failed to load the file. Please try again with a valid file.</p>
      </div>
    );
  }

  return (
    <div className="media-viewer">
      {isImage && (
        <img
          src={file.url}
          alt="Uploaded content"
          onError={handleError}
          className="media-element"
        />
      )}
      {isVideo && (
        <video
          src={file.url}
          controls
          onError={handleError}
          className="media-element"
        >
          <track kind="captions" />
        </video>
      )}
    </div>
  );
};

export default MediaViewer;
