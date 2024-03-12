import {
  createElement,
  unwrapDivs,
} from '../../scripts/common.js';

const blockName = 'v2-intro-section';

export default function decorate(block) {
  const content = block.querySelector(':scope > div > div:first-child');
  const image = block.querySelector(':scope > div > div:nth-child(2) > picture');
  const button = content.querySelector('.button-container');

  const parent = block.parentElement;
  parent.classList.add(button ? 'with-button' : 'with-background-image');

  content.classList.add(`${blockName}__text-content`);

  const heading = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
  heading[0].classList.add(`${blockName}__heading`);

  if (button) {
    const texts = createElement('div', { classes: `${blockName}__content` });
    heading[0].classList.add('header-with-mark');
    texts.append(content, button);
    block.append(texts);
  }

  parent.prepend(image);
  unwrapDivs(block);
}
