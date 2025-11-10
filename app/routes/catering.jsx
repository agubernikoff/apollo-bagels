import {defer} from '@shopify/remix-oxygen';
import {useLoaderData, Await} from '@remix-run/react';
import React, {Suspense} from 'react';
import OrdersCaterers from '~/components/OrdersCaterers';
import reorderArray from '~/helpers/reorderArray';
import {sanityClient} from '~/sanity/SanityClient';

export const meta = () => {
  return [{title: 'Apollo Bagels | Catering'}];
};

// ✅ Add caching
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
  // ✅ Load locations in THIS route
  const locations = sanityClient
    .fetch(
      "*[_type == 'location'][]{...,address,cateringLink,title,comingSoon}",
    )
    .then((response) => response)
    .catch((error) => {
      console.error('Error fetching locations:', error);
      return [];
    });

  return {
    locations,
  };
}

export default function Catering() {
  // ✅ Get locations from THIS route's loader, not root
  const {locations} = useLoaderData();

  const condition = (loc) =>
    loc.comingSoon ||
    Object.keys(loc.address).length <= 2 ||
    loc.cateringLink === undefined;

  return (
    <div>
      {true ? (
        <p
          style={{
            fontFamily: 'HAL-BOLD',
            fontSize: '36px',
            color: 'var(--blue)',
            minHeight: 'calc(100vh - var(--header-height) - 5rem)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          Coming Soon!
        </p>
      ) : (
        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={locations}>
            {(r) => (
              <OrdersCaterers
                data={reorderArray(r, [condition], (a, b) =>
                  a.title.localeCompare(b.title),
                )}
              />
            )}
          </Await>
        </Suspense>
      )}
    </div>
  );
}
