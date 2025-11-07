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

  if (!file) {
    return (
      <div className="media-placeholder">
        <p>No file provided.</p>
      </div>
    );
  }

  // Determine if the file is an image or video based on its MIME type
  const isImage = file.mimeType?.startsWith('image/');
  const isVideo = file.mimeType?.startsWith('video/');

  // Error message for unsupported file types
  if (!isImage && !isVideo) {
    return (
      <div className="media-placeholder">
        <p>Unsupported file type. Please upload an image or video.</p>
      </div>
    );
  }

  // Use Intersection Observer to detect when video enters viewport
  useEffect(() => {
    if (!isVideo || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video is visible - load and play it
            setShouldLoadVideo(true);
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.play().catch(() => {
                  // Ignore autoplay errors
                });
                setIsPlaying(true);
              }
            }, 100);
          } else {
            // Video is out of view - pause it
            if (videoRef.current && isPlaying) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      {
        threshold: 0.5, // Video must be 50% visible to start playing
        rootMargin: '50px', // Start loading slightly before it enters viewport
      },
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isVideo, isPlaying]);

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
          {/* Show poster image before video loads */}
          {!shouldLoadVideo && posterImage?.asset?.url && (
            <img
              src={optimizeImageUrl(
                posterImage.asset.url,
                imagePresets.location,
              )}
              alt="Video thumbnail"
              className="media-element"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}

          {/* Fallback if no poster image */}
          {!shouldLoadVideo && !posterImage?.asset?.url && (
            <div
              className="media-element video-placeholder"
              style={{
                backgroundColor: '#E0DFD1',
                width: '100%',
                height: '100%',
              }}
            />
          )}

          {/* Only load video when in viewport - saves massive bandwidth! */}
          {shouldLoadVideo && (
            <video
              ref={videoRef}
              src={file.url}
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
