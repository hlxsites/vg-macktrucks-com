import { createElement } from '../../scripts/common.js';

const blockName = 'v2-category-collage';

const decorateImage = (item, itemContainer) => {
  const itemImage = item.querySelector('picture');
  const hasImageContainer = itemImage.parentElement === item;
  if (!hasImageContainer) {
    const imageContainer = itemImage.parentElement;
    itemImage.classList.add(`${blockName}__item-image`);
    itemContainer.prepend(itemImage);
    imageContainer.remove();
  }
};

const decorateText = (item) => {
  const itemLink = item.querySelector('a');
  itemLink.parentElement.classList.add(`${blockName}__item-content`);
  return itemLink;
};

const removeInnerLink = (link) => {
  if (!link) return;
  const text = link.parentElement;
  const linkText = link.innerHTML;
  text.innerHTML = linkText;
};

const decorateCollageItems = (items) => {
  items.forEach((item) => {
    const itemContainer = item.firstElementChild;
    const innerLink = decorateText(item);
    const { href, title } = innerLink || { href: '#', title: '' };
    const newItemContainer = createElement('a', {
      classes: `${blockName}__item-container`,
      props: { href, title },
    });
    removeInnerLink(innerLink);
    item.classList.add(`${blockName}__item-container`); // decorate container
    decorateImage(item, itemContainer);
    newItemContainer.innerHTML = itemContainer.innerHTML; // move content
    itemContainer.remove();
    item.append(newItemContainer);
  });
};

export default function decorate(block) {
  const blockWrapper = block.parentElement;
  const collageItemContainers = block.querySelectorAll(':scope > div');
  blockWrapper.classList.add('full-width');
  decorateCollageItems([...collageItemContainers]);
}
