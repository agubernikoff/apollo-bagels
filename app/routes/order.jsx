import {defer} from '@shopify/remix-oxygen';
import {useLoaderData, Await} from '@remix-run/react';
import React, {Suspense} from 'react';
import OrdersCaterers from '~/components/OrdersCaterers';
import reorderArray from '~/helpers/reorderArray';
import {sanityClient} from '~/sanity/SanityClient';

export const meta = () => {
  return [{title: 'Apollo Bagels | Order'}];
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
    .fetch("*[_type == 'location'][]{...,address,orderLink,title,comingSoon}")
    .then((response) => response)
    .catch((error) => {
      console.error('Error fetching locations:', error);
      return [];
    });

  return {
    locations,
  };
}

export default function Order() {
  // ✅ Get locations from THIS route's loader, not root
  const {locations} = useLoaderData();

  const condition = (loc) =>
    loc.comingSoon || Object.keys(loc.address).length <= 2 || !loc.orderLink;

  return (
    <div>
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
    </div>
  );
}
