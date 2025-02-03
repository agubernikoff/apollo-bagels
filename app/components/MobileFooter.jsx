import {useLocation} from '@remix-run/react';
import React, {useState, useEffect} from 'react';
import {motion, useMotionValueEvent, useScroll} from 'framer-motion';
import Frame_89 from '../assets/Frame_89.png';
import Hours from './Hours';

export default function MobileFooter({hours}) {
  const {scrollYProgress} = useScroll();
  const [isFooterActive, setIsFooterActive] = useState(false);
  const [footerY, setFooterY] = useState(0); // Start at 100% off-screen

  function pxToDvh(px) {
    return (px / window.innerHeight) * 100;
  }
  useEffect(() => {
    const handleScroll = (e) => {
      if (isFooterActive) {
        e.preventDefault();
        const mainElement =
          document?.querySelectorAll('main')[
            document?.querySelectorAll('main').length - 1
          ];
        const computedStyles = getComputedStyle(mainElement);
        const headerHeight = parseInt(
          computedStyles.getPropertyValue('margin-top'),
          10,
        );
        setFooterY((prev) => {
          let newFooterY = Math.max(0, prev + e.deltaY * 0.2);
          if (newFooterY === 0) {
            if (document.body.offsetHeight !== window.innerHeight)
              setIsFooterActive(false);
            setIsSubscribeOpen(false);
            return 0;
          }
          if (newFooterY >= 100 - pxToDvh(headerHeight))
            newFooterY = 100 - pxToDvh(headerHeight);
          return newFooterY;
        });
      }
    };

    let startY = 0;
    let lastY = 0;
    let velocity = 0;
    let momentumID = null;

    const handleTouchStart = (e) => {
      if (isFooterActive) {
        e.preventDefault();
        startY = e.touches[0].clientY;
        lastY = startY;
        velocity = 0;
        if (momentumID) cancelAnimationFrame(momentumID); // Stop any existing momentum
      }
    };

    const handleTouchMove = (e) => {
      if (isFooterActive) {
        e.preventDefault();
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - lastY;
        lastY = touchY;

        // Compute velocity as a moving average (smooths sudden movements)
        velocity = 0.8 * velocity + 0.2 * deltaY;
        const mainElement =
          document?.querySelectorAll('main')[
            document?.querySelectorAll('main').length - 1
          ];
        const computedStyles = getComputedStyle(mainElement);
        const headerHeight = parseInt(
          computedStyles.getPropertyValue('margin-top'),
          10,
        );
        setFooterY((prev) => {
          let newFooterY = prev - deltaY * 0.2; // Apply scaled movement
          return Math.max(0, Math.min(100 - pxToDvh(headerHeight), newFooterY)); // Keep within bounds
        });
      }
    };

    const applyMomentum = () => {
      if (Math.abs(velocity) > 0.1) {
        const mainElement =
          document?.querySelectorAll('main')[
            document?.querySelectorAll('main').length - 1
          ];
        const computedStyles = getComputedStyle(mainElement);
        const headerHeight = parseInt(
          computedStyles.getPropertyValue('margin-top'),
          10,
        );
        setFooterY((prev) => {
          let newFooterY = prev - velocity * 0.5; // Apply inertia
          newFooterY = Math.max(
            0,
            Math.min(100 - pxToDvh(headerHeight), newFooterY),
          ); // Keep within bounds

          // Slow down velocity over time (friction effect)
          velocity *= 0.9;

          if (Math.abs(velocity) > 0.1) {
            momentumID = requestAnimationFrame(applyMomentum);
          }
          if (newFooterY === 0) setIsFooterActive(false);
          return newFooterY;
        });
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      applyMomentum();
    };

    if (isFooterActive) {
      window.addEventListener('wheel', handleScroll, {passive: false});
      window.addEventListener('touchstart', handleTouchStart, {passive: false});
      window.addEventListener('touchmove', handleTouchMove, {passive: false});
      window.addEventListener('touchend', handleTouchEnd, {passive: false});
    } else {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (momentumID) cancelAnimationFrame(momentumID);
    };
  }, [isFooterActive]);

  const {pathname} = useLocation();
  // Reset footer when the route changes
  useEffect(() => {
    if (document.body.scrollHeight !== window.innerHeight)
      setIsFooterActive(false);
    else setIsFooterActive(true);
    setFooterY(0);
    setIsSubscribeOpen(false);
  }, [pathname]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest >= 1) setIsFooterActive(true); // Activate manual scrolling;
    else {
      setIsFooterActive(false);
      setIsSubscribeOpen(false);
    }
  });

  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  return (
    <motion.div
      className="mobile-footer"
      style={{
        transform: `translateY(-${footerY}lvh)`,
      }}
      transition={{type: 'tween', duration: 0.5}}
      initial={{background: 'var(--red)'}}
      animate={{background: isSubscribeOpen ? 'var(--blue)' : 'var(--red)'}}
    >
      <img src={Frame_89} alt="Apollo Bagels in script" />
      <Hours hours={hours} mobile={true} />
      <div className="mobile-footer-bottom">
        <div className="mobile-footer-links">
          <a
            href="https://www.instagram.com/apollobagels/"
            target="_blank"
            rel="noopener noreferrer"
          >
            ig. @apollobagels
          </a>
          <a href="mailto:hello@apollobagels.com">e. hello@apollobagels.com</a>
        </div>
        <button onClick={() => setIsSubscribeOpen(true)}>SUBSCRIBE</button>
        <p>© Apollo Bagels 2024, All Rights Reserved.</p>
      </div>
    </motion.div>
  );
}
