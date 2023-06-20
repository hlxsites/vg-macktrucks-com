import {
  createElement, getTextLabel,
} from '../../scripts/scripts.js';

export default async function decorate(block) {
  const children = block.querySelectorAll('p');
  const subscribeText = getTextLabel('SUBSCRIBE TO BULLDOG');
  const [picture, title, subtitle, text, ] = children;

  const generalSection = createElement('div', 'magazine-subscribe-section');
  const imageSection = createElement('div', 'magazine-subscribe-image');
  const contentSection = createElement('div', 'magazine-subscribe-content');

  title.classList.add('magazine-subscribe-title');
  subtitle.classList.add('magazine-subscribe-subtitle');
  text.classList.add('magazine-subscribe-text');


  const buttonContainer = createElement('div', ['magazine-subscribe-button', 'button-container'], { type: 'button' });

  const button = createElement('button', 'subscribe-button');
  button.textContent = subscribeText;

  buttonContainer.append(button)

  console.log(buttonContainer);

  const image = picture.querySelector('picture');

  generalSection.append(imageSection, contentSection);

  imageSection.append(image);
  contentSection.append(title, subtitle, text, buttonContainer);

  block.textContent = '';
  block.append(generalSection);
}
