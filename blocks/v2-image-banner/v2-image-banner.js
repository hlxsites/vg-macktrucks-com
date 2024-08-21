import {
  unwrapDivs,
  variantsClassesToBEM,
} from '../../scripts/common.js';

const variantClasses = ['16-9', '4-3'];
const blockName = 'v2-image-banner';

/**
 * Retrieves the image source URL from a block element.
 * @param {HTMLElement} block - The block element containing the picture.
 * @returns {string} The image source URL.
 */
const getImgSrc = (block) => {
  const picture = block.querySelector('picture');
  if (!picture) return '';

  const sources = Array.from(picture.querySelectorAll('source'));
  const matchingSource = sources.find((source) => {
    const media = source.getAttribute('media');
    return !media || window.matchMedia(media).matches;
  });

  if (matchingSource) {
    return matchingSource.getAttribute('srcset');
  }

  const img = picture.querySelector('img');
  return img ? img.getAttribute('src') : '';
};

/**
 * Sets the background image of a block element and removes the picture element.
 * @param {HTMLElement} block - The block element to set the background image for.
 * @param {string} imgSrc - The image source URL.
 */
const setImgSrc = (block, imgSrc) => {
  block.style.backgroundImage = `url(${imgSrc})`;
  const picture = block.querySelector('picture');
  if (picture) {
    picture.remove();
  }
};

/**
 * Decorates the block element with the appropriate classes and background image.
 * @param {HTMLElement} block - The block element to decorate.
 */
export default async function decorate(block) {
  variantsClassesToBEM(block.classList, variantClasses, blockName);
  block.parentElement.classList.add('full-width');

  const imgSrc = getImgSrc(block);
  if (imgSrc) {
    setImgSrc(block, imgSrc);
  }

  unwrapDivs(block);
}
