import React, {useState, useEffect} from 'react';
import {NavLink, useLocation} from '@remix-run/react';

export function Footer() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    window
      .matchMedia('(max-width:44em)')
      .addEventListener('change', (e) => setIsMobile(e.matches));
    if (window.matchMedia('(max-width:44em)').matches) setIsMobile(true);
  }, []);
  const [time, setTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {timeZone: 'America/New_York'}));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const {pathname} = useLocation();

  function style() {
    return {
      color:
        pathname === '/' || pathname === '/info' ? 'var(--color-creme)' : null,
    };
  }
  return (
    <footer className="footer">
      {isMobile ? (
        <div className="links-mobile">
          <a
            href="https://www.instagram.com/apollobagels/"
            target="_blank"
            rel="noopener noreferrer"
            style={style()}
          >
            ig. @apollobagels
          </a>
          <a href="mailto:hello@apollobagels.com" style={style()}>
            e. hello@apollobagels.com
          </a>
          <a href="#" style={style()}>
            SUBSCRIBE
          </a>
        </div>
      ) : (
        <>
          <div className="footer-left">
            {pathname !== '/' && (
              <p>© Apollo Bagels 2024, All Rights Reserved.</p>
            )}
          </div>
          <div className="footer-right">
            <div className="clock" style={style()}>
              {time}
            </div>
            <div className="links">
              <a
                href="https://www.instagram.com/apollobagels/"
                target="_blank"
                rel="noopener noreferrer"
                style={style()}
              >
                ig. @apollobagels
              </a>
              <a href="mailto:hello@apollobagels.com" style={style()}>
                e. hello@apollobagels.com
              </a>
              <a href="#" style={style()}>
                SUBSCRIBE
              </a>
            </div>
          </div>
        </>
      )}
    </footer>
  );
}
