import { readBlockConfig } from '../../scripts/aem.js';
import {
  createElement,
  getTextLabel,
  variantsClassesToBEM,
  isLinkExternal,
} from '../../scripts/common.js';

const blockName = 'v2-breadcrumb';
const sectionStatus = 'data-section-status';
const breadcrumb = getTextLabel('breadcrumb');
const homeText = {
  home: getTextLabel('home'),
  ellipsis: '…', // unicode ellipsis
};
const variantClasses = ['custom'];

const formatText = (str) => str.replace(/-/g, ' ').toLowerCase();

const getPadding = (elCompCSS) => parseInt(elCompCSS.getPropertyValue('padding-left'), 10)
      + parseInt(elCompCSS.getPropertyValue('padding-right'), 10);

const getCrumbsWidth = (block) => {
  const crumbs = block.querySelectorAll(`.${blockName}__crumb-item`);
  return [...crumbs].reduce((acc, item) => {
    const itemCompCSS = window.getComputedStyle(item);
    return acc + parseInt(itemCompCSS.getPropertyValue('width'), 10);
  }, 0);
};

const getBlockWidth = (block) => {
  const computedCSS = window.getComputedStyle(block);
  const blockWidth = parseInt(computedCSS.getPropertyValue('width'), 10);
  const boxSizing = computedCSS.getPropertyValue('box-sizing');
  const padding = boxSizing === 'border-box' ? getPadding(computedCSS) : 0;
  return blockWidth - padding;
};

const fitting = (block) => getCrumbsWidth(block) < getBlockWidth(block);

const makeCustomUrl = (bread) => {
  const allCrumbs = [];
  const allEls = bread.querySelectorAll('p');

  if (allEls) {
    for (let i = 0; i < allEls.length; i += 2) {
      const key = allEls[i].textContent;
      const value = i + 1 < allEls.length ? allEls[i + 1].textContent : '';
      allCrumbs.push({ key, value });
    }
  }
  const keyString = allCrumbs.map((obj) => obj.key).join('/');
  return ([keyString, allCrumbs]);
};

export default function decorate(block) {
  variantsClassesToBEM(block.classList, variantClasses, blockName);
  let url;
  let customLinks;
  const isCustomPath = block.classList.contains(`${blockName}--custom`);

  const cfg = readBlockConfig(block);
  const hasPath = cfg && Object.hasOwn(cfg, 'path');

  if (hasPath) {
    url = cfg.path;
  } else if (isCustomPath) {
    const [customPath, allCrumbs] = makeCustomUrl(block);
    customLinks = allCrumbs;
    url = customPath;
  } else {
    url = window.location.pathname;
  }

  const path = url.split('/').filter(Boolean);
  const nav = createElement('nav', { classes: [`${blockName}__crumb-nav`] });
  const ul = createElement('ul', { classes: [`${blockName}__crumb-list`] });

  const crumbs = path.map((_, i) => {
    const liEl = createElement('li', { classes: [`${blockName}__crumb-item`] });
    const content = isCustomPath ? path[i] : formatText(path[i]);
    const crumbProps = { 'data-content': content };
    const crumbClasses = [`${blockName}__crumb`];
    if (i !== path.length - 1) {
      crumbProps.href = isCustomPath ? `${customLinks[i].value}` : `/${path.slice(0, i + 1).join('/')}/`;
    } else {
      crumbClasses.push(`${blockName}__crumb--active`);
      crumbProps['aria-current'] = 'page';
    }
    const crumb = createElement('a', { classes: crumbClasses, props: crumbProps });
    if (isCustomPath) isLinkExternal(crumb);
    crumb.textContent = content;
    liEl.append(crumb);
    return liEl;
  });
  const homeItem = createElement('li', { classes: [`${blockName}__crumb-item`] });
  const homeEl = createElement('a', {
    classes: [`${blockName}__crumb`, `${blockName}__crumb--home`],
    props: { href: isCustomPath ? `${customLinks[0].value}` : '/' },
  });
  isLinkExternal(homeEl);

  homeEl.textContent = isCustomPath ? `${customLinks[0].key}` : homeText.home;
  homeItem.append(homeEl);
  crumbs.unshift(homeItem);
  if (isCustomPath) crumbs.splice(1, 1);
  ul.append(...crumbs);
  nav.append(ul);
  block.textContent = '';
  block.append(nav);
  block.parentElement.classList.add('full-width');
  block.setAttribute('aria-label', breadcrumb);

  const checkCrumbsFits = () => {
    // 1st check if home fits, if not it become an ellipsis
    if (!fitting(block) && crumbs.length > 2) homeEl.textContent = homeText.ellipsis;
    // if still doesn't fit, remove active crumb
    if (!fitting(block)) {
      crumbs.at(-1).firstElementChild.textContent = '';
      crumbs.at(-1).classList.add(`${blockName}__crumb-item--hidden`);
    }
    // if it still doesn't fit again, remove the crumbs from the middle
    if (!fitting(block)) {
      let i = 1;
      while (i < crumbs.length - 2 && !fitting(block)) {
        crumbs[i].firstElementChild.textContent = '';
        crumbs[i].classList.add(`${blockName}__crumb-item--hidden`);
        i += 1;
      }
    }
  };

  const rObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.contentBoxSize) return;
      // add again the content from each item and check if it fits again or not
      homeEl.textContent = isCustomPath ? `${customLinks[0].key}` : homeText.home;
      crumbs.forEach((crumb, i) => {
        const link = crumb.firstElementChild;
        if (i > 0) {
          crumb.classList.remove(`${blockName}__crumb-item--hidden`);
          link.textContent = link.dataset.content;
        }
      });
      checkCrumbsFits();
    });
  });

  const mObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // check if the attribute data-section-status has the value 'loaded'
      if (mutation.attributeName !== sectionStatus) return;
      const section = mutation.target;
      const status = section.getAttribute(sectionStatus);
      if (status !== 'loaded') return;
      rObserver.observe(block);
      mObserver.disconnect();
    });
  });
  mObserver.observe(block.closest('.section'), {
    childList: true, attributeFilter: [sectionStatus],
  });
}
