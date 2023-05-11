import { createElement } from '../../scripts/scripts.js';

export default function decorate(block) {
  const isAutoBlock = block.classList.contains('auto-block');
  if (isAutoBlock) return;
  const contentWrapper = block.querySelector(':scope > div > div');
  const parentContainer = contentWrapper.parentElement;
  // TODO check if it has a video or an image
  const pictureWrapper = block.querySelector('p:has(picture)');
  const contentContainer = createElement('div', 'hero-content-container');
  parentContainer.prepend(pictureWrapper);
  contentContainer.appendChild(contentWrapper);
  parentContainer.appendChild(contentContainer);
  contentContainer.prepend(pictureWrapper);
  contentWrapper.className = 'hero-content-wrapper';
}
