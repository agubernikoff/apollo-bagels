import {useNonce, getShopAnalytics, Analytics} from '@shopify/hydrogen';
import {defer} from '@shopify/remix-oxygen';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  useRouteError,
  useRouteLoaderData,
  ScrollRestoration,
  isRouteErrorResponse,
  useLocation,
} from '@remix-run/react';
import favicon from '~/assets/favicon.png';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import {PageLayout} from '~/components/PageLayout';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import {AnimatePresence, motion} from 'framer-motion';
import {sanityClient} from './sanity/SanityClient';
import {AnimationProvider} from './contexts/AnimationContext';
import {optimizeImageUrl, imagePresets} from '~/sanity/imageUrlBuilder';

const variants = {
  initial: {opacity: 0},
  animate: {opacity: 1},
};

export function PageTransition({children}) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        initial="initial"
        animate="animate"
        variants={variants}
        transition={{duration: 0.8}}
        key={location.pathname}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export const shouldRevalidate = ({
  formMethod,
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) => {
  if (formMethod && formMethod !== 'GET') return true;
  if (currentUrl.toString() === nextUrl.toString()) return true;
  return defaultShouldRevalidate;
};

export function links() {
  return [
    {rel: 'stylesheet', href: resetStyles},
    {rel: 'stylesheet', href: appStyles},
    {rel: 'preconnect', href: 'https://cdn.shopify.com'},
    {rel: 'preconnect', href: 'https://shop.app'},
    {rel: 'icon', type: 'image/png', href: favicon},
  ];
}

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  const {storefront, env} = args.context;

  return defer({
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  });
}

async function loadCriticalData({context}) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'ss-menu',
      },
    }),
  ]);

  const hours = await sanityClient
    .fetch("*[_type == 'storeHours'][0]")
    .then((response) => response);

  const subscribeImageRaw = await sanityClient
    .fetch("*[_type == 'settings'][0]{footer{subscribeImage{...asset->{url}}}}")
    .then((response) => response.footer.subscribeImage.url);

  const subscribeImage = optimizeImageUrl(subscribeImageRaw, {
    width: 800,
    quality: 85,
    format: 'webp',
  });

  const homePage = await sanityClient
    .fetch(
      `*[_type == 'home'][0]{
        ...,
        leftSideImages[]{...,asset->{url}},
        rightSideImages[]{...,asset->{url}},
        announcement{
          ...,
          description[]{
            ...,
            markDefs[]{
              ...,
              _type == "linkProduct" => {
                ...,
                productWithVariant{
                  ...,
                  product->{
                    ...,
                    store{
                      ...
                    }
                  }
                }
              }
            }
          }
        }
      }`,
    )
    .then((response) => {
      if (response) {
        if (response.leftSideImages) {
          response.leftSideImages = response.leftSideImages.map((img) => ({
            ...img,
            optimizedUrl: optimizeImageUrl(
              img.asset.url,
              imagePresets.carousel,
            ),
          }));
        }
        if (response.rightSideImages) {
          response.rightSideImages = response.rightSideImages.map((img) => ({
            ...img,
            optimizedUrl: optimizeImageUrl(
              img.asset.url,
              imagePresets.carousel,
            ),
          }));
        }
      }
      return response;
    });

  return {header, hours, subscribeImage, homePage};
}

function loadDeferredData({context}) {
  const {storefront, customerAccount, cart} = context;

  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
  };
}

export function Layout({children}) {
  const nonce = useNonce();
  const data = useRouteLoaderData('root');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <AnimationProvider>
              <PageLayout {...data}>
                <PageTransition>{children}</PageTransition>
              </PageLayout>
            </AnimationProvider>
          </Analytics.Provider>
        ) : (
          children
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}
