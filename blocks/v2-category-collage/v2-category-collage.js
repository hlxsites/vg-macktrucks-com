import { createElement } from '../../scripts/common.js';
import {
  isVideoLink,
  createVideo,
} from '../../scripts/video-helper.js';

const blockName = 'v2-category-collage';
const itemMedia = `${blockName}__item-media`;

const decorateImage = (item, itemContainer) => {
  const itemImage = item.querySelector('picture');
  const hasImageContainer = itemImage.parentElement === item;
  if (!hasImageContainer) {
    const imageContainer = itemImage.parentElement;
    itemImage.classList.add(itemMedia);
    itemContainer.prepend(itemImage);
    imageContainer.remove();
  }
  itemImage.setAttribute('tabindex', 0);
};

const decorateMedia = (item, itemContainer, imageEl) => {
  if (imageEl) {
    decorateImage(item, itemContainer);
    return;
  }
  const videoLink = item.querySelector('a');
  if (videoLink && isVideoLink(videoLink)) {
    const video = createVideo(item, videoLink.getAttribute('href'), itemMedia);
    itemContainer.prepend(video);
    videoLink.remove();
    video.nextElementSibling.remove();
  }
};

const getTextLink = (item) => {
  const itemLink = item.querySelector('a');
  if (!itemLink) return null;
  itemLink.parentElement.classList.add(`${blockName}__item-content`);
  return itemLink;
};

const removeInnerLink = (link) => {
  const text = link.parentElement;
  const linkText = link.innerHTML;
  text.innerHTML = linkText;
};

const decorateNewItemContainer = (item, itemContainer) => {
  const innerLink = getTextLink(item);
  const { href, title } = innerLink;
  const newItemContainer = createElement('a', {
    classes: `${blockName}__item-link`,
    props: { href, title, tabindex: -1 },
  });
  removeInnerLink(innerLink);
  item.classList.add(`${blockName}__item-container`); // decorate container
  newItemContainer.innerHTML = itemContainer.innerHTML; // move content
  itemContainer.remove();
  item.append(newItemContainer);
};

const decorateCollageItems = (items) => {
  items.forEach((item) => {
    const itemContainer = item.firstElementChild;
    decorateMedia(item, itemContainer, itemContainer.querySelector('picture'));
    decorateNewItemContainer(item, itemContainer);
  });
};

export default function decorate(block) {
  const blockWrapper = block.parentElement;
  const collageItemContainers = block.querySelectorAll(':scope > div');
  blockWrapper.classList.add('full-width');
  decorateCollageItems([...collageItemContainers]);
}
