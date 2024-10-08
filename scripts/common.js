import {
  sampleRUM,
  loadCSS,
  loadBlock,
  loadBlocks,
  loadHeader,
  loadFooter,
} from './aem.js';

let placeholders = null;

export const getLanguagePath = () => {
  const { pathname } = new URL(window.location.href);
  const langCodeMatch = pathname.match('^(/[a-z]{2}(-[a-z]{2})?/).*');
  return langCodeMatch ? langCodeMatch[1] : '/';
};

export async function getPlaceholders() {
  const url = `${getLanguagePath()}placeholder.json`;
  placeholders = await fetch(url).then((resp) => resp.json());
}

export function getTextLabel(key) {
  return placeholders.data.find((el) => el.Key === key)?.Text || key;
}

/**
 * Returns the true origin of the current page in the browser.
 * If the page is running in a iframe with srcdoc, the ancestor origin is returned.
 * @returns {String} The true origin
 */
export function getOrigin() {
  return window.location.href === 'about:srcdoc' ? window.parent.location.origin : window.location.origin;
}

/**
 * Returns the true of the current page in the browser.mac
 * If the page is running in a iframe with srcdoc,
 * the ancestor origin + the path query param is returned.
 * @returns {String} The href of the current page or the href of the block running in the library
 */
export function getHref() {
  if (window.location.href !== 'about:srcdoc') return window.location.href;

  const urlParams = new URLSearchParams(window.parent.location.search);
  return `${window.parent.location.origin}${urlParams.get('path')}`;
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
      const isBooleanAttribute = propName === 'allowfullscreen' || propName === 'autoplay' || propName === 'muted' || propName === 'controls';

      // For boolean attributes, add the attribute without a value if it's truthy
      if (isBooleanAttribute) {
        if (props[propName]) {
          elem.setAttribute(propName, '');
        }
      } else {
        const value = props[propName];
        elem.setAttribute(propName, value);
      }
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

const ICONS_CACHE = {};
/**
 * Replace icons with inline SVG and prefix with codeBasePath.
 * @param {Element} [element] Element containing icons
 */
export async function decorateIcons(element) {
  // Prepare the inline sprite
  let svgSprite = document.getElementById('franklin-svg-sprite');
  if (!svgSprite) {
    const div = document.createElement('div');
    div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" id="franklin-svg-sprite" style="display: none"></svg>';
    svgSprite = div.firstElementChild;
    document.body.append(div.firstElementChild);
  }

  // Download all new icons
  const icons = [...element.querySelectorAll('span.icon')];
  await Promise.all(icons.map(async (span) => {
    const iconName = Array.from(span.classList).find((c) => c.startsWith('icon-')).substring(5);
    if (!ICONS_CACHE[iconName]) {
      ICONS_CACHE[iconName] = true;
      try {
        const response = await fetch(`${window.hlx.codeBasePath}/icons/${iconName}.svg`);
        if (!response.ok) {
          ICONS_CACHE[iconName] = false;
          return;
        }
        // Styled icons don't play nice with the sprite approach because of shadow dom isolation
        const svg = await response.text();
        if (svg.match(/(<style | class=)/)) {
          ICONS_CACHE[iconName] = { styled: true, html: svg };
        } else {
          ICONS_CACHE[iconName] = {
            html: svg
              .replace('<svg', `<symbol id="icons-sprite-${iconName}"`)
              .replace(/ width=".*?"/, '')
              .replace(/ height=".*?"/, '')
              .replace('</svg>', '</symbol>'),
          };
        }
      } catch (error) {
        ICONS_CACHE[iconName] = false;
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  }));

  const symbols = Object
    .keys(ICONS_CACHE).filter((k) => !svgSprite.querySelector(`#icons-sprite-${k}`))
    .map((k) => ICONS_CACHE[k])
    .filter((v) => !v.styled)
    .map((v) => v.html)
    .join('\n');
  svgSprite.innerHTML += symbols;

  icons.forEach((span) => {
    const iconName = Array.from(span.classList).find((c) => c.startsWith('icon-')).substring(5);
    const parent = span.firstElementChild?.tagName === 'A' ? span.firstElementChild : span;
    // Styled icons need to be inlined as-is, while unstyled ones can leverage the sprite
    if (ICONS_CACHE[iconName].styled) {
      parent.innerHTML = ICONS_CACHE[iconName].html;
    } else {
      parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"><use href="#icons-sprite-${iconName}"/></svg>`;
    }
  });
}

export async function loadTemplate(doc, templateName) {
  try {
    await loadCSS(`${window.hlx.codeBasePath}/templates/${templateName}/${templateName}.css`);
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
    await decorationComplete;
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

/**
 * This function recursively traverses the child elements of a given element
 * and removes all <div> elements that have no attributes,
 * moving their children to the parent element.
 * @param {HTMLElement} element the parent element to remove its children
 * @param {Object} options the unwrap options
 * @param {boolean} [options.ignoreDataAlign=false] whether to ignore divs with data-align attribute
 * @returns {void}
 */
export const unwrapDivs = (element, options = {}) => {
  const stack = [element];
  const { ignoreDataAlign = false } = options;

  while (stack.length > 0) {
    const currentElement = stack.pop();

    let i = 0;
    while (i < currentElement.children.length) {
      const node = currentElement.children[i];
      const attributesLength = [...node.attributes].filter((el) => {
        if (ignoreDataAlign) {
          return !(el.name.startsWith('data-align') || el.name.startsWith('data-valign'));
        }

        return el;
      }).length;

      if (node.tagName === 'DIV' && attributesLength === 0) {
        while (node.firstChild) {
          currentElement.insertBefore(node.firstChild, node);
        }
        node.remove();
      } else {
        stack.push(node);
        i += 1;
      }
    }
  }
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
 * Loads the constants file where configuration values are stored
 */
async function getConstantValues() {
  const url = `${getLanguagePath()}constants.json`;
  let constants;
  try {
    const response = await fetch(url).then((resp) => resp.json());
    if (!response.ok) {
      constants = response;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error with constants file', error);
  }
  return constants;
}

/**
 * Extracts the values from an array in format: ['key1: value1', 'key2: value2', 'key3: value3']
 * and returns this into an object with those keys and values:
 * { key1: value1, key2: value2, key3: value3 }
 * @param {Array} data - Array of strings that contain an object coming from sharepoint
 * @returns {Object} An parsed object with those values and keys
 */
export const extractObjectFromArray = (data) => {
  const obj = {};
  for (const item of data) {
    try {
      if (typeof item !== 'string' || !item.includes(':')) {
        throw new TypeError(`Invalid input: "${item}". Expected a string: "key: value".`);
      }
      const [key, value] = item.split(':', 2);
      obj[key.trim()] = value.trim();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Error with item: "${item}"`, error);
    }
  }
  return obj;
};

export const formatValues = (values) => {
  const obj = {};
  /* eslint-disable-next-line */
  if (values) values.forEach(({ name, value }) => obj[name] = value);
  return obj;
};

const {
  searchUrls,
  cookieValues,
  magazineConfig,
  headerConfig,
  tools,
  truckConfiguratorUrls,
  newsFeedConfig,
  bodyBuilderNewsConfig,
} = await getConstantValues();

// This data comes from the sharepoint 'constants.xlsx' file
export const SEARCH_URLS = formatValues(searchUrls?.data);
export const COOKIE_CONFIGS = formatValues(cookieValues?.data);
export const MAGAZINE_CONFIGS = formatValues(magazineConfig?.data);
export const HEADER_CONFIGS = formatValues(headerConfig?.data);
export const TOOLS_CONFIGS = formatValues(tools?.data);
export const TRUCK_CONFIGURATOR_URLS = formatValues(truckConfiguratorUrls?.data);
export const NEWS_FEED_CONFIGS = formatValues(newsFeedConfig?.data);
export const BODY_BUILDER_NEWS_CONFIGS = formatValues(bodyBuilderNewsConfig?.data);

/**
 * Check if one trust group is checked.
 * @param {String} groupName the one trust group like: C0002
 */
export function checkOneTrustGroup(groupName, cookieCheck = false) {
  const oneTrustCookie = decodeURIComponent(document.cookie.split(';').find((cookie) => cookie.trim().startsWith('OptanonConsent=')));
  return cookieCheck || oneTrustCookie.includes(`${groupName}:1`);
}

const {
  PERFORMANCE_COOKIE = false,
  FUNCTIONAL_COOKIE = false,
  TARGETING_COOKIE = false,
  SOCIAL_COOKIE = false,
} = COOKIE_CONFIGS;

export function isPerformanceAllowed() {
  return checkOneTrustGroup(PERFORMANCE_COOKIE);
}

export function isFunctionalAllowed() {
  return checkOneTrustGroup(FUNCTIONAL_COOKIE);
}

export function isTargetingAllowed() {
  return checkOneTrustGroup(TARGETING_COOKIE);
}

export function isSocialAllowed() {
  return checkOneTrustGroup(SOCIAL_COOKIE);
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

/**
 * See https://www.aem.live/developer/spreadsheets#arrays
 * Converts a string representation of an array, removing all brackets, backslashes, and quotes,
 * into an actual JavaScript array. Splits on commas, trims each string, and filters out empty
 * strings to ensure all elements contain valid data.
 *
 * @param {string} inputString - The string to be converted. It should mimic a serialized array,
 *                               often found in JSON-like structures where arrays are represented
 *                               as strings due to data transmission constraints.
 * @returns {string[]} An array of strings derived from the cleaned input string. Each element
 *                     is a trimmed, non-empty string that was separated by a comma in the
 *                     original input.
 */
export const formatStringToArray = (inputString) => {
  // eslint-disable-next-line no-useless-escape
  const cleanedString = inputString.replace(/[\[\]\\'"]+/g, '');
  return cleanedString.split(',')
    .map((item) => item.trim())
    .filter((item) => item);
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

export const deepMerge = (originalTarget, source) => {
  let target = originalTarget;
  // Initialize target as an empty object if it's undefined or null
  if (typeof target !== 'object' || target === null) {
    target = {};
  }

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = target[key];
    const sourceIsPlainObject = Object.prototype.toString.call(sourceValue) === '[object Object]';
    const targetIsPlainObject = Object.prototype.toString.call(targetValue) === '[object Object]';

    if (sourceIsPlainObject && targetIsPlainObject) {
      target[key] = target[key] || {};
      deepMerge(target[key], sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });
  return target;
};

/**
 * Clear/removes all of the attributes of an element by reference
 * @param {HTMLElement} element - Element to clear attributes from
 * @returns {HTMLElement} The created picture element
 *
 * USAGE:
 * Clean by reference:
 *
 * clearElementAttributes(element);
 * // Then do things on the clean element...
 *
 * OR, leverage the return of the element and do chaining operations:
 *
 * removeAllAttributes(element).classList.add('SOME-CLASS-NAME');
 *
 */
export const clearElementAttributes = (element) => {
  // Get all attributes of the element
  const attributes = Array.from(element.attributes);

  // Loop through the attributes and remove them
  attributes.forEach((attr) => {
    element.removeAttribute(attr.name);
  });

  return element;
};

/**
 * Extracts the values from an array of objects and returns an array of values
 * example: [{ key: 'value' }] => ['value']
 * @param {Array} array - An array of objects
 * @returns {Array} An array of values
 */
function getValuesFromObjectsArray(array = []) {
  if (!Array.isArray(array) || array.length === 0) return [];
  return array.map((item) => Object.values(item)[0]);
}

// Magazine common functions
/**
 * Get the magazine-article the JSON file at the root folder in sharepoint.
 * Filters out the articles with no image
 * @returns {Object} the object that contains all the magazine articles metadata
 */
export const getAllArticles = async () => {
  const magazineArticlesUrl = '/magazine-articles.json';
  const response = await fetch(magazineArticlesUrl);
  const json = await response.json();
  const filteredArray = json.data.filter((art) => art.image !== '');

  return filteredArray;
};

/**
 * Extracts the matching tags from an array of tags and an array of article tags
 * and returns a string of matching tags
 * @param {Array} tags - An array of tags from the JSON file
 * @param {Array} articleTags - An array of article:tags
 * @returns {string} A string of matching tags
 */
function getMetadataFromTags(tags, articleTags) {
  if (!tags || !articleTags) {
    return '';
  }

  const matchingTags = [...articleTags]
    .filter((tag) => tags.includes(tag.content))
    .map((tag) => tag.content);
  return matchingTags && matchingTags?.length > 0 ? matchingTags.join(', ') : '';
}

/**
 * Get the article tags from the JSON file and the article tags from the document
 * and return the matching tags
 * @param {string} tagType - The type of tag to get such as 'categories', 'topics' or 'trucks'
 * @returns {string} A string of matching tags
 */
export async function getArticleTags(tagType) {
  const articleTags = document.head.querySelectorAll('meta[property="article:tag"]') || [];
  const tagItems = await getAllArticles();
  const tags = tagItems && tagItems[tagType]
    && getValuesFromObjectsArray(tagItems[tagType].data);
  return getMetadataFromTags(tags, articleTags);
}

/**
 * Extract the classes of a block and in case there is a 'limit-X' set, extract it as a number
 * @param {block} block - The block element
 * @returns {number} A number representing the limit
 */
export const getLimit = (block) => {
  const classes = block.classList;
  let limit;
  classes.forEach((e) => {
    const [name, value] = e.split('-');
    if (name === 'limit') limit = Number(value);
  });
  return limit;
};

/**
 * Extract the article that is currently open and delete it from the article list
 * @param {Array} articles - The list of articles
 */
export const deleteCurrentArticle = (articles) => articles.filter((e) => {
  const currentArticlePath = window.location.href.split('/').pop();
  const path = e.path.split('/').pop();
  if (path !== currentArticlePath) return e;
  return null;
});

/**
 * Sorts the article list by the 'lastModified' field in the json
 * @param {Array} articles - The list of article
 * @returns {Array} The same list of articles but sorted by lastModified
 */
export const sortArticlesByLastModified = (articles) => articles.sort((a, b) => {
  a.lastModified = +(a.lastModified);
  b.lastModified = +(b.lastModified);
  return b.lastModified - a.lastModified;
});
