import {defer} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = () => {
  return [{title: `Shop | All Products`}];
};

/**
 * Loader function to fetch products.
 * @param {LoaderFunctionArgs} args
 */
export async function loader({context, request}) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 12}); // Adjust number of products per page as needed

  const {products} = await storefront.query(CATALOG_QUERY, {
    variables: {...paginationVariables},
  });

  if (!products) {
    throw new Response('Products not found', {status: 404});
  }

  return defer({products});
}

/**
 * Shop page component displaying products.
 */
export default function ShopPage() {
  const {products} = useLoaderData();

  return (
    <div className="shop-page">
      <div className="products-grid">
        {products.nodes.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

/**
 * Product item component.
 * @param {{product: ProductItemFragment}}
 */
// Updated ProductItem component to handle different media types
function ProductItem({product}) {
  const [currentMedia, setCurrentMedia] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // Initialize with first media item or fallback to featuredImage
  useState(() => {
    if (product.media.nodes.length > 0) {
      setCurrentMedia(product.media.nodes[0]);
    } else if (product.featuredImage) {
      setCurrentMedia({
        mediaContentType: 'IMAGE',
        image: product.featuredImage,
      });
    }
  }, [product]);

  const externalUrl = product.externalLink
    ? JSON.parse(product.externalLink.value).url
    : null;

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Switch to second media item if available
    if (product.media.nodes.length > 1) {
      setCurrentMedia(product.media.nodes[1]);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Switch back to first media item
    if (product.media.nodes.length > 0) {
      setCurrentMedia(product.media.nodes[0]);
    }
  };

  const renderMedia = (media) => {
    if (!media) return null;

    switch (media.mediaContentType) {
      case 'IMAGE':
        return (
          <Image
            alt={media.image?.altText || media.alt || product.title}
            aspectRatio="1/1"
            data={media.image}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        );

      case 'VIDEO':
        return (
          <video
            autoPlay={true}
            muted
            loop
            playsInline
            poster={media.previewImage?.url}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          >
            {media.sources.map((source) => (
              <source
                key={source.url}
                src={source.url}
                type={source.mimeType}
              />
            ))}
            Your browser does not support the video tag.
          </video>
        );

      case 'EXTERNAL_VIDEO':
        // For external videos, show preview image and handle click
        return (
          <div style={{position: 'relative', width: '100%', height: '100%'}}>
            <Image
              alt={media.alt || product.title}
              aspectRatio="1/1"
              data={media.previewImage}
              sizes="(min-width: 45em) 400px, 100vw"
            />
            {isHovered && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                Play Video
              </div>
            )}
          </div>
        );

      case 'MODEL_3D':
        return (
          <Image
            alt={media.alt || product.title}
            aspectRatio="1/1"
            data={media.previewImage}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        );

      default:
        // Fallback to featuredImage
        return product.featuredImage ? (
          <Image
            alt={product.featuredImage.altText || product.title}
            aspectRatio="1/1"
            data={product.featuredImage}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        ) : null;
    }
  };

  return (
    <Link
      className="product-item"
      to={externalUrl || `/products/${product.handle}`}
      target={externalUrl ? '_blank' : undefined}
      rel={externalUrl ? 'noopener noreferrer' : undefined}
      preventScrollReset={true}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          className="image-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          key={currentMedia?.id || 'fallback'}
          initial={false}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.5}}
        >
          {renderMedia(currentMedia)}
        </motion.div>
      </AnimatePresence>
      <div className="product-info">
        <p>{product.title}</p>
        <small>
          {externalUrl ? (
            <div>$5.00 - $500.00</div>
          ) : (
            <Money data={product.priceRange.minVariantPrice} />
          )}
        </small>
      </div>
    </Link>
  );
}

// Updated GraphQL query fragments and query with media support
const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    media(first: 10) {
      nodes {
        ... on MediaImage {
          id
          alt
          image {
            id
            url
            altText
            width
            height
          }
          mediaContentType
        }
        ... on Video {
          id
          alt
          mediaContentType
          sources {
            url
            mimeType
            format
            height
            width
          }
          previewImage {
            url
            altText
            width
            height
          }
        }
        ... on Model3d {
          id
          alt
          mediaContentType
          sources {
            url
            mimeType
            format
          }
          previewImage {
            url
            altText
            width
            height
          }
        }
        ... on ExternalVideo {
          id
          alt
          mediaContentType
          embedUrl
          host
          previewImage {
            url
            altText
            width
            height
          }
        }
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
    }
    externalLink: metafield(namespace: "custom", key: "link_gift_card") {
      value
    }
  }
`;

const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...ProductItem
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
  ${PRODUCT_ITEM_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
