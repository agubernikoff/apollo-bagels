import {defer} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import React, {useState, useEffect} from 'react';
import {sanityClient} from '~/sanity/SanityClient';
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
  const menu = await sanityClient
    .fetch(
      "*[_type == 'menuPage'][0]{...,defaultImage{asset->{url}},bagels{flavors[]{...,image{asset->{url}}},quantities[]{...,image{asset->{url}}}}}",
    )
    .then((response) => response);
  return {
    sanityData: {menu},
  };
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
  const data = useLoaderData();

  const [displayImage, setDisplayImage] = useState(
    data.sanityData.menu.defaultImage.asset.url,
  );
  const [alt, setAlt] = useState('Apollo Bagels');
  function resetDisplayImage() {
    setDisplayImage(data.sanityData.menu.defaultImage.asset.url);
  }
  function resetAlt() {
    setAlt('Apollo Bagels');
  }

  return (
    <div className="menu-grid">
      <CoverImage image={displayImage} alt={alt} />
      <Bagels
        bagels={data.sanityData.menu.bagels}
        setDisplayImage={(url) => setDisplayImage(url)}
        setAlt={(alt) => setAlt(alt)}
        resetDisplayImage={resetDisplayImage}
        resetAlt={resetAlt}
      />
      <FishAndSpreads
        fish={data.sanityData.menu.fish}
        spreads={data.sanityData.menu.spreads}
      />
      <Fish fish={data.sanityData.menu.fish} />
      <Spreads spreads={data.sanityData.menu.spreads} />
      <Sandwiches sandwiches={data.sanityData.menu.sandwiches} />
      <Drinks drinks={data.sanityData.menu.drinks} />
    </div>
  );
}

function CoverImage({image, alt}) {
  const [svgContent, setSvgContent] = useState(null);
  const isSvg = image.toLowerCase().includes('.svg');

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
