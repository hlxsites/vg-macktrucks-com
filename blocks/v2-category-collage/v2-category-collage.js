import { createElement } from '../../scripts/common.js';

const blockName = 'v2-category-collage';

const decorateCollageItem = (items) => {
  items.forEach((item) => {
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
    itemImage.classList.add(`${blockName}__item-image`);
    itemContent.classList.add(`${blockName}__item-content`);
  });
};

export default function decorate(block) {
  const blockWrapper = block.parentElement;
  blockWrapper.classList.add('full-width');
  const collageItemContainers = block.querySelectorAll(':scope > div');
  decorateCollageItem([...collageItemContainers]);
}
