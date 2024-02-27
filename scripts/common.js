import {
  sampleRUM,
  loadCSS,
  loadBlock,
  loadBlocks,
  loadHeader,
  loadFooter,
} from './lib-franklin.js';
import { COOKIE_VALUES } from './constants.js';

const { performance, targeting, social } = COOKIE_VALUES;
let placeholders = null;

export async function getPlaceholders() {
  placeholders = await fetch('/placeholder.json').then((resp) => resp.json());
}

export function getTextLabel(key) {
  return placeholders.data.find((el) => el.Key === key)?.Text || key;
}

/**
 * Create an element with the given id and classes.
 * @param {string} tagName the tag
 * @param {Object} options the element options
 * @param {string[]|string} [options.classes=[]] the class or classes to add
 * @param {Object} [options.props={}] any other attributes to add to the element
 * @returns {HTMLElement} the element
 */
export function createElement(tagName, options = {}) {
  const { classes = [], props = {} } = options;
  const elem = document.createElement(tagName);
  const isString = typeof classes === 'string';
  if (classes || (isString && classes !== '') || (!isString && classes.length > 0)) {
    const classesArr = isString ? [classes] : classes;
    elem.classList.add(...classesArr);
  }
  if (!isString && classes.length === 0) elem.removeAttribute('class');

  if (props) {
    Object.keys(props).forEach((propName) => {
      const value = propName === props[propName] ? '' : props[propName];
      elem.setAttribute(propName, value);
    });
  }

  return elem;
}
/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = createElement('link', { props: { rel: 'icon', type: 'image/svg+xml', href } });
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

export async function loadTemplate(doc, templateName) {
  try {
    const cssLoaded = new Promise((resolve) => {
      loadCSS(`${window.hlx.codeBasePath}/templates/${templateName}/${templateName}.css`, resolve);
    });
    const decorationComplete = new Promise((resolve) => {
      (async () => {
        try {
          const mod = await import(`../templates/${templateName}/${templateName}.js`);
          if (mod.default) {
            await mod.default(doc);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(`failed to load module for ${templateName}`, error);
        }
        resolve();
      })();
    });
    await Promise.all([cssLoaded, decorationComplete]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`failed to load block ${templateName}`, error);
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
export async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();
  const header = doc.querySelector('header');

  loadHeader(header);
  loadFooter(doc.querySelector('footer'));

  const subnav = header?.querySelector('.block.sub-nav');
  if (subnav) {
    loadBlock(subnav);
  }

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.svg`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
export function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => {
    // eslint-disable-next-line import/no-cycle
    import('./delayed.js');
  }, 3000);
  // load anything that can be postponed to the latest here
}

export const removeEmptyTags = (block) => {
  block.querySelectorAll('*').forEach((x) => {
    const tagName = `</${x.tagName}>`;

    // checking that the tag is not autoclosed to make sure we don't remove <meta />
    // checking the innerHTML and trim it to make sure the content inside the tag is 0
    if (
      x.outerHTML.slice(tagName.length * -1).toUpperCase() === tagName
      // && x.childElementCount === 0
      && x.innerHTML.trim().length === 0) {
      x.remove();
    }
  });
};

export const unwrapDivs = (element) => {
  Array.from(element.children).forEach((node) => {
    if (node.tagName === 'DIV' && node.attributes.length === 0) {
      while (node.firstChild) {
        element.insertBefore(node.firstChild, node);
      }
      node.remove();
      unwrapDivs(element);
    } else {
      unwrapDivs(node);
    }
  });
};

export const variantsClassesToBEM = (blockClasses, expectedVariantsNames, blockName) => {
  expectedVariantsNames.forEach((variant) => {
    if (blockClasses.contains(variant)) {
      blockClasses.remove(variant);
      blockClasses.add(`${blockName}--${variant}`);
    }
  });
};

export const slugify = (text) => (
  text.toString().toLowerCase().trim()
    // separate accent from letter
    .normalize('NFD')
    // remove all separated accents
    .replace(/[\u0300-\u036f]/g, '')
    // replace spaces with -
    .replace(/\s+/g, '-')
    // replace & with 'and'
    .replace(/&/g, '-and-')
    // remove all non-word chars
    .replace(/[^\w-]+/g, '')
    // replace multiple '-' with single '-'
    .replace(/--+/g, '-')
);

/**
 * Check if one trust group is checked.
 * @param {String} groupName the one trust group like: C0002
 */
export function checkOneTrustGroup(groupName) {
  const oneTrustCookie = decodeURIComponent(document.cookie.split(';').find((cookie) => cookie.trim().startsWith('OptanonConsent=')));
  return oneTrustCookie.includes(`${groupName}:1`);
}

export function isPerformanceAllowed() {
  return checkOneTrustGroup(performance);
}

export function isTargetingAllowed() {
  return checkOneTrustGroup(targeting);
}

export function isSocialAllowed() {
  return checkOneTrustGroup(social);
}

/**
 * Helper for delaying a function
 * @param {function} func callback function
 * @param {number} timeout time to debouce in ms, default 200
*/
export function debounce(func, timeout = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

/**
 * Returns a list of properties listed in the block
 * @param {string} route get the Json data from the route
 * @returns {Object} the json data object
*/
export const getJsonFromUrl = async (route) => {
  try {
    const response = await fetch(route);
    if (!response.ok) return null;
    const json = await response.json();
    return json;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('getJsonFromUrl:', { error });
  }
  return null;
};

/*
  The generateId function should be used only
  for generating the id for UI elements
*/
let idValue = 0;

export const generateId = (prefix = 'id') => {
  idValue += 1;
  return `${prefix}-${idValue}`;
};

export const adjustPretitle = (element) => {
  const headingSelector = 'h1, h2, h3, h4, h5, h6';

  [...element.querySelectorAll(headingSelector)].forEach((heading) => {
    const isNextElHeading = heading.nextElementSibling?.matches(headingSelector);
    if (!isNextElHeading) {
      return;
    }

    const currentLevel = Number(heading.tagName[1]);
    const nextElLevel = Number(heading.nextElementSibling.tagName[1]);

    if (currentLevel > nextElLevel) {
      const pretitle = createElement('span', { classes: ['pretitle'] });
      pretitle.append(...heading.childNodes);

      heading.replaceWith(pretitle);
    }
  });
};

/**
 * Extracts the URL without query parameters of images from an array of picture elements
 * @param {HTMLElement} images - An array of picture elements
 * @returns {Array} Array of src strings
 */
export function getImageURLs(pictures) {
  return pictures.map((picture) => {
    const imgElement = picture.querySelector('img');
    return imgElement.getAttribute('src').split('?')[0];
  });
}

/**
 * Creates a picture element based on provided image data and breakpoints
 * @param {Array} images - Array of objects defining image data and breakpoints
 * @param {boolean} eager - Whether to load images eagerly
 * @param {string} alt - Alt text for the image
 * @param {string[]|string} imageClass - Class for the image
 * @returns {HTMLElement} The created picture element
 */
export function createResponsivePicture(images, eager, alt, imageClass) {
  const picture = document.createElement('picture');
  let fallbackWidth = '';
  let fallbackSrc = '';

  function constructSrcset(src, width, format) {
    const baseUrl = `${src}?format=${format}&optimize=medium`;
    return `${baseUrl}&width=${width} 1x, ${baseUrl}&width=${width * 2} 2x`;
  }

  images.forEach((image) => {
    const originalFormat = image.src.split('.').pop();

    image.breakpoints.forEach((bp) => {
      if (!bp.media) return;

      const srcsetWebp = constructSrcset(image.src, bp.width, 'webp');
      const srcsetOriginal = constructSrcset(image.src, bp.width, originalFormat);

      const webpSource = createElement('source', {
        props: {
          type: 'image/webp',
          srcset: srcsetWebp,
          media: bp.media,
        },
      });

      const originalSource = createElement('source', {
        props: {
          type: `image/${originalFormat}`,
          srcset: srcsetOriginal,
          media: bp.media,
        },
      });

      picture.insertBefore(originalSource, picture.firstChild);
      picture.insertBefore(webpSource, originalSource);
    });

    const fallbackBreakpoint = image.breakpoints.find((bp) => !bp.media);
    if (fallbackBreakpoint && !fallbackSrc) {
      fallbackWidth = fallbackBreakpoint.width;
      fallbackSrc = `${image.src}?width=${fallbackWidth}&format=${originalFormat}&optimize=medium`;
    }
  });

  const img = createElement('img', {
    classes: imageClass,
    props: {
      src: fallbackSrc,
      alt,
      loading: eager ? 'eager' : 'lazy',
      width: fallbackWidth,
    },
  });

  picture.appendChild(img);

  return picture;
}
