import React, {useState, useEffect} from 'react';
import {useLocation} from '@remix-run/react';
import {motion, AnimatePresence} from 'framer-motion';
import {useAnimation} from '~/contexts/AnimationContext';

export function Footer({subscribeImage}) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    window
      .matchMedia('(max-width: 501px)')
      .addEventListener('change', (e) => setIsMobile(e.matches));
    if (window.matchMedia('(max-width: 501px)').matches) setIsMobile(true);
  }, []);

  const {pathname} = useLocation();

  function style() {
    return {
      color:
        pathname === '/' || pathname === '/info' ? 'var(--color-creme)' : null,
    };
  }

  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  const {shouldAnimate} = useAnimation();
  return (
    <>
      {' '}
      <motion.footer
        key={shouldAnimate ? 'animating' : 'instant'} // 👈 Forces remount
        className="footer"
        style={{
          display: isMobile && pathname !== '/' ? 'none' : null,
        }}
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{
          ease: 'easeInOut',
          delay: shouldAnimate ? 2 : 0,
          duration: 0.3,
        }}
      >
        {/* <div className="footer-left">
          <p style={{color: pathname === '/info' ? '#f1f0e47d' : '#b4beca'}}>
            © Apollo Bagels 2024, All Rights Reserved.
          </p>
        </div> */}
        <div className="footer-right hours-container">
          <div className="links">
            <a
              href="https://www.instagram.com/apollobagels/"
              target="_blank"
              rel="noopener noreferrer"
              style={style()}
            >
              @apollobagels
            </a>
            <a href="mailto:hello@apollobagels.com" style={style()}>
              hello@apollobagels.com
            </a>
            <button style={style()} onClick={() => setIsSubscribeOpen(true)}>
              subscribe
            </button>
          </div>
        </div>
      </motion.footer>
      <AnimatePresence>
        {isSubscribeOpen && (
          <motion.div
            className="overlay expanded footer-overlay"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
          >
            <div
              style={{position: 'absolute', inset: 0}}
              onClick={() => setIsSubscribeOpen(false)}
            />
            <div className="subscribe-container">
              <div className="subscribe-img-container">
                <img src={subscribeImage} alt="delicious looking food" />
              </div>
              <div className="subscribe-footer-form-container">
                <SubscribeForm close={() => setIsSubscribeOpen(false)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function SubscribeForm({close}) {
  const [placeholder, setPlaceholder] = useState('ENTER A VALID EMAIL');
  const [email, setEmail] = useState('');
  function isValidEmail(x) {
    const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
    return emailRegex.test(x);
  }
  function handleSubmit() {
    const payload = {
      data: {
        type: 'subscription',
        attributes: {
          custom_source: 'Newsletter',
          profile: {
            data: {
              type: 'profile',
              attributes: {
                email: `${email}`,
              },
            },
          },
        },
        relationships: {
          list: {
            data: {
              type: 'list',
              id: 'TJqYhR',
            },
          },
        },
      },
    };

    var requestOptions = {
      mode: 'cors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        revision: '2023-12-15',
      },
      body: JSON.stringify(payload),
    };

    fetch(
      'https://a.klaviyo.com/client/subscriptions/?company_id=XYhjyw',
      requestOptions,
    )
      .then((result) => {
        setEmail('');
        setPlaceholder('Thank you for signing up.');
        setTimeout(() => {
          close();
        }, 1500);
      })
      .catch((error) => {
        console.log('error', error);
        setPlaceholder('Error, please try again.');
        setTimeout(() => {
          setPlaceholder(
            'Join our newsletter for the latest news and releases.',
          );
        }, 1500);
      });
  }
  return (
    <>
      <button
        onClick={() => {
          close();
        }}
        className="close-subscribe-btn"
      >
        Close
      </button>
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
          <button
            style={
              isValidEmail(email)
                ? {background: 'var(--color-creme)', color: 'var(--blue)'}
                : {background: 'transparent', color: 'var(--color-creme)'}
            }
            disabled={!isValidEmail(email)}
            onClick={handleSubmit}
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={isValidEmail(email)}
                initial={{opacity: !email ? 1 : 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                style={{width: '100%', display: 'block'}}
              >
                {isValidEmail(email) ? 'SUBSCRIBE' : placeholder}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>
    </>
  );
}
