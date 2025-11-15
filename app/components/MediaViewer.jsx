import React, {useState, useRef, useEffect} from 'react';
import {optimizeImageUrl, imagePresets} from '~/sanity/imageUrlBuilder';

/**
 * Optimized MediaViewer that only loads videos when they enter the viewport
 * Much better UX than hover - videos play automatically when scrolled into view
 */
const MediaViewer = ({file, posterImage}) => {
  const [error, setError] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Determine if the file is an image or video based on its MIME type
  const isImage = file?.mimeType?.startsWith('image/');
  const isVideo =
    file?.mimeType?.startsWith('video/') || file.__typename === 'Video';

  useEffect(() => {
    if (!isVideo) return;

    const target = videoRef.current || containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          // Load & play when visible
          setShouldLoadVideo(true);

          requestAnimationFrame(() => {
            if (videoRef.current) {
              videoRef.current.play().catch(() => {});
            }
          });
        } else {
          // Pause immediately when leaving viewport
          setShouldLoadVideo(false);
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }
      },
      {
        threshold: 0.35, // play when 35% visible
        rootMargin: '0px 0px 200px 0px', // preload a bit before entering
      },
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [isVideo]);

  if (!file) {
    return (
      <div className="media-placeholder">
        <p>No file provided.</p>
      </div>
    );
  }

  // Error message for unsupported file types
  if (!isImage && !isVideo) {
    return (
      <div className="media-placeholder">
        <p>Unsupported file type. Please upload an image or video.</p>
      </div>
    );
  }

  // Use Intersection Observer to detect when video enters viewport

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
    <div ref={containerRef} className="media-viewer">
      {isImage && (
        <img
          src={optimizeImageUrl(file.url, imagePresets.location)}
          alt="Uploaded content"
          onError={handleError}
          className="media-element"
        />
      )}
      {isVideo && (
        <>
          {/* Fallback if no poster image */}
          {!shouldLoadVideo && !file.previewImage && (
            <div
              className="media-element video-placeholder"
              style={{
                backgroundColor: '#E0DFD1',
                width: '100%',
                height: '100%',
              }}
            />
          )}

          {/* Show poster image before video loads */}
          {!shouldLoadVideo && (
            <img
              src={file.previewImage?.url}
              alt="Video thumbnail"
              className="media-element"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}

          {/* Only load video when in viewport - saves massive bandwidth! */}
          {shouldLoadVideo && (
            <video
              ref={videoRef}
              src={file.sources.find((src) => src.url.includes('HD-1080')).url}
              poster={file.previewImage.url}
              loop
              muted
              playsInline
              preload="auto"
              onError={handleError}
              className="media-element"
            >
              <track kind="captions" />
            </video>
          )}
        </>
      )}
    </div>
  );
};

export default MediaViewer;
