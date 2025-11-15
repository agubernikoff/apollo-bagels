import {defer} from '@shopify/remix-oxygen';
import {useLoaderData, Await} from '@remix-run/react';
import React, {useState, useRef, useEffect, Suspense} from 'react';
import MediaViewer from '~/components/MediaViewer';
import {motion} from 'framer-motion';
import reorderArray from '~/helpers/reorderArray';
import {sanityClient} from '~/sanity/SanityClient';

export const meta = () => {
  return [{title: 'Apollo Bagels | Locations'}];
};

// ✅ IMPORTANT: Tell Oxygen to cache this route
export const headers = () => ({
  'Cache-Control': 'public, max-age=300, s-maxage=600', // Cache for 5 min (browser), 10 min (CDN)
});

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return defer(
    {...deferredData, ...criticalData},
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    },
  );
}

async function loadCriticalData({context}) {
  const locations = await sanityClient
    .fetch(
      "*[_type == 'location'][]{address,cateringLink,hours,orderLink,phoneNumber,title}",
    )
    .then((response) => response)
    .catch((error) => {
      console.error('Error fetching locations:', error);
      return [];
    });

  const shopifyVideos = await context.storefront
    .query(SHOPIFY_LOCATIONS_QUERY)
    .then((res) => res.metaobject)
    .catch((err) => {
      console.error('Error fetching Shopify location videos:', err);
      return [];
    });

  return {
    locations: locations.map((loc) => {
      return {
        ...loc,
        videoBackground: {
          asset: {
            ...shopifyVideos.fields.find(
              (sV) => sV.key === loc.title.toLowerCase().replace(' ', '_'),
            )?.reference,
          },
        },
      };
    }),
  };
}

function loadDeferredData({context}) {
  return {};
}

export default function Locations() {
  const {locations} = useLoaderData();
  console.log(locations);
  const condition = (loc) =>
    loc.comingSoon ||
    loc.phoneNumber === undefined ||
    Object.keys(loc.address).length <= 2;
  const condition2 = (loc) => loc.videoBackground === null;

  return (
    <div className="locations-grid">
      <Suspense fallback={<div>Loading locations...</div>}>
        <Await resolve={locations}>
          {(r) =>
            reorderArray(r, [(condition, condition2)], (a, b) =>
              a.title.localeCompare(b.title),
            ).map((loc) => <Location key={loc._id} location={loc} />)
          }
        </Await>
      </Suspense>
    </div>
  );
}

function Location({location}) {
  const isUnavailable =
    location.comingSoon ||
    location.phoneNumber === undefined ||
    Object.keys(location.address).length <= 2;

  const [hovered, setHovered] = useState(null);
  const [isSizeExceeded, setIsSizeExceeded] = useState(false);
  const [isLargest, setIsLargest] = useState(false);
  const h5Ref = useRef(null);
  const parentRef = useRef(null);

  useEffect(() => {
    const allH5Elements = Array.from(
      document.querySelectorAll('.location-grid-item h5'),
    );

    const largestH5Width = Math.max(
      ...allH5Elements.map((h5) => {
        if (h5.nextElementSibling?.innerHTML !== 'COMING SOON')
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

        if (isLargest) {
          setIsSizeExceeded(percentage > 61.99);
        }
      }
    };

    const resizeObserver = new ResizeObserver(checkSize);

    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }

    return () => {
      if (parentRef.current) {
        resizeObserver.unobserve(parentRef.current);
      }
    };
  }, [isLargest]);

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

  const formattedHours = (
    <p style={{marginTop: '.25rem'}} className="hours-p">
      {formatStoreHours(location.hours).map((f) => (
        <span key={f}>{f}</span>
      ))}
    </p>
  );

  return (
    <div
      className={`location-grid-item ${isUnavailable ? 'unavailable' : ''}`}
      style={
        isUnavailable
          ? {
              opacity: 0.33,
              backgroundColor: '#E0DFD1',
              borderRadius: '12px',
            }
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

const formatStoreHours = (hours) => {
  const daysOrder = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  const dayAbbreviations = {
    monday: 'MON',
    tuesday: 'TUE',
    wednesday: 'WED',
    thursday: 'THU',
    friday: 'FRI',
    saturday: 'SAT',
    sunday: 'SUN',
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'P' : 'A';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const minutesPart = minutes !== '00' ? `:${minutes}` : '';
    return `${displayHour}${minutesPart}${period}`;
  };

  const groups = [];
  let currentGroup = null;

  daysOrder.forEach((day) => {
    if (!hours[day]) return;

    const {start, end} = hours[day];

    if (
      !currentGroup ||
      currentGroup.start !== start ||
      currentGroup.end !== end
    ) {
      currentGroup = {
        days: [day],
        start,
        end,
      };
      groups.push(currentGroup);
    } else {
      currentGroup.days.push(day);
    }
  });

  return groups.map((group) => {
    const firstDay = dayAbbreviations[group.days[0]];
    const lastDay = dayAbbreviations[group.days[group.days.length - 1]];
    const dayRange =
      group.days.length === 1 ? firstDay : `${firstDay}-${lastDay}`;
    const timeRange = `${formatTime(group.start)}-${formatTime(group.end)}`;
    return `${dayRange}: ${timeRange}`;
  });
};

const SHOPIFY_LOCATIONS_QUERY = `#graphql
query GetLocationVideos {
  metaobject(handle: {type: "location_videos", handle: "location-videos-ezqhtbso"}) {
    id
    type
    handle
    fields {
      key
      value
      reference {
        __typename
        ... on MediaImage {
          image {
            url
          }
        }
        ... on Video {
          sources {
            url
            mimeType
          }
          previewImage {
            url
          }
        }
      }
    }
  }
}

`;
