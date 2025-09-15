import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} remixContext
 * @param {AppLoadContext} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
  context,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    defaultSrc: ["'self'", 'https://cdn.sanity.io'],
    scriptSrc: [
      "'self'",
      'https://cdn.sanity.io',
      'https://cdn.shopify.com',
      'https://cdn.shopify.com/oxygen-v2',
    ],
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    imgSrc: [
      "'self'",
      'data:', // Add data: for inline SVGs
      'https://cdn.sanity.io',
      'https://apicdn.sanity.io',
      'https://gnnsqgu6.apicdn.sanity.io',
      'https://cdn.shopify.com/',
    ],
    connectSrc: [
      "'self'", // Add 'self' for fetch requests
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://cdn.shopify.com',
      'http://localhost:3000',
      'https://*.klaviyo.com/*',
      'https://cdn.sanity.io',
      'https://apicdn.sanity.io', // Add this
      'https://gnnsqgu6.apicdn.sanity.io', // Add this
    ],
    mediaSrc: [
      'https://6e4049-eb.myshopify.com/',
      'https://cdn.sanity.io',
      'https://apicdn.sanity.io', // Add this
      'https://gnnsqgu6.apicdn.sanity.io', // Add this
    ],
    // Add these additional directives
    fontSrc: [
      "'self'",
      'https://cdn.sanity.io',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.shopify.com',
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Often needed for dynamic styles
      'https://cdn.sanity.io',
      'https://fonts.googleapis.com',
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/remix-oxygen').EntryContext} EntryContext */
/** @typedef {import('@shopify/remix-oxygen').AppLoadContext} AppLoadContext */
