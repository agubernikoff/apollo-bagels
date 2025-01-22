import {CartForm} from '@shopify/hydrogen';
import {motion} from 'framer-motion';
/**
 * @param {{
 *   analytics?: unknown;
 *   children: React.ReactNode;
 *   disabled?: boolean;
 *   lines: Array<OptimisticCartLineInput>;
 *   onClick?: () => void;
 * }}
 */
export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => (
        <div className="product-confirm">
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <motion.button
            id="add-to-cart-btn"
            type="submit"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
            initial={{background: '#00000000', color: 'var(--color-creme)'}}
            animate={{
              background: disabled ? '#00000000' : 'var(--color-creme)',
              color: disabled ? 'var(--color-creme)' : 'var(--blue)',
            }}
          >
            {children}
          </motion.button>
        </div>
      )}
    </CartForm>
  );
}

/** @typedef {import('@remix-run/react').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
