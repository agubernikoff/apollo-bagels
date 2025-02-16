import {defer} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {useEffect, useState} from 'react';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
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
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }
  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context, params}) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const [initial, setInitial] = useState(true);

  /** @type {LoaderReturnData} */
  const {product} = useLoaderData();
  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  }, []);

  const [imageIndex, setImageIndex] = useState(0);

  function handleScroll(scrollWidth, scrollLeft) {
    const widthOfAnImage = scrollWidth / product?.images?.nodes.length;
    const dividend = scrollLeft / widthOfAnImage;
    const rounded = parseFloat((scrollLeft / widthOfAnImage).toFixed(0));

    if (Math.abs(dividend - rounded) < 0.001) setImageIndex(rounded);
  }

  const mappedIndicators =
    product?.images?.nodes.length > 1
      ? product?.images?.nodes.map((e, i) => (
          <div
            key={e.id}
            className="circle"
            style={{
              background: 'var(--color-creme)',
              opacity: i === imageIndex ? 1 : 0.5,
              height: '10px',
              width: '10px',
            }}
          ></div>
        ))
      : null;

  return (
    <div className="product-page">
      <div
        className="product-images"
        onScroll={(e) =>
          handleScroll(e.target.scrollWidth, e.target.scrollLeft)
        }
      >
        {product?.images?.nodes && product.images.nodes.length > 0 ? (
          product.images.nodes.map((image) => (
            <ProductImage key={image.id} image={image} />
          ))
        ) : (
          <div className="product-image-placeholder">No images available</div>
        )}
      </div>
      <div
        className="mapped-indicators"
        style={{
          flexDirection: 'row',
          width: 'fit-content',
          gap: '.2rem',
          transform: 'translateY(-400%)',
          margin: 'auto',
        }}
      >
        {mappedIndicators}
      </div>
      <div className="product-main">
        <div className="product-box">
          <div className="product-header">
            <p>{title}</p>
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
          </div>
          <ProductForm
            productOptions={
              initial
                ? [...productOptions].map((option) => {
                    return {
                      ...option,
                      optionValues: option.optionValues.map((oV) => {
                        return {...oV, selected: false};
                      }),
                    };
                  })
                : productOptions
            }
            selectedVariant={initial ? null : selectedVariant}
            setInitial={setInitial}
          >
            <div className="product-description">
              <p>Johns height is 6'9</p>
            </div>

            <div className="product-details">
              <p style={{fontFamily: 'HAL-BOLD', marginBottom: '-.5rem'}}>
                DETAILS:
              </p>
              <br />
              <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
            </div>
          </ProductForm>
        </div>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    images(first: 12) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }

    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
