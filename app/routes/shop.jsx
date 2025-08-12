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
function ProductItem({product}) {
  const [image, setImage] = useState(product.images.nodes[0]);

  const externalUrl = product.externalLink
    ? JSON.parse(product.externalLink.value).url
    : null;

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
          onMouseEnter={() => {
            if (product.images.nodes.length > 1)
              setImage(product.images.nodes[1]);
          }}
          onMouseLeave={() => setImage(product.images.nodes[0])}
          key={image.url}
          initial={false}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.5}}
        >
          {image && (
            <Image
              alt={product.featuredImage.altText || product.title}
              aspectRatio="1/1"
              data={image}
              sizes="(min-width: 45em) 400px, 100vw"
            />
          )}
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

// GraphQL query for products
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
