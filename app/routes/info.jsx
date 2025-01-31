import {defer} from '@shopify/remix-oxygen';
import {useRouteLoaderData} from '@remix-run/react';
import {sanityClient} from '~/sanity/SanityClient';
import {PortableText} from '@portabletext/react';
import SanityEmailLink from '../sanity/SanityEmailLink';
import SanityExternalLink from '../sanity/SanityExternalLink.jsx';

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
  const infoPage = await sanityClient
    .fetch("*[_type == 'info'][0]{...,backgroundImage{...,asset->{url}}}")
    .then((response) => response);

  return {
    sanityData: infoPage,
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

export default function Info() {
  const {infoPage} = useRouteLoaderData('root');
  return (
    <div className="info">
      <img
        className="info-background"
        src={infoPage.backgroundImage.asset.url}
        alt="delicious bagels"
      />
      <Announcement data={infoPage.text} />
    </div>
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
