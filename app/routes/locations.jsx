import {defer} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import React, {useState} from 'react';
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
  const condition = (loc) => loc.comingSoon;
  const condition2 = (loc) => loc.videoBackground === null;
  const condition3 = (loc) => loc.phoneNumber === undefined;
  const condition4 = (loc) => Object.keys(loc.address).length <= 2;

  return (
    <div className="locations-grid">
      {reorderArray(data.sanityData.locations, [
        condition,
        condition2,
        condition3,
        condition4,
      ]).map((loc) => (
        <Location key={loc._id} location={loc} />
      ))}
    </div>
  );
}

function Location({location}) {
  const [hovered, setHovered] = useState(null);
  const formattedAddress = (
    <>
      {location.address.street},{<br />}
      {location.address.city}, {location.address.state}{' '}
      {location.address.postalCode}
      <br />
      MON-SUN: 7A-5P
    </>
  );
  return (
    <div className="location-grid-item">
      <MediaViewer file={location.videoBackground?.asset} />
      <div className="location-grid-item-title-container">
        <h5>{location.title}</h5>
        <p>{formattedAddress}</p>
      </div>
      <div className="location-grid-item-bottom-container">
        <motion.a
          href={location.orderlink}
          onMouseEnter={() => setHovered('order')}
          onMouseLeave={() => setHovered(null)}
          initial={{background: 'var(--blue)'}}
          animate={{
            background: hovered === 'order' ? 'var(--green)' : 'var(--blue)',
          }}
        >
          ORDER
        </motion.a>
        <motion.a
          href={location.caterLink}
          onMouseEnter={() => setHovered('cater')}
          onMouseLeave={() => setHovered(null)}
          initial={{background: 'var(--blue)'}}
          animate={{
            background: hovered === 'cater' ? 'var(--green)' : 'var(--blue)',
          }}
        >
          CATERING
        </motion.a>
        <motion.p
          onMouseEnter={() => setHovered('phone')}
          onMouseLeave={() => setHovered(null)}
          initial={{background: 'var(--blue)'}}
          animate={{
            background: hovered === 'phone' ? 'var(--green)' : 'var(--blue)',
          }}
        >{`p. ${location.phoneNumber}`}</motion.p>
      </div>
    </div>
  );
}
