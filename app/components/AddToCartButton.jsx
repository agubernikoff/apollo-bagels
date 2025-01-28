import {CartForm} from '@shopify/hydrogen';
import {motion, AnimatePresence} from 'framer-motion';
import {useState, useEffect} from 'react';
import {useFetcher} from '@remix-run/react';
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

  const fetcher = useFetcher();

  function handleSubmit() {
    fetcher.submit();
  }

  useEffect(() => {
    if (fetcher.data?.warnings?.length > 0 && fetcher.state === 'loading') {
      setError(
        fetcher.data.warnings[0].message.includes('You can only add')
          ? 'MAXIMUM QUANTITY REACHED'
          : fetcher.data.warnings[0].message.toUpperCase(),
      );
      setTimeout(() => {
        setError(null);
        setCanDisplay(false);
      }, 2000);
    }
    if (fetcher.state === 'submitting') {
      setCanDisplay(true);
    }
  }, [fetcher.state, fetcher.data?.warnings]);

  return (
    <fetcher.Form action="/cart" method="post" onSubmit={handleSubmit}>
      <div className="product-confirm">
        <input
          type="hidden"
          value={JSON.stringify({
            inputs: {lines, analytics},
            action: CartForm.ACTIONS.LinesAdd,
          })}
          name="cartFormInput"
        ></input>
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
            x:
              error && canDisplay
                ? [1.25, -1.25, 1, -1, 0.75, -0.75, 0.5, -0.5, 0]
                : 0,
          }}
          transition={{x: {duration: 1}}}
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
                // animate={{
                //   opacity: fetcher.state === 'submitting' ? [1, 0] : 1,
                // }}
                animate={{
                  opacity: 1,
                }}
                exit={{opacity: 0}}
                // transition={{
                //   repeat: fetcher.state === 'submitting' ? Infinity : false,
                //   duration: fetcher.state === 'submitting' ? 0.6 : 0.3,
                // }}
              >
                {children}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </fetcher.Form>
  );
}

/** @typedef {import('@remix-run/react').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
