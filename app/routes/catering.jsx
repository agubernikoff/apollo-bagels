import {defer} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import React from 'react';
import OrdersCaterers from '~/components/OrdersCaterers';
import {sanityClient} from '~/sanity/SanityClient';
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
    .fetch("*[_type == 'location']")
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

export default function Catering() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();

  const condition = (loc) => loc.comingSoon;
  const condition2 = (loc) => Object.keys(loc.address).length <= 2;
  const condition3 = (loc) => loc.cateringLink === undefined;

  return (
    <div>
      <OrdersCaterers
        data={reorderArray(data?.sanityData?.locations, [
          condition,
          condition2,
          condition3,
        ])}
      />
    </div>
  );
}
