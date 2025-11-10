import {defer} from '@shopify/remix-oxygen';
import {useLoaderData, Await} from '@remix-run/react';
import React, {Suspense} from 'react';
import {PortableText} from '@portabletext/react';
import SanityEmailLink from '../sanity/SanityEmailLink';
import SanityExternalLink from '../sanity/SanityExternalLink.jsx';
import {optimizeImageUrl, imagePresets} from '~/sanity/imageUrlBuilder';
import {sanityClient} from '~/sanity/SanityClient';

export const meta = () => {
  return [{title: 'Apollo Bagels | Info'}];
};

// ✅ Add caching headers
export const headers = () => ({
  'Cache-Control': 'public, max-age=300, s-maxage=600',
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
  return {};
}

function loadDeferredData({context}) {
  // ✅ Load info page data ONLY on /info route
  const infoPage = sanityClient
    .fetch("*[_type == 'info'][0]{...,backgroundImage{...,asset->{url}}}")
    .then((response) => {
      if (response?.backgroundImage?.asset?.url) {
        // Optimize the background image
        response.backgroundImageOptimized = optimizeImageUrl(
          response.backgroundImage.asset.url,
          imagePresets.background,
        );
      }
      return response;
    })
    .catch((error) => {
      console.error('Error fetching info page:', error);
      return null;
    });

  return {
    infoPage,
  };
}

export default function Info() {
  const {infoPage} = useLoaderData();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Await resolve={infoPage}>
        {(iP) => {
          if (!iP) return <div>Error loading page</div>;

          return (
            <div className="info">
              {/* ✅ Single optimized image with blur-up effect using CSS */}
              <img
                className="info-background"
                src={
                  iP.backgroundImageOptimized || iP.backgroundImage.asset.url
                }
                alt="delicious bagels"
                loading="eager"
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: -1,
                }}
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
