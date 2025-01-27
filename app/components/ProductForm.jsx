import {Link, useNavigate} from '@remix-run/react';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import {motion} from 'framer-motion';

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 * }}
 */
export function ProductForm({
  productOptions,
  selectedVariant,
  children,
  setInitial,
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const atLeastOneSelected = productOptions[0].optionValues.find(
    (o) => o.selected,
  );

  return (
    <div className="product-form">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <div
            className={`product-options product-${option.name.toLowerCase()}s`}
            key={option.name}
          >
            <p style={{fontFamily: 'HAL-BOLD'}}>{option.name.toUpperCase()}:</p>
            <div
              className={`product-options-grid ${option.name.toLowerCase()}-buttons`}
            >
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                if (isDifferentProduct) {
                  // SEO
                  // When the variant is a combined listing child product
                  // that leads to a different url, we need to render it
                  // as an anchor tag
                  return (
                    <Link
                      className="product-options-item"
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      style={{
                        border: '1px solid var(--color-creme)',
                        background: selected
                          ? 'var(--color-creme)'
                          : 'transparent',
                        color: selected ? 'var(--blue)' : 'var(--color-creme)',
                        opacity: available ? 1 : 0.3,
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  // SEO
                  // When the variant is an update to the search param,
                  // render it as a button with javascript navigating to
                  // the variant so that SEO bots do not index these as
                  // duplicated links
                  return (
                    <motion.button
                      type="button"
                      className={`product-options-item${
                        exists && !selected ? ' link' : ''
                      }`}
                      key={option.name + name}
                      style={{
                        border: '1px solid var(--color-creme)',
                        opacity: available ? 1 : 0.3,
                      }}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected) {
                          setInitial(false);
                          navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        } else setInitial(true);
                      }}
                      initial={{
                        backgroundColor: '#00000000',
                        color: 'var(--color-creme)',
                      }}
                      animate={{
                        backgroundColor: selected
                          ? 'var(--color-creme)'
                          : '#00000000',
                        color: selected ? 'var(--blue)' : 'var(--color-creme)',
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </motion.button>
                  );
                }
              })}
            </div>
            <br />
          </div>
        );
      })}
      {children}
      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => {
          // open('cart');
        }}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {atLeastOneSelected
          ? selectedVariant?.availableForSale
            ? 'ADD TO CART'
            : 'SOLD OUT'
          : 'SELECT A SIZE'}
      </AddToCartButton>
    </div>
  );
}

/**
 * @param {{
 *   swatch?: Maybe<ProductOptionValueSwatch> | undefined;
 *   name: string;
 * }}
 */
function ProductOptionSwatch({swatch, name}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="product-option-label-swatch"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Maybe} Maybe */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').ProductOptionValueSwatch} ProductOptionValueSwatch */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
