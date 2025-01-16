import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {motion} from 'framer-motion';

function OrdersCaterers({data}) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 57.5em)');

    // Update state initially and on changes
    const updateIsMobile = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', updateIsMobile);
    setIsMobile(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', updateIsMobile);
  }, []);
  const {pathname} = useLocation();
  return (
    <div className="order-cater-container">
      <div className="order-cater-text-container">
        {pathname === '/order' && (
          <p>
            Place your pickup order via Toast at any of our locations until 2
            PM.
            <br></br>
            Select your preferred location below.
          </p>
        )}
        {pathname === '/catering' && (
          <p>
            We offer catering from all locations on ezCater. Please select your
            desired location below.<br></br>Please email{' '}
            <a className="oc-link" href="mailto:catering@apollobagels.com">
              catering@apollobagels.com
            </a>{' '}
            for all other catering inquiries.
          </p>
        )}
      </div>
      <div className="order-cater-locations">
        {data
          .slice()
          .reverse()
          .map((location) => {
            const {title, address, orderLink, cateringLink} = location;

            return (
              <Location
                title={title}
                address={address}
                orderLink={orderLink}
                cateringLink={cateringLink}
                pathname={pathname}
                key={location._id}
              />
            );
          })}
      </div>
    </div>
  );
}

function Location({title, address, orderLink, cateringLink, pathname}) {
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 57.5em)');

    // Update state initially and on changes
    const updateIsMobile = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', updateIsMobile);
    setIsMobile(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', updateIsMobile);
  }, []);

  const formattedAddress = (
    <>
      {address.street},{<br />}
      {address.city}, {address.state} {address.postalCode}
    </>
  );

  const link =
    pathname === '/order'
      ? orderLink
      : pathname === '/catering'
      ? cateringLink
      : '#';

  return (
    <motion.div
      className={`${isMobile ? 'location-item-mobile' : 'location-item'}`}
      initial={{x: 0}}
      animate={{x: hovered ? '1vw' : 0}}
      transition={{ease: 'easeInOut'}}
    >
      {/* Mobile: Title and Address in the same div */}
      {isMobile ? (
        <motion.div
          className="mobile-location"
          initial={{
            backgroundColor:
              pathname === '/order' ? 'var(--blue)' : 'var(--yellow)',
          }}
          animate={{
            backgroundColor: hovered
              ? 'var(--green)'
              : pathname === '/order'
              ? 'var(--blue)'
              : 'var(--yellow)',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
          style={{cursor: 'pointer'}}
        >
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="location-link"
            style={{
              color: pathname === '/order' ? 'var(--creme)' : 'var(--blue)',
            }}
          >
            {title}
          </a>
          <p
            className="mobile-address"
            style={{
              color: pathname === '/order' ? 'var(--creme)' : 'var(--blue)',
            }}
          >
            {formattedAddress}
          </p>
        </motion.div>
      ) : (
        // Desktop: Title and Address in separate divs
        <>
          <motion.p
            initial={{
              backgroundColor:
                pathname === '/order' ? 'var(--blue)' : 'var(--yellow)',
            }}
            animate={{
              backgroundColor: hovered
                ? 'var(--green)'
                : pathname === '/order'
                ? 'var(--blue)'
                : 'var(--yellow)',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
            style={{cursor: 'pointer'}}
          >
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="location-link"
              style={{
                color: pathname === '/order' ? 'var(--creme)' : 'var(--blue)',
              }}
            >
              {title}
            </a>
          </motion.p>
          <motion.p
            className="desktop-address"
            initial={{
              backgroundColor:
                pathname === '/order' ? 'var(--blue)' : 'var(--yellow)',
            }}
            animate={{
              backgroundColor: hovered
                ? 'var(--green)'
                : pathname === '/order'
                ? 'var(--blue)'
                : 'var(--yellow)',
            }}
            style={{cursor: 'pointer'}}
          >
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: pathname === '/order' ? 'var(--creme)' : 'var(--blue)',
              }}
            >
              {formattedAddress}
            </a>
          </motion.p>
        </>
      )}
    </motion.div>
  );
}

export default OrdersCaterers;
