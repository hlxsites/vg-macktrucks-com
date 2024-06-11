import { createElement } from '../../scripts/common.js';

const blockName = 'v2-category-collage';

const decorateCollageItem = (items) => {
  items.forEach((item, i) => {
    const itemImage = item.firstElementChild;
    const itemContent = item.lastElementChild;
    const itemLink = item.querySelector('a');
    const itemText = createElement('span', { classes: `${blockName}__item-text` });
    const itemIcon = itemLink.firstElementChild;
    const itemLinkText = itemLink?.textContent;
    itemText.textContent = itemLinkText;
    itemLink.innerHTML = '';
    itemLink.append(itemText, itemIcon);
    item.classList.add(`${blockName}__item-container`);
    item.dataset.collageItem = i + 1;
    item.dataset.collageRow = Math.floor(i / 3) + 1;
    itemImage.classList.add(`${blockName}__item-image`);
    itemContent.classList.add(`${blockName}__item-content`);
  });
};

export default function decorate(block) {
  const blockWrapper = block.closest(`.${blockName}-wrapper`);
  blockWrapper.classList.add('full-width');
  const collageItemContainers = block.querySelectorAll(`.${blockName} > div`);
  decorateCollageItem([...collageItemContainers]);
}
