import {
  createElement, getTextLabel,
} from '../../scripts/common.js';

export default async function decorate(block) {
  const children = block.querySelectorAll('p');
  const subscribeText = getTextLabel('SUBSCRIBE TO BULLDOG');
  const [picture, title, subtitle, text] = children;

  const generalSection = createElement('div', { classes: 'magazine-subscribe-section' });
  const imageSection = createElement('div', { classes: 'magazine-subscribe-image' });
  const contentSection = createElement('div', { classes: 'magazine-subscribe-content' });

  title.classList.add('magazine-subscribe-title');
  subtitle.classList.add('magazine-subscribe-subtitle');
  text.classList.add('magazine-subscribe-text');

  const buttonContainer = createElement('div', {
    classes: ['magazine-subscribe-button', 'button-container'],
    props: { type: 'button' },
  });

  const button = createElement('button', { classes: 'subscribe-button' });
  button.textContent = subscribeText;

  buttonContainer.append(button);

  const image = picture.querySelector('picture');

  generalSection.append(imageSection, contentSection);

  imageSection.append(image);
  contentSection.append(title, subtitle, text, buttonContainer);

  block.textContent = '';
  block.append(generalSection);
}
