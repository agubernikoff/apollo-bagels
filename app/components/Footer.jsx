import React, {useState, useEffect} from 'react';
import {useLocation} from '@remix-run/react';

export function Footer({subscribeImage}) {
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

  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  return (
    <>
      {' '}
      <footer
        className="footer"
        style={{
          display: isMobile && pathname !== '/' ? 'none' : null,
        }}
      >
        <div className="footer-left" style={style()}>
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
            <button style={style()} onClick={() => setIsSubscribeOpen(true)}>
              SUBSCRIBE
            </button>
          </div>
        </div>
      </footer>
      <div
        className={`overlay ${
          isSubscribeOpen ? 'expanded' : ''
        } footer-overlay`}
        onClick={() => setIsSubscribeOpen(false)}
      >
        <div className="subscribe-container">
          <div className="subscribe-img-container">
            <img src={subscribeImage} alt="delicious looking food" />
          </div>
          <div className="subscribe-footer-form-container">
            <SubscribeForm close={() => setIsSubscribeOpen(false)} />
          </div>
        </div>
      </div>
    </>
  );
}

export function SubscribeForm({close}) {
  const [email, setEmail] = useState('');
  return (
    <>
      <button onClick={close}>Close</button>
      <div className="subscribe-form-container">
        <div>
          <h2>Subscribe to Apollo Mail</h2>
          <p>
            Stay ahead of the curve – get exclusive updates on all the latest
            openings, events, and more, delivered straight to your inbox.
          </p>
        </div>
        <div className="subscribe-form">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            type="email"
          ></input>
          <button>SUBSCRIBE</button>
        </div>
      </div>
    </>
  );
}
