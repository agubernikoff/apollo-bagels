import React, {useRef, useEffect, useState} from 'react';
import {motion, useAnimationFrame} from 'framer-motion';

const InfiniteCarousel = ({images, scrollDirection = 'down'}) => {
  const trackRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [velocity, setVelocity] = useState(0); // Track swipe velocity
  const [itemHeight, setItemHeight] = useState(1); // Height of each carousel item set to 100vh
  const [startY, setStartY] = useState(0); // Track touch start position
  const totalHeight = images.length * itemHeight; // Total height of the carousel
  const speed = 2; // Auto scrolling speed
  const deceleration = 0.95; // Deceleration factor for swipe momentum

  useEffect(() => {
    setItemHeight(window?.innerHeight);
  }, []);

  useAnimationFrame(() => {
    if (!isPaused && velocity === 0) {
      // Auto-scroll when no momentum is active
      setOffset((prevOffset) => {
        const newOffset =
          scrollDirection === 'down'
            ? (prevOffset + speed) % totalHeight
            : (prevOffset - speed + totalHeight) % totalHeight;
        return newOffset;
      });
    } else if (velocity !== 0) {
      // Apply swipe momentum
      setOffset((prevOffset) => {
        const newOffset = (prevOffset + velocity + totalHeight) % totalHeight;
        return newOffset;
      });

      // Gradually reduce velocity
      setVelocity((prevVelocity) => {
        const newVelocity = prevVelocity * deceleration;
        return Math.abs(newVelocity) < speed ? 0 : newVelocity; // Stop when velocity is negligible
      });
    }
  });

  const visibleImages = [...images, ...images]; // Duplicate images for infinite scrolling

  const handleScroll = (e) => {
    const delta = e.deltaY;
    setOffset((prevOffset) => {
      const newOffset = (prevOffset + delta + totalHeight) % totalHeight;
      return newOffset;
    });
  };

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY); // Capture the initial touch position
    setIsPaused(true);
    setVelocity(0); // Reset velocity when a new touch starts
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent default touch behavior
    const currentY = e.touches[0].clientY; // Get the current touch position
    const deltaY = startY - currentY; // Calculate the distance moved
    setStartY(currentY); // Update startY for continuous scrolling

    setOffset((prevOffset) => {
      const newOffset = (prevOffset + deltaY + totalHeight) % totalHeight;
      return newOffset;
    });

    // Update velocity based on movement
    setVelocity(deltaY);
  };

  const handleTouchEnd = () => {
    setIsPaused(false); // Allow auto-scroll to resume after momentum
  };

  return (
    <div
      className="carousel"
      style={{overflow: 'hidden', height: `100vh`, touchAction: 'none'}}
      onWheel={handleScroll} // For desktop
      onTouchStart={handleTouchStart} // For mobile touch start
      onTouchMove={handleTouchMove} // For mobile touch move
      onTouchEnd={handleTouchEnd} // For mobile touch end
    >
      <motion.div
        ref={trackRef}
        className="carousel-track"
        style={{
          transform: `translateY(-${offset}px)`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {visibleImages.map((image, index) => (
          <motion.div
            className="carousel-item"
            key={index}
            style={{height: '100vh'}}
          >
            <img
              src={image}
              alt={`Carousel item ${index}`}
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default InfiniteCarousel;
