import {defer} from '@shopify/remix-oxygen';
import {useLoaderData, Await} from '@remix-run/react';
import React, {useState, useEffect, Suspense} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {sanityClient} from '~/sanity/SanityClient';
import {optimizeImageUrl, imagePresets} from '~/sanity/imageUrlBuilder';

export const meta = () => {
  return [{title: 'Apollo Bagels | Menu'}];
};

// ✅ Add caching headers
export const headers = () => ({
  'Cache-Control': 'public, max-age=300, s-maxage=600',
});

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return defer(
    {...deferredData, ...criticalData},
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    },
  );
}

async function loadCriticalData({context}) {
  return {};
}

function loadDeferredData({context}) {
  // ✅ Load menu data ONLY on /menu route
  const menu = sanityClient
    .fetch(
      "*[_type == 'menuPage'][0]{...,defaultImage{asset->{url}},bagels{flavors[]{...,image{asset->{url}}},quantities[]{...,image{asset->{url}}}}}",
    )
    .then((response) => {
      if (response) {
        // Optimize all menu images
        if (response.defaultImage?.asset?.url) {
          response.defaultImageOptimized = optimizeImageUrl(
            response.defaultImage.asset.url,
            imagePresets.menu,
          );
        }

        if (response.bagels?.flavors) {
          response.bagels.flavors = response.bagels.flavors.map((flavor) => ({
            ...flavor,
            imageOptimized: flavor.image?.asset?.url
              ? optimizeImageUrl(flavor.image.asset.url, imagePresets.menu)
              : null,
          }));
        }

        if (response.bagels?.quantities) {
          response.bagels.quantities = response.bagels.quantities.map(
            (quantity) => ({
              ...quantity,
              imageOptimized: quantity.image?.asset?.url
                ? optimizeImageUrl(quantity.image.asset.url, imagePresets.menu)
                : null,
            }),
          );
        }
      }
      return response;
    })
    .catch((error) => {
      console.error('Error fetching menu:', error);
      return null;
    });

  return {
    menu,
  };
}

function formatPrice(price) {
  if (price.toString().split('.').length > 1) return price.toFixed(2);
  else return price;
}

export default function Menu() {
  const {menu} = useLoaderData();
  const [displayImage, setDisplayImage] = useState();
  const [alt, setAlt] = useState('Apollo Bagels');

  function resetAlt() {
    setAlt('Apollo Bagels');
  }

  return (
    <div className="menu-grid">
      <Suspense fallback={<div>Loading menu...</div>}>
        <Await resolve={menu}>
          {(m) => {
            if (!m) return <div>Error loading menu</div>;

            useEffect(() => {
              // Use optimized default image
              if (m?.defaultImageOptimized) {
                setDisplayImage(m.defaultImageOptimized);
              } else if (m?.defaultImage?.asset?.url) {
                setDisplayImage(m.defaultImage.asset.url);
              }
            }, [m]);

            function resetDisplayImage() {
              setDisplayImage(
                m.defaultImageOptimized || m.defaultImage?.asset?.url,
              );
            }

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
            loading="lazy"
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
          <h4 key={b.title} style={{margin: '-.25rem'}}>
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
