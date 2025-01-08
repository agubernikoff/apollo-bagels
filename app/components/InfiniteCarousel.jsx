import React, {useRef, useEffect, useState} from 'react';
import {motion, useAnimationFrame} from 'framer-motion';

const InfiniteCarousel = ({images, scrollDirection = 'down'}) => {
  const trackRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [itemHeight, setItemHeight] = useState(1); // Height of each carousel item set to 100vh
  const [startY, setStartY] = useState(0); // Track touch start position
  const totalHeight = images.length * itemHeight; // Total height of the carousel
  const speed = 2; // Scrolling speed

  useEffect(() => {
    setItemHeight(window?.innerHeight);
  }, []);

  useAnimationFrame(() => {
    setOffset((prevOffset) => {
      const newOffset =
        scrollDirection === 'down'
          ? (prevOffset + speed) % totalHeight
          : (prevOffset - speed + totalHeight) % totalHeight;
      return newOffset;
    });
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
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY; // Get the current touch position
    const deltaY = startY - currentY; // Calculate the distance moved
    setStartY(currentY); // Update startY for continuous scrolling

    setOffset((prevOffset) => {
      const newOffset = (prevOffset + deltaY + totalHeight) % totalHeight;
      return newOffset;
    });
  };

  return (
    <div
      className="carousel"
      style={{overflow: 'hidden', height: `100vh`}}
      onWheel={handleScroll} // For desktop
      onTouchStart={handleTouchStart} // For mobile touch start
      onTouchMove={handleTouchMove} // For mobile touch move
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
