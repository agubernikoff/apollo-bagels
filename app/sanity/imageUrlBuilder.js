/**
 * Simple Sanity Image URL optimizer
 * Works by appending query parameters to existing Sanity CDN URLs
 * No external dependencies needed!
 */

/**
 * Get optimized URL from Sanity asset URL string
 * Converts raw Sanity CDN URLs to optimized versions
 *
 * @param {string} url - Raw Sanity CDN URL
 * @param {Object} options - Image optimization options
 * @param {number} options.width - Max width in pixels
 * @param {number} options.quality - Image quality 1-100
 * @param {string} options.format - Image format: 'webp', 'jpg', 'png'
 * @returns {string} Optimized image URL
 */
export function optimizeImageUrl(url, options = {}) {
  if (!url) return '';

  const {width = 1200, quality = 80, format = 'webp'} = options;

  // Check if URL already has parameters
  const hasParams = url.includes('?');
  const separator = hasParams ? '&' : '?';

  return `${url}${separator}w=${width}&q=${quality}&fm=${format}&fit=max`;
}

/**
 * Preset configurations for common use cases
 */
export const imagePresets = {
  carousel: {width: 800, quality: 85, format: 'webp'},
  hero: {width: 2000, quality: 85, format: 'webp'},
  background: {width: 2000, quality: 75, format: 'webp'},
  thumbnail: {width: 400, quality: 80, format: 'webp'},
  menu: {width: 600, quality: 85, format: 'webp'},
  location: {width: 1000, quality: 80, format: 'webp'},
};
