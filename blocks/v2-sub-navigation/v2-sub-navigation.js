import {
  createElement,
  decorateIcons,
} from '../../scripts/common.js';

const blockName = 'v2-sub-navigation';

/**
 * Toggles the dropdown menu.
 * @param {HTMLElement} dropdownWrapper - The wrapper element of the dropdown.
 * @returns {Function} Event handler function.
 */
const toggleDropdown = (dropdownWrapper) => (e) => {
  if (e.target.closest(`.${blockName}__active-item-wrapper`)) {
    dropdownWrapper.classList.toggle(`${blockName}__dropdown--open`);
  } else {
    dropdownWrapper.classList.remove(`${blockName}__dropdown--open`);
  }
};

/**
 * Fetches the sub-navigation HTML content.
 * @param {string} content - The content path.
 * @returns {Promise<DocumentFragment>} The fetched HTML content as a DocumentFragment.
 */
const fetchSubNavHtml = async (content) => {
  const response = await fetch(`${content}.plain.html`);
  if (!response.ok) throw new Error('Failed to fetch sub-navigation content');
  return document.createRange().createContextualFragment(await response.text());
};

/**
 * Creates a dropdown icon element.
 * @returns {HTMLElement} The created icon element.
 */
const createDropdownIcon = () => createElement('span', { classes: [`${blockName}__icon`, 'icon', 'icon-dropdown-caret'] });

/**
 * Sets up navigation items with appropriate classes.
 * @param {HTMLElement} list - The list element containing the navigation items.
 * @returns {NodeList} The list of navigation items.
 */
const setupNavItems = (list) => {
  const items = list.querySelectorAll('li');

  items.forEach((item) => {
    item.className = `${blockName}__item`;
  });

  return items;
};

/**
 * Creates a wrapper for the active navigation item.
 * @param {HTMLElement} activeItem - The active item element.
 * @returns {HTMLElement} The created wrapper element.
 */
const createActiveItemWrapper = (activeItem) => {
  const activeItemWrapper = createElement('div', { classes: `${blockName}__active-item-wrapper` });
  activeItemWrapper.append(activeItem, createDropdownIcon());
  return activeItemWrapper;
};

/**
 * Creates a dropdown container element.
 * @param {HTMLElement} activeItem - The active item element.
 * @param {HTMLElement} list - The list element containing the navigation items.
 * @returns {HTMLElement} The created dropdown container element.
 */
const createDropdownContainer = (activeItem, list) => {
  const container = createElement('div', { classes: `${blockName}__dropdown` });
  container.append(createActiveItemWrapper(activeItem), list);
  return container;
};

/**
 * Extracts anchor attributes from the given fragment.
 * @param {DocumentFragment} fragment - The HTML fragment.
 * @returns {Object|null} The extracted anchor attributes or null if not found.
 */
const extractAnchorAttributes = (fragment) => {
  const [mobileAnchor, desktopAnchor] = [...fragment.querySelectorAll('p a')];

  return mobileAnchor && desktopAnchor ? {
    mobileAnchorText: mobileAnchor.textContent,
    desktopAnchorText: desktopAnchor.textContent,
    anchorHref: mobileAnchor.href || desktopAnchor.href,
    anchorTitle: desktopAnchor.title,
  } : null;
};

/**
 * Creates a navigation anchor element.
 * @param {Object} anchorsAttributes - The attributes for the anchor.
 * @returns {HTMLElement} The created anchor element.
 */
const createNavAnchor = (anchorsAttributes) => {
  const anchor = createElement('a', {
    classes: ['button', 'button--large', 'button--cta', `${blockName}__cta`],
    props: { href: anchorsAttributes.anchorHref, title: anchorsAttributes.anchorTitle },
  });

  const mobileSpan = createElement('span', { classes: [`${blockName}__cta--mobile`] });
  const desktopSpan = createElement('span', { classes: [`${blockName}__cta--desktop`] });

  mobileSpan.textContent = anchorsAttributes.mobileAnchorText;
  desktopSpan.textContent = anchorsAttributes.desktopAnchorText;

  anchor.append(mobileSpan, desktopSpan);

  return anchor;
};

/**
 * Gets the current URL of the window.
 * @returns {string} The current URL.
 */
const getCurrentUrl = () => window.location.href;

/**
 * Gets the absolute href of an anchor element.
 * @param {HTMLElement} anchor - The anchor element.
 * @returns {string} The absolute href.
 */
const getAnchorHref = (anchor) => new URL(anchor.getAttribute('href'), window.location.origin).href;

/**
 * Sets a class on an item element.
 * @param {HTMLElement} item - The item element.
 * @param {string} className - The class name to add.
 */
const setActiveItemClass = (item, className) => {
  item.classList.add(className);
};

/**
 * Finds and sets the active item based on the current URL.
 * @param {NodeList} items - The list of navigation items.
 * @param {string} className - The class name to set on the active item.
 * @returns {string|null} The text content of the active item or null if not found.
 */
const findAndSetActiveItem = (items, className) => {
  const currentUrl = getCurrentUrl();

  for (const item of items) {
    const anchor = item.querySelector('a');

    if (anchor && getAnchorHref(anchor) === currentUrl) {
      setActiveItemClass(item, className);
      return anchor.textContent;
    }
  }

  return null;
};

/**
 * Sets up the sub-navigation block.
 * @param {HTMLElement} block - The navigation block element.
 * @param {string} content - The content path.
 */
const setupSubNavigation = async (block, content) => {
  try {
    const fragment = await fetchSubNavHtml(content);
    const list = fragment.querySelector('ul');
    if (!list) return;
    list.className = `${blockName}__items`;
    const items = setupNavItems(list);
    const activeItem = createElement('div', { classes: `${blockName}__active-item` });
    const activeText = findAndSetActiveItem(items, `${blockName}__item--active`);
    activeItem.textContent = activeText || '';
    const subNavWrapper = createElement('div', { classes: `${blockName}__wrapper` });
    const dropdownWrapper = createDropdownContainer(activeItem, list);
    const anchorsAttributes = extractAnchorAttributes(fragment);
    if (!anchorsAttributes) return;
    const anchor = createNavAnchor(anchorsAttributes);
    subNavWrapper.append(dropdownWrapper, anchor);
    block.append(subNavWrapper);
    document.addEventListener('click', toggleDropdown(dropdownWrapper));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
  }
};

/**
 * Decorates the sub-navigation block.
 * @param {HTMLElement} block - The navigation block element.
 */
const decorate = async (block) => {
  const metaContent = document.head.querySelector('meta[name="v2-sub-navigation"]');

  if (metaContent) {
    await setupSubNavigation(block, metaContent.content);
  }

  decorateIcons(block);
};

export default decorate;
