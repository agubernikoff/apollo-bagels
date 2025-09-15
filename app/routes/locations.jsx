import {defer} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import React, {useState, useRef, useEffect} from 'react';
import {sanityClient} from '~/sanity/SanityClient';
import MediaViewer from '~/components/MediaViewer';
import {motion} from 'framer-motion';
import reorderArray from '~/helpers/reorderArray';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Info'}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const locations = await sanityClient
    .fetch("*[_type == 'location'][]{...,videoBackground{asset->{...,url}}}")
    .then((response) => response);
  return {
    sanityData: {locations},
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Locations() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  const condition = (loc) =>
    loc.comingSoon ||
    loc.phoneNumber === undefined ||
    Object.keys(loc.address).length <= 2;
  const condition2 = (loc) => loc.videoBackground === null;

  return (
    <div className="locations-grid">
      {reorderArray(
        data.sanityData.locations,
        [condition, condition2],
        (a, b) => a.title.localeCompare(b.title),
      ).map((loc) => (
        <Location key={loc._id} location={loc} />
      ))}
    </div>
  );
}

function Location({location}) {
  const [hovered, setHovered] = useState(null);
  const [isSizeExceeded, setIsSizeExceeded] = useState(false);
  const [isLargest, setIsLargest] = useState(false);
  const h5Ref = useRef(null);
  const parentRef = useRef(null);

  useEffect(() => {
    //find all h5s
    const allH5Elements = Array.from(
      document.querySelectorAll('.location-grid-item h5'),
    );

    // Find the largest h5 width excluding 'COMING SOON'
    const largestH5Width = Math.max(
      ...allH5Elements.map((h5) => {
        if (h5.nextElementSibling.innerHTML !== 'COMING SOON')
          return h5.offsetWidth;
        else return 0;
      }),
    );

    if (h5Ref?.current && h5Ref.current.offsetWidth === largestH5Width)
      setIsLargest(true);

    const checkSize = () => {
      if (h5Ref.current && parentRef.current && isLargest) {
        const h5Width = h5Ref.current.offsetWidth;
        const parentWidth = parentRef.current.offsetWidth;
        const percentage = (h5Width / parentWidth) * 100;

        // Update state only if the current h5 is the largest and exceeds the threshold
        if (isLargest) {
          setIsSizeExceeded(percentage > 61.99);
        }
      }
    };

    // Initialize ResizeObserver
    const resizeObserver = new ResizeObserver(checkSize);

    // Observe the <h5> element
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (parentRef.current) {
        resizeObserver.unobserve(parentRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isLargest)
      if (isSizeExceeded) {
        document.documentElement.style.setProperty(
          '--loc-grid-item-title-container-flex-direction',
          `column`,
        );
        document.documentElement.style.setProperty(
          '--loc-grid-item-title-container-align-items',
          `flex-start`,
        );
      } else {
        document.documentElement.style.setProperty(
          '--loc-grid-item-title-container-flex-direction',
          `row`,
        );
        document.documentElement.style.setProperty(
          '--loc-grid-item-title-container-align-items',
          `center`,
        );
      }
  }, [isSizeExceeded, isLargest]);
  const formattedAddress = (
    <a
      href={location.googleMapsLink}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        cursor: location.googleMapsLink ? 'pointer' : 'auto',
        display: 'inline-block',
      }}
    >
      {location.address.street},<br />
      {location.address.city}, {location.address.state}{' '}
      {location.address.postalCode}
    </a>
  );

  const formattedHours = <p style={{marginTop: '.25rem'}}>MON-SUN: 7A-5P</p>;

  return (
    <div
      className="location-grid-item"
      style={
        location.comingSoon ||
        location.phoneNumber === undefined ||
        Object.keys(location.address).length <= 2
          ? {opacity: 0.33}
          : null
      }
    >
      {!location.comingSoon &&
      location.phoneNumber !== undefined &&
      Object.keys(location.address).length > 2 ? (
        <>
          <MediaViewer file={location.videoBackground?.asset} />
          <h5 ref={h5Ref}>{location.title}</h5>
          <div ref={parentRef} className="location-grid-item-title-container">
            <div className="location-grid-addy">{formattedAddress}</div>
            <div className="location-grid-hours">{formattedHours}</div>
          </div>
          <div className="location-grid-item-bottom-container">
            <motion.a
              href={location.orderLink}
              onMouseEnter={() => setHovered('order')}
              onMouseLeave={() => setHovered(null)}
              initial={{background: 'var(--blue)'}}
              animate={{
                background:
                  hovered === 'order' ? 'var(--green)' : 'var(--blue)',
              }}
            >
              {hovered === 'order' && !location.orderLink
                ? 'COMING SOON'
                : 'ORDER'}
            </motion.a>
            <motion.a
              href={location.cateringLink}
              onMouseEnter={() => setHovered('cater')}
              onMouseLeave={() => setHovered(null)}
              initial={{background: 'var(--blue)'}}
              animate={{
                background:
                  hovered === 'cater' ? 'var(--green)' : 'var(--blue)',
              }}
            >
              {hovered === 'cater' && !location.cateringLink
                ? 'COMING SOON'
                : 'CATERING'}
            </motion.a>
            {/* <motion.a
              href={`tel:${location.phoneNumber}`}
              onMouseEnter={() => setHovered('phone')}
              onMouseLeave={() => setHovered(null)}
              initial={{background: 'var(--blue)'}}
              animate={{
                background:
                  hovered === 'phone' ? 'var(--green)' : 'var(--blue)',
              }}
            >{`p. ${location.phoneNumber}`}</motion.a> */}
          </div>
        </>
      ) : (
        <div
          style={{
            margin: 'auto',
            textAlign: 'center',
          }}
        >
          <h5>{location.title}</h5>
          <p style={{marginTop: '.5rem'}}>COMING SOON</p>
        </div>
      )}
    </div>
  );
}
