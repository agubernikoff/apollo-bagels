import {defer} from '@shopify/remix-oxygen';
import {useRouteLoaderData, Await} from '@remix-run/react';
import React, {Suspense} from 'react';
import {PortableText} from '@portabletext/react';
import SanityEmailLink from '../sanity/SanityEmailLink';
import SanityExternalLink from '../sanity/SanityExternalLink.jsx';
import {optimizeImageUrl, imagePresets} from '~/sanity/imageUrlBuilder'; // ← ADD THIS

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Apollo Bagels | Info'}];
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
  return {};
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

export default function Info() {
  /** @type {LoaderReturnData} */
  const {infoPage} = useRouteLoaderData('root');
  return (
    <Suspense>
      <Await resolve={infoPage}>
        {(iP) => {
          // ← OPTIMIZE THE BACKGROUND IMAGE HERE
          const backgroundImageUrl = optimizeImageUrl(
            iP.backgroundImage.asset.url,
            imagePresets.background,
          );

          // Ultra-low quality placeholder for blur effect
          const blurredBackgroundUrl = optimizeImageUrl(
            iP.backgroundImage.asset.url,
            {width: 100, quality: 10, format: 'webp'},
          );

          return (
            <div
              className="info"
              style={{
                backgroundImage: `url(${blurredBackgroundUrl})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }}
            >
              <img
                className="info-background"
                src={backgroundImageUrl}
                alt="delicious bagels"
              />
              <Announcement data={iP.text} />
            </div>
          );
        }}
      </Await>
    </Suspense>
  );
}

function Announcement({data}) {
  const components = {
    marks: {
      linkEmail: SanityEmailLink,
      linkExternal: SanityExternalLink,
    },
    block: {
      normal: ({children}) => {
        // Handle empty blocks as line breaks
        if (
          !children ||
          children.length === 0 ||
          children.every((child) => child === '')
        ) {
          return <br />;
        }

        return <p>{children}</p>;
      },
    },
  };

  return (
    <div className="info-announcement-container">
      <PortableText value={data} components={components} />
    </div>
  );
}
