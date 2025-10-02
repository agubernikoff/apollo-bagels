// contexts/AnimationContext.jsx
import {createContext, useContext, useState, useEffect, useRef} from 'react';

const AnimationContext = createContext();

export function AnimationProvider({children}) {
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasSetAnimation = useRef(false);

  useEffect(() => {
  if (!hasSetAnimation.current) {
    const navEntry = performance.getEntriesByType("navigation")[0];
    const isPageReload = navEntry?.type === "reload";

    // Track first visit in sessionStorage
    const hasVisited = sessionStorage.getItem("hasVisited");

    // Animate only if it's the very first page load, not a reload or SPA nav
    const shouldAnimateNow = !isPageReload && !hasVisited;

    setShouldAnimate(shouldAnimateNow);
    sessionStorage.setItem("hasVisited", "true");

    hasSetAnimation.current = true;
  }

  const timer = setTimeout(() => setIsLoaded(true), 100);
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
