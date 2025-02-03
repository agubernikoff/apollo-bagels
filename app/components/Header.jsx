import {Suspense, useState, useEffect, useRef} from 'react';
import {Await, NavLink, useAsyncValue, useLocation} from '@remix-run/react';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {motion, AnimatePresence} from 'framer-motion';
/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain, hours}) {
  const {shop, menu} = header;

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0); // Check if the user has scrolled down
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const {pathname} = useLocation();

  return (
    <header className="header">
      <div
        style={{
          background: scrolled
            ? 'linear-gradient(to bottom, var(--color-creme),transparent)'
            : 'transparent',
          width: '100vw',
          height: 'var(--header-height)',
          position: 'absolute',
          zIndex: -1,
        }}
      />
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
        cart={cart}
      />
    </header>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
  cart,
}) {
  const className = `header-menu`;
  const {close} = useAside();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 499px)');

    // Update state initially and on changes
    const updateIsMobile = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', updateIsMobile);
    setIsMobile(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', updateIsMobile);
  }, []);

  function moveArrayElement(arr, fromIndex, toIndex) {
    const newArr = [...arr]; // Create a shallow copy of the array
    const [element] = newArr.splice(fromIndex, 1); // Remove the element
    newArr.splice(toIndex, 0, element); // Insert the element at the new position
    return newArr; // Return the new array
  }

  const info = menu.items.find((i) => i.title === 'Info');
  const indexOfInfo = menu.items.indexOf(info);

  const [dynamicMenu, setDynamicMenu] = useState(
    (menu || FALLBACK_HEADER_MENU).items,
  );

  useEffect(() => {
    const originalMenu = (menu || FALLBACK_HEADER_MENU).items;
    if (isMobile) {
      const newOrder = moveArrayElement(originalMenu, indexOfInfo, 3);
      const shop = newOrder.find((i) => i.title === 'Shop');
      const indexOfShop = newOrder.indexOf(shop);
      setDynamicMenu(moveArrayElement(newOrder, indexOfShop, 4));
    } else {
      setDynamicMenu(originalMenu); // Reset to the original order
    }
  }, [isMobile, menu, indexOfInfo]);

  const ref = useRef(null);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (ref.current) {
        document.documentElement.style.setProperty(
          '--header-height',
          `calc(${ref.current.offsetHeight}px + 2rem)`,
        );
        document.documentElement.style.setProperty(
          '--mobile-header-height',
          `calc(${ref.current.offsetHeight}px + 2rem)`,
        );
      }
    };

    // Initialize and listen to size changes
    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    // Cleanup observer on unmount
    return () => {
      if (ref.current) {
        resizeObserver.unobserve(ref.current);
      }
    };
  }, []);
  const analytics = useAnalytics();
  const [changed, setIsChanged] = useState(false);

  useEffect(() => {
    if (analytics?.cart?.totalQuantity > analytics?.prevCart?.totalQuantity) {
      setIsChanged(true);
    }
  }, [analytics?.cart?.totalQuantity, analytics?.prevCart?.totalQuantity]);

  useEffect(() => {
    setTimeout(() => setIsChanged(false), 1000); // Reset after 1 second
  }, [changed]);
  return (
    <motion.nav
      layoutRoot
      layout
      className={className}
      role="navigation"
      ref={ref}
    >
      {dynamicMenu.map((item) => {
        if (!item.url) return null;

        // If the URL is internal, strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;

        return (
          <HeaderMenuItem
            key={item.id}
            title={item.title}
            cart={cart}
            close={close}
            url={url}
          />
        );
      })}
      <AnimatePresence>
        {changed && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 0.65}}
            exit={{opacity: 0}}
            style={{
              position: 'absolute',
              background: 'var(--color-creme)',
              inset: 0,
              height: '100vh',
              zIndex: 11,
            }}
            transition={{duration: 0.5}}
          ></motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function HeaderMenuItem({title, cart, close, url}) {
  const [showDot, setShowDot] = useState(false);
  const {pathname} = useLocation();

  useEffect(() => {
    setShowDot(
      pathname === url || (url === '/shop' && pathname.includes('product')),
    );
    console.log(url);
  }, [pathname, url]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 816px)');

    // Update state initially and on changes
    const updateIsMobile = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', updateIsMobile);
    setIsMobile(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', updateIsMobile);
  }, []);

  return (
    <motion.div
      layout
      className="header-menu-item-container"
      onMouseEnter={() => setShowDot(true)}
      onMouseLeave={() => {
        if (pathname !== url) setShowDot(false);
      }}
      transition={{layout: {duration: 0.3}, ease: 'easeInOut'}}
      style={{zIndex: title === 'Cart' ? 20 : 1}}
    >
      <motion.div layout layoutRoot>
        <NavLink
          className="header-menu-item"
          end
          onClick={close}
          prefetch="intent"
          to={url}
        >
          <motion.div
            className="dot"
            initial={{opacity: 0}}
            animate={{opacity: showDot ? 1 : 0}}
            transition={{duration: 0.3, ease: 'easeInOut'}}
            style={{position: 'absolute'}}
          >
            ●
          </motion.div>

          <motion.span
            layout
            transition={{duration: 0.3, ease: 'easeInOut'}}
            initial={{marginLeft: 0}}
            animate={{
              marginLeft: showDot ? '.75em' : 0,
            }}
          >
            {title === 'Cart' ? <CartToggle cart={cart} /> : title}
          </motion.span>
        </NavLink>
      </motion.div>
    </motion.div>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

/**
 * @param {{count: number | null}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  const [changed, setIsChanged] = useState(false);

  useEffect(() => {
    if (cart?.totalQuantity > (prevCart?.totalQuantity || 0)) {
      setIsChanged(true);
    }
  }, [cart?.totalQuantity, prevCart?.totalQuantity]);

  useEffect(() => {
    setTimeout(() => setIsChanged(false), 1000); // Reset after 1 second
  }, [changed]);

  return (
    <motion.span
      onClick={(e) => {
        // e.preventDefault();
        // open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
      layout="size"
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        gap: '1rem',
      }}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key="cart"
          initial={{opacity: 0}}
          animate={{
            opacity: changed ? 1 : 0,
          }}
          exit={{opacity: 0}}
          transition={{duration: 0.5}}
          style={{position: 'absolute'}}
        >
          {'Added! '}
        </motion.span>
        <motion.span
          key="added"
          initial={{opacity: 1}}
          animate={{
            opacity: !changed ? 1 : 0,
          }}
          exit={{opacity: 0}}
          transition={{duration: 0.5}}
          style={{position: 'absolute'}}
        >
          {'Cart '}
        </motion.span>
      </AnimatePresence>
      <motion.div layoutRoot>
        <motion.span
          layout
          initial={{marginLeft: 'var(--add-to-cart-marginLeft)'}}
          animate={{
            marginLeft: changed
              ? 'var(--add-to-cart-marginLeft-added)'
              : 'var(--add-to-cart-marginLeft)',
          }}
          transition={{duration: 0.5}}
        >
          {count === null ? <span>&nbsp;</span> : `(${count})`}
        </motion.span>
      </motion.div>
    </motion.span>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={originalCart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
