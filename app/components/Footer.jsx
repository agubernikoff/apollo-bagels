import React, {useState, useEffect} from 'react';
import {NavLink, useLocation} from '@remix-run/react';

export function Footer() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {timeZone: 'America/New_York'}));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const {pathname} = useLocation();
  function activeLinkStyle({isActive, isPending}) {
    return {
      fontWeight: isActive ? 'bold' : undefined,
      color: isPending ? 'grey' : 'black',
    };
  }
  function style() {
    return {
      color:
        pathname === '/' || pathname === '/info' ? 'var(--color-creme)' : null,
    };
  }
  return (
    <footer className="footer">
      <div className="footer-left">
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
