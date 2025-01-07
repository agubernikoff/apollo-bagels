import React, {useState, useEffect} from 'react';
import {NavLink} from '@remix-run/react';

export function Footer() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {timeZone: 'America/New_York'}));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="footer">
      <div className="footer-left">
        <p>© Apollo Bagels 2024, All Rights Reserved.</p>
      </div>
      <div className="footer-right">
        <div className="clock">{time}</div>
        <div className="links">
          <a
            href="https://www.instagram.com/apollobagels/"
            target="_blank"
            rel="noopener noreferrer"
          >
            ig. @apollobagels
          </a>
          <a href="mailto:hello@apollobagels.com">e. hello@apollobagels.com</a>
          <a href="#">SUBSCRIBE</a>
        </div>
      </div>
    </footer>
  );
}
