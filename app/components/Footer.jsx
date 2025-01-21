import React, {useState, useEffect} from 'react';
import {useLocation} from '@remix-run/react';

export function Footer() {
  const [time, setTime] = useState('');

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    window
      .matchMedia('(max-width: 57.5em)') // 920px ÷ 16 = 57.5em
      .addEventListener('change', (e) => setIsMobile(e.matches));
    if (window.matchMedia('(max-width: 57.5em)').matches) setIsMobile(true);
  }, []);

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
    <footer
      className="footer"
      style={{
        display: isMobile && pathname !== '/' ? 'none' : null,
      }}
    >
      <div className="footer-left" style={style()}>
        {pathname !== '/' && <p>© Apollo Bagels 2024, All Rights Reserved.</p>}
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
    </footer>
  );
}
