import {defer} from '@shopify/remix-oxygen';
import {useRouteLoaderData, Await} from '@remix-run/react';
import React, {useState, useEffect, Suspense} from 'react';
import {AnimatePresence, motion} from 'framer-motion';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Apollo Bagels | Menu'}];
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
async function loadCriticalData({context}) {
  return {};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}
function formatPrice(price) {
  if (price.toString().split('.').length > 1) return price.toFixed(2);
  else return price;
}
export default function Menu() {
  /** @type {LoaderReturnData} */
  const {menu} = useRouteLoaderData('root');

  const [displayImage, setDisplayImage] = useState();
  const [alt, setAlt] = useState('Apollo Bagels');

  function resetAlt() {
    setAlt('Apollo Bagels');
  }

  return (
    <div className="menu-grid">
      <Suspense>
        <Await resolve={menu}>
          {(m) => {
            useEffect(() => {
              if (m?.defaultImage?.asset?.url) {
                setDisplayImage(m.defaultImage.asset.url);
              }
            }, [m]);

            function resetDisplayImage() {
              setDisplayImage(m.defaultImage.asset.url);
            }
            console.log(m);
            return (
              <>
                <CoverImage image={displayImage} alt={alt} />
                <Bagels
                  bagels={m.bagels}
                  setDisplayImage={(url) => setDisplayImage(url)}
                  setAlt={(alt) => setAlt(alt)}
                  resetDisplayImage={resetDisplayImage}
                  resetAlt={resetAlt}
                />
                <FishAndSpreads fish={m.fish} spreads={m.spreads} />
                <Fish fish={m.fish} />
                <Spreads spreads={m.spreads} />
                <Sandwiches sandwiches={m.sandwiches} />
                <Drinks drinks={m.drinks} />
              </>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}

function CoverImage({image, alt}) {
  const [svgContent, setSvgContent] = useState(null);
  const isSvg = image?.toLowerCase().includes('.svg');

  useEffect(() => {
    if (isSvg) {
      fetch(image)
        .then((res) => {
          const contentType = res.headers.get('Content-Type');

          if (contentType && contentType.includes('image/svg+xml')) {
            return res.text();
          } else {
            throw new Error('Not an SVG: ' + contentType);
          }
        })
        .then(setSvgContent)
        .catch((err) => {
          setSvgContent(null);
        });
    }
  }, [image, isSvg]);

  return (
    <div style={{padding: 0}} className="menu-hide-on-mobile">
      <AnimatePresence mode="popLayout">
        {isSvg && svgContent ? (
          <motion.div
            key={image}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            dangerouslySetInnerHTML={{__html: svgContent}}
          />
        ) : (
          <motion.img
            src={image}
            alt={alt}
            key={image}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            style={{height: '100%', width: '100%'}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Bagels({
  bagels,
  setDisplayImage,
  setAlt,
  resetDisplayImage,
  resetAlt,
}) {
  return (
    <div className="bagels">
      <h3>BAGELS</h3>
      <div>
        {bagels.flavors.map((b) => (
          <h4
            key={b.title}
            // onMouseEnter={() => {
            //   setDisplayImage(b.image.asset.url);
            //   setAlt(b.title);
            // }}
            // onMouseLeave={() => {
            //   resetDisplayImage();
            //   resetAlt();
            // }}
            style={{margin: '-.25rem'}}
          >
            <strong>{b.title}</strong>
          </h4>
        ))}
      </div>
      <div>
        {bagels.quantities.map((b) => (
          <p key={b.title}>
            <span style={{marginRight: '0.5rem'}}>{b.title}</span>
            {formatPrice(b.price)}
          </p>
        ))}
      </div>
    </div>
  );
}

function FishAndSpreads({fish, spreads}) {
  return (
    <div className="fish-and-spreads menu-hide-on-mobile">
      <TitleAndList title="FISH" list={fish} />
      <TitleAndList title="SPREADS" list={spreads} />
    </div>
  );
}
function Fish({fish}) {
  return (
    <div className="fish">
      <TitleAndList title="FISH" list={fish} />
    </div>
  );
}
function Spreads({spreads}) {
  return (
    <div className="spreads">
      <TitleAndList title="SPREADS" list={spreads} />
    </div>
  );
}

function Sandwiches({sandwiches}) {
  return (
    <div className="sandwiches">
      <TitleAndList title="SANDWICHES" list={sandwiches} />
      <p>Scallion or vegan cream cheese +1</p>
    </div>
  );
}

function Drinks({drinks}) {
  return (
    <div className="drinks">
      <TitleAndList title="DRINKS" list={drinks} />
    </div>
  );
}

function TitleAndList({title, list}) {
  return (
    <div>
      <h5 style={{textAlign: 'center'}}>
        <strong>{title}</strong>
      </h5>
      {list.map((menuItem) => (
        <p key={menuItem._key}>
          <span style={{marginRight: '.5rem'}} className="main-menu-item">
            {menuItem.title}
          </span>
          <span style={{marginRight: '.5rem'}} className="mobile-alt-menu-item">
            {menuItem.mobileAlternateTitle}
          </span>
          {formatPrice(menuItem.price)}
          {menuItem.mobileSubText && (
            <span className="mobile-alt-menu-subitem">
              {menuItem.mobileSubText}
            </span>
          )}
        </p>
      ))}
    </div>
  );
}
