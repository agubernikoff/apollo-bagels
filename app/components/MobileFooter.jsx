import {useLocation} from '@remix-run/react';
import React, {useState, useEffect, useRef} from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useInView,
} from 'framer-motion';
import Frame_89 from '../assets/Frame_89.png';
import Hours from './Hours';
import {SubscribeForm} from './Footer';

export default function MobileFooter({hours}) {
  const {scrollYProgress} = useScroll();
  const [isFooterActive, setIsFooterActive] = useState(false);
  const [footerY, setFooterY] = useState(0); // Start at 100% off-screen
  const ref = useRef(null);
  const isInView = useInView(ref);
  useEffect(() => {
    const mainElement =
      document?.querySelectorAll('main')[
        document?.querySelectorAll('main').length - 1
      ];

    if (isInView) mainElement.style.overflow = 'hidden';
    else {
      mainElement.style.overflow = 'scroll';
    }
  }, [isInView]);
  //   function pxToDvh(px) {
  //     return (px / window.innerHeight) * 100;
  //   }
  //   useEffect(() => {
  //     console.log('does this trigger right away?');
  //     const handleScroll = (e) => {
  //       if (isFooterActive) {
  //         e.preventDefault();
  //         const mainElement =
  //           document?.querySelectorAll('main')[
  //             document?.querySelectorAll('main').length - 1
  //           ];
  //         const computedStyles = getComputedStyle(mainElement);
  //         const headerHeight = parseInt(
  //           computedStyles.getPropertyValue('margin-top'),
  //           10,
  //         );
  //         setFooterY((prev) => {
  //           let newFooterY = Math.max(0, prev + e.deltaY * 0.2);
  //           if (newFooterY === 0) {
  //             if (document.body.offsetHeight !== window.innerHeight)
  //               setIsFooterActive(false);
  //             setIsSubscribeOpen(false);
  //             return 0;
  //           }
  //           if (newFooterY >= 100 - pxToDvh(headerHeight))
  //             newFooterY = 100 - pxToDvh(headerHeight);
  //           return newFooterY;
  //         });
  //       }
  //     };

  //     let startY = 0;
  //     let lastY = 0;
  //     let velocity = 0;
  //     let momentumID = null;

  //     const handleTouchStart = (e) => {
  //       if (isFooterActive) {
  //         // e.preventDefault();
  //         startY = e.touches[0].clientY;
  //         lastY = startY;
  //         velocity = 0;
  //         if (momentumID) cancelAnimationFrame(momentumID); // Stop any existing momentum
  //       }
  //     };

  //     const handleTouchMove = (e) => {
  //       const touchY = e.touches[0].clientY;
  //       const deltaY = touchY - lastY;
  //       lastY = touchY;

  //       // Compute velocity as a moving average (smooths sudden movements)
  //       velocity = 0.8 * velocity + 0.2 * deltaY;
  //       if (isFooterActive) {
  //         e.preventDefault();
  //         const mainElement =
  //           document?.querySelectorAll('main')[
  //             document?.querySelectorAll('main').length - 1
  //           ];
  //         const computedStyles = getComputedStyle(mainElement);
  //         const headerHeight = parseInt(
  //           computedStyles.getPropertyValue('margin-top'),
  //           10,
  //         );
  //         setFooterY((prev) => {
  //           let newFooterY = prev - deltaY * 0.2; // Apply scaled movement
  //           return Math.max(0, Math.min(100 - pxToDvh(headerHeight), newFooterY)); // Keep within bounds
  //         });
  //       }
  //     };

  //     const applyMomentum = () => {
  //       if (Math.abs(velocity) > 0.1) {
  //         const mainElement =
  //           document?.querySelectorAll('main')[
  //             document?.querySelectorAll('main').length - 1
  //           ];
  //         const computedStyles = getComputedStyle(mainElement);
  //         const headerHeight = parseInt(
  //           computedStyles.getPropertyValue('margin-top'),
  //           10,
  //         );
  //         if (isFooterActive)
  //           setFooterY((prev) => {
  //             let newFooterY = prev - velocity * 0.5; // Apply inertia
  //             newFooterY = Math.max(
  //               0,
  //               Math.min(100 - pxToDvh(headerHeight), newFooterY),
  //             ); // Keep within bounds

  //             // Slow down velocity over time (friction effect)
  //             velocity *= 0.9;

  //             if (Math.abs(velocity) > 0.1) {
  //               momentumID = requestAnimationFrame(applyMomentum);
  //             }
  //             if (newFooterY === 0) setIsFooterActive(false);
  //             return newFooterY;
  //           });
  //       }
  //     };

  //     const handleTouchEnd = (e) => {
  //       //   e.preventDefault();
  //       applyMomentum();
  //     };

  //     // if (isFooterActive) {
  //     window.addEventListener('wheel', handleScroll, {passive: false});
  //     window.addEventListener('touchstart', handleTouchStart, {passive: false});
  //     window.addEventListener('touchmove', handleTouchMove, {passive: false});
  //     window.addEventListener('touchend', handleTouchEnd, {passive: false});
  //     window.addEventListener(
  //       'scroll',
  //       () => {
  //         console.log(velocity, isFooterActive, scrollYProgress.current);
  //       },
  //       {passive: false},
  //     );

  //     // } else {
  //     //   window.removeEventListener('wheel', handleScroll);
  //     //   window.removeEventListener('touchstart', handleTouchStart);
  //     //   window.removeEventListener('touchmove', handleTouchMove);
  //     //   window.removeEventListener('touchend', handleTouchEnd);
  //     // }

  //     return () => {
  //       window.removeEventListener('wheel', handleScroll);
  //       window.removeEventListener('touchstart', handleTouchStart);
  //       window.removeEventListener('touchmove', handleTouchMove);
  //       window.removeEventListener('touchend', handleTouchEnd);
  //       if (momentumID) cancelAnimationFrame(momentumID);
  //     };
  //   }, [isFooterActive]);

  const {pathname} = useLocation();
  // Reset footer when the route changes
  useEffect(() => {
    const mainElement =
      document?.querySelectorAll('main')[
        document?.querySelectorAll('main').length - 1
      ];
    mainElement.scrollTo({top: 0});
    document.body.scrollTo({top: 0, behavior: 'smooth'});
  }, [pathname]);

  //   useMotionValueEvent(scrollYProgress, 'change', (latest) => {
  //     if (latest >= 1) setIsFooterActive(true); // Activate manual scrolling;
  //     else {
  //       setIsFooterActive(false);
  //       setIsSubscribeOpen(false);
  //     }
  //   });

  useEffect(() => {
    const mainElement =
      document?.querySelectorAll('main')[
        document?.querySelectorAll('main').length - 1
      ];

    let startY = 0;
    let lastY = 0;
    let velocity = 0;
    let momentumID = null;

    const handleTouchMove = (e) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchY - lastY;
      lastY = touchY;

      // Compute velocity as a moving average to smooth out sudden changes
      velocity = 0.8 * velocity + 0.2 * deltaY;

      //   // Prevent default scrolling while interacting with the fixed element
      //   e.preventDefault();

      // Check if the user is at the bottom of the page or near the bottom
      const atBottom =
        mainElement.scrollTop + mainElement.clientHeight >=
        mainElement.scrollHeight;
    };

    const applyMomentum = (e) => {
      const atBottom =
        mainElement.scrollTop + mainElement.clientHeight >=
        mainElement.scrollHeight;
      if (Math.abs(velocity) > 0.1) {
        // Check if the user is at the bottom

        if (atBottom) {
          //   window.scrollBy(0, -velocity * 0.5); // Apply inertia
          if (!isInView && e.type === 'scroll') {
            document.body.scrollTo({top: 100, behavior: 'smooth'});
          }
          if (isInView && e.type === 'scroll') e.preventDefault();
          // Slow down velocity over time to simulate friction
          velocity *= 0.9;

          // Continue applying momentum if still above a threshold
          if (Math.abs(velocity) > 0.1) {
            momentumID = requestAnimationFrame(applyMomentum);
          }
        }
      }
    };

    function allowScroll(e) {
      const atBottom =
        mainElement.scrollTop + mainElement.clientHeight >=
        mainElement.scrollHeight;
      console.log('allowscroll: ', atBottom);

      if (atBottom) {
        mainElement.style.overflow = 'hidden';
        document.body.scrollTo({top: 105, behavior: 'smooth'});
      } else mainElement.style.overflow = 'scroll';
    }
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
      lastY = startY;
      velocity = 0;

      // Cancel any existing momentum animations
      if (momentumID) cancelAnimationFrame(momentumID);
    };
    function hanldeTouchMove2(e) {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - lastY;
        lastY = touchY;

        if (!isVisible && mainElement.style.overflow !== 'scroll') {
          mainElement.style.overflow = 'scroll';
          mainElement.scrollBy({top: -deltaY});
        }
      }
    }
    const handleTouchEnd = (e) => {
      // Start the momentum effect once touch ends
      //   applyMomentum(e);
    };

    // mainElement.addEventListener('wheel', handleScroll);
    // mainElement.addEventListener('touchstart', handleTouchStart);
    // mainElement.addEventListener('touchmove', handleTouchMove, {
    //   passive: false,
    // });
    // mainElement.addEventListener('touchend', handleTouchEnd);
    // mainElement.addEventListener('scroll', handleTouchEnd, {passive: false});
    mainElement.addEventListener('scroll', allowScroll);
    // mainElement.addEventListener('touchmove', hanldeTouchMove2);
    return () => {
      mainElement.removeEventListener('touchstart', handleTouchStart);
      mainElement.removeEventListener('touchmove', hanldeTouchMove2);
      mainElement.removeEventListener('touchend', handleTouchEnd);
      mainElement.removeEventListener('scroll', handleTouchEnd);
      if (momentumID) cancelAnimationFrame(momentumID);
    };
  }, [isInView]);

  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  return (
    <motion.div
      ref={ref}
      className="mobile-footer"
      style={{
        marginBottom: `calc(80lvh - ${
          ref?.current?.offsetHeight || 0
        }px - var(--header-height) )`,
      }}
      transition={{type: 'tween', duration: 0.5}}
      initial={{background: 'var(--red)'}}
      animate={{background: isSubscribeOpen ? 'var(--blue)' : 'var(--red)'}}
    >
      <AnimatePresence mode="wait">
        {isSubscribeOpen ? (
          <motion.div
            key="open"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="mobile-footer-info"
          >
            <SubscribeForm close={() => setIsSubscribeOpen(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="close"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="mobile-footer-info"
          >
            {/* Empty spacer to push logo to center */}
            <div className="mobile-footer-spacer"></div>

            {/* Centered logo */}
            <img src={Frame_89} alt="Apollo Bagels in script" />

            {/* Bottom content that gets pushed to bottom */}
            <div className="mobile-footer-bottom">
              <div className="mobile-footer-links">
                <a
                  href="https://www.instagram.com/apollobagels/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ig. @apollobagels
                </a>
                <a href="mailto:hello@apollobagels.com">
                  e. hello@apollobagels.com
                </a>
                <button
                  onClick={() => {
                    setIsSubscribeOpen(true);
                  }}
                >
                  subscribe
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
