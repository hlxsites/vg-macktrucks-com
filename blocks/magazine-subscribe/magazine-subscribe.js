import { createElement } from '../../scripts/scripts.js';

export default function decorate(block) {
  const children = block.querySelectorAll('p');
  const [picture, title, subtitle, text, button] = children;

  const generalSection = createElement('div', 'magazine-subscribe-section');
  const imageSection = createElement('div', 'magazine-subscribe-image');
  const contentSection = createElement('div', 'magazine-subscribe-content');

  title.classList.add('magazine-subscribe-title');
  subtitle.classList.add('magazine-subscribe-subtitle');
  text.classList.add('magazine-subscribe-text');
  button.classList.add('magazine-subscribe-button');

  const image = picture.querySelector('picture');

  imageSection.append(image);
  contentSection.append(title, subtitle, text, button);

  generalSection.append(imageSection, contentSection);

  block.textContent = '';
  block.append(generalSection);
}
