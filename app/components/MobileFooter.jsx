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
            {/* <img src={Frame_89} alt="Apollo Bagels in script" /> */}
            <Svg />

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

export function Svg() {
  return (
    <svg
      width="272"
      height="197"
      viewBox="0 0 272 197"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M25.2125 81.4326C29.3472 81.4042 29.1012 78.0517 24.9634 77.6354C19.5925 77.115 18.6873 75.5571 20.2106 69.3977C21.0779 65.815 22.494 60.5513 24.1308 54.7262C24.3452 53.4962 25.0138 53.0421 26.1303 53.0358L43.0094 52.9159C44.1259 52.9065 44.8008 53.3511 45.1446 54.4676C46.9738 60.0435 48.803 66.0673 49.7207 69.3031C51.2156 74.8822 49.8879 76.9037 44.0786 77.503C39.9471 77.9792 39.8588 81.3348 43.9934 81.3033C48.5759 81.2718 54.606 80.4455 59.0781 80.4139C63.5502 80.3824 67.5776 80.8018 72.0497 81.1046C72.1001 81.1078 72.1474 81.1078 72.1947 81.1109C72.179 84.7599 72.1222 88.412 71.974 91.468C71.6775 96.9493 69.3468 99.0876 63.3136 99.69C59.2925 100.166 59.5385 103.519 63.4524 103.49C68.0349 103.459 71.0467 102.655 76.4114 102.617C81.1074 102.582 86.2512 102.995 90.6129 103.298C94.1925 103.607 94.8359 99.8035 90.6981 99.4976C83.8764 99.1002 80.7289 96.4384 80.6911 91.1842L80.4892 78.4428C80.4734 76.4307 80.587 76.3171 82.2743 77.7584C84.5261 79.8652 88.5693 82.7446 95.2774 82.6973C107.574 82.609 119.89 69.6658 119.738 48.7655C119.603 29.8742 108.47 20.3403 98.1852 20.416C89.3546 20.4791 82.1324 26.6794 79.4106 36.5351C79.193 37.3204 78.4109 37.3235 78.4046 36.7653C78.3825 33.7471 79.8868 25.0174 80.0887 22.3335C80.1865 20.3214 78.168 19.4415 76.3861 20.6841C74.2731 22.0402 70.2551 23.2986 65.2343 24.2289C61.4403 24.9259 61.6831 27.9441 65.2627 28.2532C68.8422 28.5623 70.7534 30.1139 71.1098 33.0186C71.5797 36.3679 71.9834 45.7568 72.0276 51.7932L72.1663 71.0188C72.179 72.9236 72.1947 75.0651 72.201 77.2917C65.3667 76.642 61.3677 73.8824 59.5574 68.9057C57.3908 62.9955 52.6001 49.3931 50.9949 44.0411L38.1778 2.32578C37.607 0.540724 35.4782 -0.225648 34.0306 0.903413C31.4728 2.59701 27.231 3.63461 22.9891 4.44829C19.3055 5.14528 19.9961 8.15716 23.7996 8.46623C29.3913 8.98345 32.5451 12.317 31.2331 16.3507C26.7642 32.2554 20.4314 53.3165 15.1803 69.2274C13.5403 74.3807 9.64852 77.093 2.83315 77.812C-1.29833 78.2883 -0.714875 81.9751 3.30938 81.6092C7.77831 81.2434 12.0233 80.764 14.2562 80.7482C16.9401 80.7293 20.6332 81.4862 25.2157 81.4515L25.2125 81.4326ZM93.3189 28.4866C103.152 28.1933 110.157 38.3138 110.261 53.0673C110.362 67.2626 103.73 77.708 94.6782 77.771C86.6297 77.8278 80.6595 71.1638 80.4798 61.6646L80.2937 51.3832C80.0887 38.194 85.4975 28.7673 93.3189 28.4866ZM26.1965 47.2201C28.8142 38.2602 31.6557 28.9596 33.5102 22.8003C33.9486 21.6807 34.3964 21.564 34.8506 22.7908L41.5934 43.423C41.9371 44.4259 42.3913 45.6527 42.7382 47.1035C43.1955 48.3303 42.7508 49.0052 41.4105 49.0147L27.663 49.1124C26.4331 49.1219 25.8685 48.4564 26.1965 47.2233V47.2201Z"
        fill="#F1F0E4"
      />
      <path
        d="M147.491 82.3141C162.582 82.2068 173.995 68.1503 173.866 50.1547C173.762 35.5116 164.26 19.8183 149.617 19.9224C134.526 20.0296 123.115 34.083 123.241 52.0817C123.396 73.5433 135.866 82.3961 147.491 82.3141ZM144.634 26.7788C158.16 26.681 165.884 44.0647 165.991 58.9318C166.06 68.8789 160.185 75.628 151.244 75.6942C141.073 75.7668 131.365 62.5334 131.148 48.0038C130.94 34.4803 135.692 26.845 144.634 26.7819V26.7788Z"
        fill="#F1F0E4"
      />
      <path
        d="M172.919 8.35067C176.498 8.65975 178.409 10.2114 178.766 13.1161C179.236 16.2415 179.709 35.5774 179.756 42.172C179.8 48.2084 179.901 62.2902 179.605 68.1058C179.311 73.6975 177.201 75.8357 171.171 76.5485C166.926 77.0279 167.175 80.3772 171.31 80.3488C175.893 80.3173 180.024 79.5036 184.383 79.4721C187.871 79.4468 191.772 79.6045 195.326 79.9451C197.786 80.1817 199.404 80.2952 202.157 79.9641C202.167 79.9641 208.389 79.2828 211.543 79.2608C216.015 79.2292 221.159 79.6392 225.41 79.9451C229.324 80.2542 229.523 76.5643 225.496 76.1448C218.784 75.5235 215.637 72.8617 215.489 67.9449C215.334 62.0221 214.902 48.3882 214.864 43.0236C214.653 13.627 214.609 7.14276 214.908 2.22283C215.006 0.210707 212.988 -0.669202 211.206 0.573396C209.093 1.92953 205.078 3.18789 200.054 4.11827C196.257 4.81526 196.503 7.83345 200.082 8.14252C203.662 8.45159 205.573 10.0033 205.929 12.9079C206.399 16.0333 206.872 35.3693 206.92 41.9639C206.964 48.0003 207.065 62.0852 206.771 67.8976C206.475 73.4893 203.293 76.3403 198.338 76.3403C191.501 76.3403 188.479 73.0762 188.331 68.1562C188.177 62.2334 187.745 48.5995 187.707 43.2349C187.495 13.8383 187.451 7.35407 187.751 2.43414C187.849 0.422011 185.83 -0.457898 184.048 0.7847C181.935 2.14083 177.917 3.3992 172.896 4.32958C169.102 5.02657 169.345 8.04475 172.925 8.35383L172.919 8.35067Z"
        fill="#F1F0E4"
      />
      <path
        d="M245.513 81.5699C260.604 81.4627 272.015 67.4062 271.889 49.4106C271.784 34.7675 262.282 19.0742 247.639 19.1782C232.548 19.2855 221.138 33.342 221.264 51.3376C221.418 72.7992 233.888 81.6519 245.513 81.5699ZM242.656 26.0315C256.183 25.9337 263.906 43.3175 264.014 58.1845C264.083 68.1316 258.207 74.8807 249.266 74.9469C239.095 75.0195 229.388 61.7861 229.17 47.2566C228.962 33.733 233.715 26.0977 242.656 26.0346V26.0315Z"
        fill="#F1F0E4"
      />
      <path
        d="M40.5425 132.266H40.4321L40.8768 132.153C47.2349 130.207 57.1441 124.659 57.0716 114.599C56.977 101.186 44.6361 95.1272 33.1216 95.0957C28.2048 95.1304 24.0734 95.9441 19.6013 95.9756C15.2427 96.0071 11.1018 95.2534 6.51929 95.2881C2.38465 95.3165 2.18281 98.6721 6.43413 99.0884C12.4737 99.716 14.6151 101.826 14.9904 107.411C15.2332 110.316 15.4477 124.398 15.5297 135.912C15.6275 149.436 15.577 158.38 15.3846 162.628C15.0882 168.22 12.9814 170.358 6.9482 171.071C2.70319 171.547 2.95234 174.9 7.08697 174.871C11.6694 174.84 15.8009 174.026 20.1595 173.994C25.748 173.953 30.895 174.701 37.3792 174.654C52.2463 174.546 61.8023 166.542 61.714 154.248C61.6257 142.065 50.395 134.433 40.5425 132.266ZM24.6316 127.015C24.6883 119.525 24.742 111.366 24.824 107.228C24.8996 101.974 27.4511 99.2745 32.1439 99.2398C41.5328 99.284 47.1623 104.945 47.2317 114.671C47.3263 127.974 40.1893 130.147 27.7822 130.349C25.5462 130.365 24.5338 129.255 24.6284 127.018L24.6316 127.015ZM37.6946 171.301C28.864 171.364 25.4957 169.153 25.2245 162.672C24.9722 158.872 24.7672 145.572 24.6 137.751C24.5843 135.628 25.6944 134.502 27.9304 134.487C44.0306 134.818 51.5619 141.025 51.6597 154.327C51.7101 161.37 47.9792 171.232 37.6978 171.307L37.6946 171.301Z"
        fill="#F1F0E4"
      />
      <path
        d="M146.686 160.425C134.503 160.513 122.37 167.755 116.558 167.796C113.874 167.815 112.187 166.149 112.168 163.693C112.136 159.22 118.037 155.937 126.534 155.877C140.171 155.78 149.831 146.656 149.739 133.914C149.73 132.46 149.607 131.01 149.373 129.559C148.913 127.55 148.557 124.869 149.894 124.078C151.565 123.172 154.59 124.043 157.16 123.914C161.519 123.772 163.742 122.078 164.278 118.719C164.701 115.474 162.897 113.14 159.768 113.162C156.64 113.184 153.521 114.771 150.745 117.587C147.194 121.078 146.078 121.532 145.062 120.198C141.341 115.755 136.181 113.333 130.369 113.374C118.409 113.459 109.311 123.138 109.399 135.431C109.44 141.354 112.278 147.372 116.552 150.806C118.012 151.913 118.018 152.471 116.123 153.49C110.219 156.439 106.346 161.832 106.384 166.972C106.387 167.534 106.437 168.079 106.529 168.606C102.208 169.18 99.2216 166.373 99.19 161.693L98.9346 126.146C98.8778 118.322 94.4846 113.657 87.2214 113.711C76.2682 113.79 66.4914 122.58 62.5334 131.439C60.9943 134.914 62.2432 137.588 65.1479 137.57C69.8408 137.535 72.8369 134.16 73.6884 128.231C74.5399 122.188 77.8672 118.476 82.56 118.442C87.1425 118.41 89.962 121.744 89.9999 127.108L90.085 138.844C90.1071 141.972 87.7701 143.555 82.2068 147.173C74.7512 152.033 64.3973 157.808 64.4604 166.528C64.5014 172.116 68.554 176.112 74.3665 176.071C80.1789 176.03 84.7299 171.75 88.2873 168.817C88.732 168.366 89.2871 168.139 89.6246 168.136C90.1828 168.133 90.7442 168.351 91.4222 169.24C93.674 171.684 96.4872 174.233 101.631 174.198C102.707 174.192 105.403 173.829 107.992 172.082C108.371 172.599 108.819 173.091 109.342 173.548C110.916 174.879 111.033 175.324 109.812 176.787C107.819 179.597 106.945 182.284 106.967 185.302C107.018 192.345 113.31 196.77 122.922 196.703C139.13 196.587 162.089 187.258 161.982 172.28C161.929 164.904 156.085 160.362 146.696 160.428L146.686 160.425ZM129.501 117.515C135.985 117.467 140.281 124.144 140.353 134.428C140.429 144.823 136.228 151.56 129.747 151.607C123.153 151.654 118.857 144.978 118.781 134.583C118.709 124.298 122.907 117.562 129.501 117.515ZM80.7813 167.417C76.757 167.446 74.1709 165.452 74.1489 162.324C74.1205 158.523 77.6653 154.026 83.7869 150.071C85.6792 148.829 88.1297 147.693 88.9118 147.687C89.8075 147.681 90.1449 148.125 90.1544 149.579L90.2269 159.974C90.2585 164.557 86.7041 167.376 80.7781 167.42L80.7813 167.417ZM129.123 189.727C120.068 189.79 114.795 186.813 114.757 181.669C114.694 172.728 122.711 168.31 139.701 168.19C149.427 168.12 154.252 170.88 154.29 176.358C154.341 183.287 149.131 189.585 129.123 189.727Z"
        fill="#F1F0E4"
      />
      <path
        d="M201.561 159.142C197.908 164.087 192.005 167.036 185.41 167.193C175.573 167.376 168.572 157.366 168.468 142.609C168.446 139.705 169.556 138.355 171.678 138.339L199.287 138.14C213.706 138.036 203.131 112.85 183.792 112.989C169.821 113.09 159.416 127.585 159.555 146.921C159.681 164.358 169.035 175.358 183.792 175.251C191.841 175.194 199.962 169.88 204.484 161.576C207.133 156.975 204.661 155.092 201.561 159.138V159.142ZM169.502 131.312C171.117 122.693 176.113 117.962 183.492 117.909C190.645 117.858 195.713 123.075 195.767 130.341C195.795 134.476 191.661 134.394 172.435 134.532C169.754 134.551 169.076 133.772 169.505 131.312H169.502Z"
        fill="#F1F0E4"
      />
      <path
        d="M231.418 169.438C224.706 168.816 221.559 166.155 221.411 161.238C221.256 155.315 220.824 141.681 220.786 136.317C220.575 106.92 220.531 100.436 220.83 95.5158C220.928 93.5037 218.91 92.6238 217.128 93.8664C215.015 95.2225 211 96.4809 205.976 97.4113C202.179 98.1082 202.425 101.126 206.004 101.435C209.584 101.745 211.495 103.296 211.851 106.201C212.321 109.326 212.794 128.662 212.842 135.257C212.886 141.293 212.987 155.375 212.693 161.191C212.397 166.782 210.29 168.921 204.26 169.633C200.015 170.113 200.264 173.462 204.399 173.434C208.981 173.402 213.113 172.588 217.471 172.557C221.944 172.525 227.087 172.935 231.339 173.241C235.253 173.55 235.451 169.86 231.424 169.441L231.418 169.438Z"
        fill="#F1F0E4"
      />
      <path
        d="M240.194 125.322C240.159 120.405 243.821 116.69 248.627 116.655C254.774 116.611 261.072 122.042 263.813 129.961C265.065 133.194 268.077 132.39 267.159 128.93C265.894 124.133 265.551 122.906 264.062 117.999C263.031 114.542 257.985 112.454 250.608 112.505C240.547 112.577 232.887 119.787 232.953 129.062C233.076 146.389 262.479 146.736 262.57 159.701C262.618 166.52 258.962 170.907 253.26 170.948C245.436 171.005 238.56 163.117 236.059 157.21C234.58 153.643 231.341 154.113 232.038 157.797C232.619 160.698 234.11 166.167 234.908 168.396C235.593 170.182 235.936 171.408 237.617 172.178C240.869 173.496 244.231 174.925 251.945 174.871C261.671 174.802 270.111 167.028 270.048 158.197C269.897 136.849 240.279 137.842 240.191 125.322H240.194Z"
        fill="#F1F0E4"
      />
    </svg>
  );
}
