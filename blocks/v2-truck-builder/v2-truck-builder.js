import { createElement } from '../../scripts/common.js';

const windowBreakpoint = 744;
const getDevice = () => window.innerWidth >= windowBreakpoint;

const blockName = 'v2-truck-builder';
const isDesktop = getDevice();

const addAccordionClass = (item, idx) => {
  const hasPicture = item.querySelector('picture');
  if (hasPicture) {
    item.classList.add(`${blockName}__item-image`);
    const allImages = [...item.querySelectorAll('picture')];
    if (allImages.length > 1) {
      const bgImage = allImages[allImages.length - 1];
      bgImage.classList.add(`${blockName}__bg-image`);
    }
  } else {
    const header = item.querySelector(':is(h1, h2, h3, h4, h5, h6)');
    if (header) header.classList.add(`${blockName}__item-title`, `number-title-${idx + 1}`);
    item.classList.add(`${blockName}__item-description`);
  }
};

const watchScroll = (container) => {
  const items = container.querySelectorAll(`.${blockName}__item`);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const intersecting = entry.isIntersecting;
      if (intersecting) {
        entry.target.classList.add('active');
      } else {
        entry.target.classList.remove('active');
      }
    });
  }, { threshold: 0.5 });
  items.forEach((item) => {
    if (!isDesktop) {
      observer.observe(item);
    } else {
      observer.disconnect();
    }
  });
};

const getIdxNumber = (item) => {
  let selected;
  if (item.tagName === 'BUTTON') {
    selected = item.querySelector(`.${blockName}__item-title`);
  } else {
    selected = item;
  }
  let num;
  const classes = [...selected.classList];
  classes.forEach((el) => {
    if (el.substring(0, 7) === 'number-') {
      num = el.split('-').pop();
    }
  });
  return Number(num);
};

export default function decorate(block) {
  const header = block.querySelector(':scope > div:first-child > div > :first-child');
  const button = block.querySelector(':scope > div:last-child > div > :last-child');
  const accordionItems = [...block.querySelectorAll(':scope > div:not(:first-child):not(:last-child')];

  const accordionContainer = createElement('div', { classes: `${blockName}__accordion-container` });
  const itemsContainer = createElement('div', { classes: `${blockName}__items-container` });
  block.parentElement.classList.add('full-width');
  header.parentElement.classList.add(`${blockName}__header-wrapper`);
  header.parentElement.parentElement.classList.add(`${blockName}__header-container`);

  // style the header as an h2 with red marker over it
  header.classList.add(`${blockName}__header`, 'with-marker');

  // is responsibility of the author to add the proper amount of images and text
  accordionItems.forEach((item, i) => {
    const colBtnTitle = createElement('button', {
      classes: `${blockName}__item-header-button`,
      props: { type: 'button' },
    });
    const colItems = [...item.querySelectorAll(':scope > div')];

    // add the proper classes to each accordion item
    item.classList.add(`${blockName}__item`, `number-item-${i + 1}`);
    if ((i === 0) && (isDesktop)) item.classList.add('active');
    colItems.forEach((col) => addAccordionClass(col, i));
    colBtnTitle.prepend(item.querySelector(`.${blockName}__item-title`));
    colBtnTitle.onclick = (e) => {
      if (!isDesktop) {
        const clickedNum = getIdxNumber(e.target);
        const selectedItem = itemsContainer.querySelector(`.number-title-${clickedNum}`);
        const { x: itemWidth } = selectedItem.getBoundingClientRect();
        itemsContainer.scrollLeft += itemWidth;
      } else {
        const active = accordionContainer.querySelector('.active');
        if (active && active !== item) active.classList.remove('active');
        item.classList.add('active');
      }
    };

    item.prepend(colBtnTitle);
    itemsContainer.appendChild(item);
  });
  button.classList.add(`${blockName}__builder-button`);
  button.classList.replace('button--primary', 'button--large');

  accordionContainer.append(itemsContainer, button);
  block.appendChild(accordionContainer);
  watchScroll(itemsContainer);
}
