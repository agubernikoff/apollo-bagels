import {CartForm} from '@shopify/hydrogen';
import {motion, AnimatePresence} from 'framer-motion';
import {useState} from 'react';
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
  const [error, setError] = useState();
  const [canDisplay, setCanDisplay] = useState(true);
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => {
        console.log(fetcher, error, canDisplay);
        if (fetcher.data?.warnings?.length > 0 && fetcher.state === 'loading') {
          setError(fetcher.data.warnings[0].message.toUpperCase());
          setTimeout(() => {
            setError(null);
            setCanDisplay(false);
          }, 2500);
        }
        if (fetcher.state === 'submitting') {
          setCanDisplay(true);
        }
        return (
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
              initial={{
                background: '#00000000',
                color: 'var(--color-creme)',
                x: 0,
              }}
              animate={{
                background: disabled ? '#00000000' : 'var(--color-creme)',
                color: disabled ? 'var(--color-creme)' : 'var(--blue)',
                x: error && canDisplay ? [5, -5, 5, -5, 5, -5, 0] : 0,
              }}
            >
              <AnimatePresence mode="popLayout">
                {error && canDisplay ? (
                  <motion.span
                    key="error"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                  >
                    {error}
                  </motion.span>
                ) : (
                  <motion.span
                    key="children"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                  >
                    {children}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        );
      }}
    </CartForm>
  );
}

/** @typedef {import('@remix-run/react').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
