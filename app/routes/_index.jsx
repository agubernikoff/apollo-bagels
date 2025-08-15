import {defer} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {Suspense, useEffect, useState, useRef} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import InfiniteCarousel from '~/components/InfiniteCarousel';
import {sanityClient} from '~/sanity/SanityClient';
import {motion} from 'framer-motion';
import {useAnimation} from '~/contexts/AnimationContext';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
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
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  const homePage = await sanityClient
    .fetch(
      "*[_type == 'home'][0]{...,leftSideImages[]{...,asset->{url}},rightSideImages[]{...,asset->{url}}}",
    )
    .then((response) => response);

  return {
    featuredCollection: collections.nodes[0],
    sanityData: homePage,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const [isMobile, setIsMobile] = useState(false);
  const {shouldAnimate, isLoaded} = useAnimation();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 57.5em)');
    const handleChange = (e) => setIsMobile(e.matches);

    mediaQuery.addEventListener('change', handleChange);
    if (mediaQuery.matches) setIsMobile(true);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home">
      <SVGLogo isLoaded={isLoaded} shouldAnimate={shouldAnimate} />
      {!isMobile ? (
        <>
          <motion.div
            className="home-left"
            key={'home-left'}
            initial={{opacity: 0, y: '100vh'}}
            animate={isLoaded ? {opacity: 1, y: 0} : {opacity: 0, y: '100vh'}}
            transition={{
              delay: shouldAnimate ? 1 : 0,
              duration: shouldAnimate ? 1 : 0,
              ease: 'easeInOut',
            }}
          >
            <InfiniteCarousel
              images={data.sanityData.leftSideImages.map(
                (image) => image.asset.url,
              )}
              scrollDirection="down"
            />
          </motion.div>
          <motion.div
            className="home-right"
            key={'home-right'}
            initial={{opacity: 0, y: '-100vh'}}
            animate={isLoaded ? {opacity: 1, y: 0} : {opacity: 0, y: '-100vh'}}
            transition={{
              delay: shouldAnimate ? 1 : 0,
              duration: shouldAnimate ? 1 : 0,
              ease: 'easeInOut',
            }}
          >
            <InfiniteCarousel
              images={data.sanityData.rightSideImages.map(
                (image) => image.asset.url,
              )}
              scrollDirection="up"
            />
          </motion.div>
        </>
      ) : (
        <motion.div
          className="home-mobile"
          key={'home-mobile'}
          initial={{opacity: 0, y: '100vh'}}
          animate={isLoaded ? {opacity: 1, y: 0} : {opacity: 0, y: '100vh'}}
          transition={{
            delay: shouldAnimate ? 1 : 0,
            duration: shouldAnimate ? 1 : 0,
            ease: 'easeInOut',
          }}
        >
          <InfiniteCarousel
            images={[
              ...data.sanityData.leftSideImages,
              ...data.sanityData.rightSideImages,
            ].map((image) => image.asset.url)}
            scrollDirection="down"
          />
        </motion.div>
      )}
      <Announcement
        data={data.sanityData.announcement}
        isLoaded={isLoaded}
        shouldAnimate={shouldAnimate}
      />
      {/* <FeaturedCollection collection={data.featuredCollection} />
      <RecommendedProducts products={data.recommendedProducts} /> */}
    </div>
  );
}

function SVGLogo({isLoaded}) {
  return (
    <motion.div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
      initial={{opacity: 0}}
      animate={isLoaded ? {opacity: 1} : {opacity: 0}}
      transition={{duration: 1, ease: 'easeInOut'}}
      key={'logo'}
    >
      <svg
        width="926"
        height="174"
        viewBox="0 0 926 174"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M164.506 34.1806C149.717 34.2849 137.609 44.6726 133.051 61.1824C132.686 62.4965 131.372 62.5069 131.372 61.5682C131.341 56.51 133.854 41.888 134.198 37.3929C134.365 34.0242 130.976 32.5432 127.993 34.6291C124.447 36.9027 117.72 39.0094 109.303 40.5634C102.942 41.7315 103.359 46.7898 109.356 47.3008C115.353 47.8223 118.554 50.4192 119.149 55.2793C119.941 60.8903 120.609 76.6179 120.682 86.7345L120.911 118.94C120.932 122.132 120.964 125.72 120.964 129.453C109.512 128.369 102.816 123.738 99.7814 115.405C96.152 105.507 88.1213 82.7191 85.441 73.7498L63.9668 3.86232C63.0073 0.869079 59.4405 -0.413747 57.0208 1.47398C52.7343 4.31078 45.6319 6.05249 38.5191 7.40831C32.3448 8.57641 33.5025 13.6243 39.8749 14.1353C49.2405 15.0009 54.5282 20.5807 52.3276 27.3389C44.8393 53.9861 34.2326 89.2688 25.4302 115.926C22.6872 124.562 16.1584 129.099 4.74863 130.309C-2.1765 131.112 -1.19613 137.275 5.54126 136.67C13.0296 136.055 20.1424 135.252 23.8866 135.231C28.3817 135.2 34.5663 136.462 42.2424 136.41C49.1675 136.358 48.7607 130.747 41.8252 130.048C32.8246 129.172 31.3123 126.564 33.8571 116.25C35.3068 110.242 37.6847 101.429 40.4276 91.6675C40.7822 89.6025 41.9086 88.8516 43.7755 88.8307L72.0496 88.6325C73.9269 88.6221 75.0533 89.3627 75.6269 91.2295C78.6931 100.574 81.7594 110.659 83.2925 116.083C85.7956 125.428 83.5741 128.817 73.8435 129.818C66.9183 130.621 66.7723 136.232 73.6974 136.191C81.3735 136.139 91.4796 134.751 98.9679 134.699C106.456 134.647 113.204 135.346 120.703 135.857C120.786 135.857 120.859 135.857 120.943 135.867C120.922 141.979 120.818 148.101 120.567 153.222C120.067 162.4 116.166 165.988 106.06 166.999C99.3225 167.802 99.7397 173.413 106.289 173.361C113.965 173.309 119.013 171.964 128.003 171.891C135.867 171.838 144.492 172.527 151.793 173.027C157.79 173.549 158.864 167.166 151.939 166.655C140.508 165.988 135.231 161.534 135.168 152.732L134.824 131.383C134.803 128.014 134.991 127.826 137.807 130.235C141.582 133.761 148.351 138.589 159.594 138.506C180.192 138.36 200.822 116.677 200.571 81.6553C200.342 50.0021 181.694 34.0346 164.465 34.1597L164.506 34.1806ZM69.411 82.1142L46.3828 82.2811C44.3178 82.2915 43.3792 81.1756 43.9215 79.1105C48.3123 64.0922 53.0681 48.521 56.1761 38.1959C56.9165 36.3186 57.657 36.1205 58.4184 38.1751L69.7134 72.7381C70.287 74.4173 71.0484 76.4719 71.6324 78.902C72.3938 80.9566 71.6533 82.0829 69.411 82.1038V82.1142ZM158.645 130.298C145.16 130.392 135.158 119.232 134.856 103.317L134.543 86.0878C134.198 63.9879 143.262 48.1977 156.371 47.7284C172.85 47.2382 184.583 64.1965 184.76 88.9142C184.927 112.693 173.82 130.194 158.655 130.298H158.645Z"
          fill="#F1F0E4"
        />
        <path
          d="M250.685 33.3798C225.404 33.5571 206.287 57.1067 206.495 87.2582C206.756 123.208 227.646 138.049 247.118 137.903C272.399 137.726 291.516 114.176 291.307 84.025C291.13 59.495 275.215 33.2025 250.685 33.3798ZM253.407 126.806C236.365 126.932 220.106 104.759 219.741 80.4165C219.397 57.7638 227.354 44.9669 242.331 44.8626C264.994 44.6957 277.937 73.8251 278.114 98.7305C278.229 115.397 268.383 126.702 253.407 126.806Z"
          fill="#F1F0E4"
        />
        <path
          d="M377.809 127.566C366.566 126.524 361.288 122.07 361.049 113.831C360.788 103.913 360.068 81.0617 359.995 72.082C359.641 22.8343 359.568 11.9669 360.068 3.72763C360.235 0.358926 356.846 -1.12204 353.863 0.963839C350.317 3.23745 343.59 5.34417 335.173 6.90858C328.811 8.07668 329.228 13.135 335.225 13.646C341.222 14.1675 344.424 16.7644 345.019 21.6245C345.801 26.8601 346.593 59.2538 346.677 70.309C346.75 80.4256 346.917 104.017 346.427 113.758C345.936 123.124 340.596 127.9 332.295 127.9C320.843 127.9 315.775 122.425 315.535 114.196C315.274 104.267 314.554 81.4268 314.481 72.447C314.127 23.1994 314.054 12.3319 314.554 4.09266C314.721 0.723962 311.332 -0.757008 308.349 1.32887C304.803 3.60249 298.076 5.70923 289.659 7.26321C283.297 8.43131 283.714 13.4896 289.711 14.0006C295.708 14.5221 298.91 17.119 299.505 21.9791C300.287 27.2147 301.079 59.6084 301.163 70.6636C301.236 80.7801 301.403 104.371 300.913 114.113C300.422 123.478 296.887 127.066 286.781 128.255C279.668 129.058 280.085 134.669 287.01 134.617C294.686 134.565 301.611 133.198 308.912 133.146C314.752 133.105 321.292 133.365 327.247 133.939C331.366 134.335 334.078 134.523 338.698 133.97C338.709 133.97 349.138 132.823 354.426 132.792C361.914 132.739 370.539 133.428 377.652 133.939C384.212 134.45 384.536 128.276 377.798 127.566H377.809Z"
          fill="#F1F0E4"
        />
        <path
          d="M414.906 32.1357C389.625 32.313 370.507 55.8626 370.716 86.014C370.977 121.964 391.867 136.805 411.339 136.659C436.62 136.482 455.737 112.932 455.528 82.7809C455.351 58.2509 439.435 31.9584 414.906 32.1357ZM417.628 125.562C400.586 125.688 384.326 103.515 383.961 79.1723C383.617 56.5197 391.575 43.7227 406.552 43.6185C429.215 43.4516 442.158 72.581 442.335 97.4864C442.45 114.153 432.604 125.458 417.628 125.562Z"
          fill="#F1F0E4"
        />
        <path
          d="M540.863 65.6158H540.675L541.426 65.4281C552.074 62.1637 568.678 52.8711 568.553 36.0171C568.396 13.5417 547.715 3.39394 528.431 3.3418C520.191 3.40437 513.277 4.7602 505.778 4.81235C498.477 4.86449 491.531 3.60252 483.855 3.65467C476.93 3.70681 476.597 9.32828 483.709 10.0271C493.826 11.0804 497.414 14.616 498.039 23.9712C498.446 28.8417 498.801 52.433 498.947 71.717C499.114 94.3801 499.03 109.357 498.707 116.48C498.217 125.846 494.681 129.433 484.575 130.622C477.462 131.425 477.879 137.036 484.804 136.984C492.48 136.932 499.406 135.566 506.706 135.514C516.072 135.451 524.697 136.692 535.554 136.619C560.459 136.442 576.469 123.03 576.323 102.432C576.177 82.0213 557.362 69.2348 540.852 65.6054L540.863 65.6158ZM514.539 23.6687C514.664 14.8663 518.94 10.3399 526.804 10.2878C542.531 10.3608 551.97 19.8411 552.085 36.1423C552.241 58.43 540.289 62.0698 519.503 62.4036C515.759 62.4349 514.059 60.568 514.215 56.8238C514.309 44.2772 514.403 30.6043 514.539 23.6687ZM536.086 131.008C521.287 131.112 515.644 127.41 515.196 116.553C514.779 110.191 514.424 87.9035 514.153 74.8041C514.132 71.2477 515.988 69.3287 519.733 69.3287C546.703 69.8815 559.323 80.2796 559.489 102.567C559.573 114.363 553.326 130.893 536.096 131.008H536.086Z"
          fill="#F1F0E4"
        />
        <path
          d="M718.694 112.788C698.284 112.934 677.957 125.063 668.216 125.136C663.721 125.167 660.894 122.383 660.863 118.263C660.811 110.775 670.698 105.268 684.924 105.164C707.775 104.997 723.951 89.7178 723.805 68.3688C723.784 65.9388 723.586 63.4983 723.189 61.0683C722.418 57.6996 721.823 53.2149 724.065 51.8904C726.86 50.3677 731.929 51.8382 736.236 51.6192C743.537 51.3793 747.26 48.5426 748.157 42.9211C748.867 37.4874 745.842 33.5763 740.596 33.6076C735.35 33.6389 730.125 36.3088 725.484 41.0229C719.529 46.8738 717.662 47.6352 715.962 45.4033C709.725 37.9567 701.089 33.8996 691.348 33.9726C671.313 34.1187 656.076 50.326 656.222 70.924C656.295 80.8529 661.051 90.9277 668.205 96.6847C670.656 98.5411 670.656 99.4798 667.486 101.18C657.599 106.123 651.112 115.155 651.164 123.77C651.164 124.709 651.258 125.605 651.414 126.492C644.176 127.451 639.17 122.769 639.107 114.926L638.68 55.3738C638.586 42.264 631.223 34.4524 619.052 34.5358C600.696 34.6714 584.322 49.3873 577.689 64.2284C575.112 70.048 577.198 74.5326 582.069 74.5013C589.933 74.4492 594.949 68.786 596.378 58.8572C597.807 48.7303 603.376 42.5143 611.24 42.4622C618.916 42.4101 623.641 47.9898 623.703 56.9799L623.839 76.6393C623.88 81.8853 619.959 84.5344 610.645 90.5939C598.151 98.7393 580.807 108.407 580.911 123.019C580.974 132.385 587.763 139.08 597.504 139.007C607.246 138.934 614.869 131.769 620.825 126.857C621.565 126.106 622.504 125.72 623.067 125.72C624.006 125.72 624.944 126.085 626.081 127.566C629.856 131.665 634.571 135.931 643.185 135.868C644.99 135.858 649.506 135.253 653.844 132.322C654.48 133.188 655.221 134.012 656.107 134.783C658.746 137.015 658.934 137.756 656.9 140.207C653.563 144.91 652.092 149.416 652.134 154.474C652.217 166.27 662.761 173.685 678.864 173.57C706.022 173.372 744.486 157.749 744.309 132.656C744.225 120.297 734.432 112.683 718.694 112.798V112.788ZM689.899 40.8978C700.756 40.8248 707.952 52.0051 708.077 69.2345C708.202 86.6516 701.162 97.9363 690.305 98.0093C679.261 98.0927 672.064 86.9019 671.939 69.4848C671.814 52.2554 678.854 40.9708 689.899 40.8874V40.8978ZM608.278 124.5C601.541 124.552 597.202 121.204 597.171 115.969C597.129 109.607 603.063 102.066 613.315 95.4436C616.486 93.3577 620.595 91.4596 621.899 91.4491C623.401 91.4387 623.964 92.1792 623.985 94.6197L624.11 112.037C624.162 119.713 618.207 124.437 608.278 124.51V124.5ZM689.262 161.879C674.098 161.983 665.254 156.998 665.191 148.383C665.087 133.407 678.51 126.002 706.982 125.804C723.273 125.689 731.355 130.309 731.428 139.487C731.512 151.095 722.783 161.65 689.262 161.889V161.879Z"
          fill="#F1F0E4"
        />
        <path
          d="M810.619 110.629C804.497 118.91 794.61 123.853 783.565 124.124C767.086 124.427 755.353 107.656 755.176 82.9385C755.145 78.068 757.001 75.8048 760.558 75.784L806.812 75.4502C830.967 75.2729 813.247 33.0859 780.853 33.3154C757.45 33.4823 740.012 57.7619 740.251 90.1661C740.46 119.379 756.135 137.808 780.853 137.63C794.338 137.536 807.938 128.63 815.521 114.717C819.963 107.01 815.813 103.849 810.619 110.629ZM756.918 64.0091C759.619 49.5644 767.994 41.6485 780.353 41.5546C792.336 41.4712 800.825 50.211 800.919 62.3821C800.971 69.3073 794.036 69.1717 761.83 69.4012C757.335 69.4325 756.208 68.1287 756.918 64.0091Z"
          fill="#F1F0E4"
        />
        <path
          d="M860.638 127.881C849.395 126.838 844.118 122.385 843.878 114.145C843.617 104.227 842.898 81.3762 842.824 72.3965C842.47 23.1488 842.397 12.2813 842.898 4.04208C843.064 0.67338 839.675 -0.80759 836.692 1.27829C833.146 3.5519 826.419 5.65865 818.003 7.21263C811.641 8.38072 812.058 13.439 818.055 13.95C824.052 14.4715 827.253 17.0684 827.848 21.9285C828.63 27.1641 829.423 59.5578 829.506 70.613C829.579 80.7296 829.746 104.321 829.256 114.062C828.766 123.428 825.23 127.015 815.124 128.204C808.011 129.007 808.428 134.618 815.353 134.566C823.03 134.514 829.955 133.148 837.255 133.096C844.744 133.043 853.369 133.732 860.482 134.243C867.042 134.754 867.365 128.58 860.628 127.871L860.638 127.881Z"
          fill="#F1F0E4"
        />
        <path
          d="M875.365 53.9753C875.302 45.7361 881.445 39.5097 889.497 39.4576C899.801 39.3846 910.345 48.479 914.934 61.7452C917.03 67.1581 922.078 65.8127 920.545 60.0244C918.428 51.9833 917.854 49.9287 915.362 41.7104C913.63 35.922 905.182 32.4177 892.824 32.5116C875.97 32.6368 863.131 44.714 863.246 60.2538C863.454 89.2789 912.713 89.8629 912.869 111.587C912.952 123.008 906.82 130.36 897.277 130.423C884.167 130.517 872.653 117.303 868.461 107.405C865.978 101.429 860.555 102.222 861.723 108.386C862.693 113.246 865.196 122.403 866.531 126.147C867.678 129.13 868.252 131.195 871.068 132.478C876.512 134.689 882.154 137.077 895.076 136.983C911.367 136.868 925.509 123.842 925.405 109.053C925.144 73.2906 875.532 74.9489 875.386 53.9753H875.365Z"
          fill="#F1F0E4"
        />
      </svg>
    </motion.div>
  );
}

function Announcement({data, isLoaded, shouldAnimate}) {
  function formatDateToMmDdYyyy(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
  }
  return (
    <motion.div
      className="announcement-container"
      initial={{opacity: 0}}
      animate={isLoaded ? {opacity: 1} : {opacity: 0}}
      transition={{
        delay: shouldAnimate ? 2 : 0,
        duration: shouldAnimate ? 1 : 0,
        ease: 'easeInOut',
      }}
      key={'announce'}
    >
      <p style={{fontWeight: 'bold'}}>{formatDateToMmDdYyyy(data.date)}</p>
      <h3 style={{marginBottom: '.25rem', marginTop: '.25rem'}}>
        {data.title}
      </h3>
      <p>{data.description}</p>
    </motion.div>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({products}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <Link
                      key={product.id}
                      className="recommended-product"
                      to={`/products/${product.handle}`}
                    >
                      <Image
                        data={product.images.nodes[0]}
                        aspectRatio="1/1"
                        sizes="(min-width: 45em) 20vw, 50vw"
                      />
                      <h4>{product.title}</h4>
                      <small>
                        <Money data={product.priceRange.minVariantPrice} />
                      </small>
                    </Link>
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
