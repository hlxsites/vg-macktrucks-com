import { createElement, variantsClassesToBEM } from '../../scripts/common.js';

const CLASSES = {
  blockName: 'v2-accordion-column',
  left: 'left',
};

const { blockName, left } = CLASSES;
const variants = Object.values(CLASSES).splice(1);

const addAccordionClass = (item) => {
  const hasPicture = item.querySelector('picture');
  if (hasPicture) item.classList.add(`${blockName}__item-image`);
  else {
    const header = item.querySelector(':is(h1, h2, h3, h4, h5, h6)');
    if (header) header.classList.add(`${blockName}__item-title`);
    item.classList.add(`${blockName}__item-description`);
  }
};

export default function decorate(block) {
  const accordionItems = [...block.querySelectorAll(':scope > div')];
  const accordionContainer = createElement('div', { classes: `${blockName}__accordion-container` });
  const itemsContainer = createElement('div', { classes: `${blockName}__items-container` });
  const hasLeftClass = block.classList.contains(left); // accordion at left side
  /** @type {boolean} */
  const isLeftVariant = hasLeftClass
    || (!hasLeftClass && !!accordionItems[0].lastElementChild.querySelector('picture'));
  if (!hasLeftClass && isLeftVariant) block.classList.add(left);
  variantsClassesToBEM(block.classList, variants, blockName);
  block.parentElement.classList.add('full-width');

  // is responsibility of the author to add the proper amount of images and text
  accordionItems.forEach((item, i) => {
    const colBtnTitle = createElement('button', {
      classes: `${blockName}__item-header-button`,
      props: { type: 'button' },
    });
    const arrowEl = createElement('div', { classes: [`${blockName}__close`, 'icon'] });
    const dropdownArrowIcon = document.createRange().createContextualFragment(`
      <svg xmlns="http://www.w3.org/2000/svg"><use href="#icons-sprite-dropdown-caret"></use></svg>`);
    const colItems = [...item.querySelectorAll(':scope > div')];

    // add the proper classes to each accordion item
    item.classList.add(`${blockName}__item`);
    if (i === 0) item.classList.add('active');
    colItems.forEach((col) => addAccordionClass(col));
    arrowEl.appendChild(...dropdownArrowIcon.children);
    colBtnTitle.prepend(item.querySelector(`.${blockName}__item-title`), arrowEl);
    colBtnTitle.onclick = () => {
      const active = accordionContainer.querySelector('.active');
      if (active && active !== item) active.classList.remove('active');
      item.classList.add('active');
    };
    item.prepend(colBtnTitle);
    itemsContainer.appendChild(item);
  });

  accordionContainer.append(itemsContainer);

  block.appendChild(accordionContainer);
}
