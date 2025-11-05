import {defer} from '@shopify/remix-oxygen';
import {useRouteLoaderData, Await} from '@remix-run/react';
import React, {Suspense} from 'react';
import OrdersCaterers from '~/components/OrdersCaterers';
import reorderArray from '~/helpers/reorderArray';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Apollo Bagels | Catering'}];
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

export default function Catering() {
  /** @type {LoaderReturnData} */
  const {locations} = useRouteLoaderData('root');

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
        <Suspense>
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
