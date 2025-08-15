// contexts/AnimationContext.jsx
import {createContext, useContext, useState, useEffect, useRef} from 'react';

const AnimationContext = createContext();

export function AnimationProvider({children}) {
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasSetAnimation = useRef(false);

  useEffect(() => {
    // Only set shouldAnimate once when provider first mounts
    if (!hasSetAnimation.current) {
      // Check if this is a page reload/refresh by looking at navigation type
      const isPageReload =
        window.performance.navigation.type === 1 ||
        window.performance.getEntriesByType('navigation')[0]?.type === 'reload';

      // Check if user came from another page on the same site
      const isInternalNavigation =
        document.referrer &&
        new URL(document.referrer).origin === window.location.origin;

      // Only animate if it's not a reload and not internal navigation
      setShouldAnimate(!isPageReload && !isInternalNavigation);
      hasSetAnimation.current = true;
    }

    // Trigger loaded state after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const value = {
    shouldAnimate,
    isLoaded,
    // You can add more animation-related state here if needed
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
}
