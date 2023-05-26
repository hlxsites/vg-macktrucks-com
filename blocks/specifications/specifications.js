import { createElement } from '../../scripts/scripts.js';

export default function decorate(block) {
  const children = [...block.children];
  const ulElements = [...block.querySelectorAll('ul')];

  const specsTitle = children.shift().querySelector('h3');

  const specsSection = createElement('div', 'specs-section');
  const specsHeading = createElement('div', 'specs-heading');
  const specsList = createElement('ul', 'specs-list');

  if (ulElements.length === 1) {
    const liElements = [...ulElements[0].querySelectorAll('li')];

    liElements.forEach((e, idx) => {
      const item = createElement('li', ['specs-item', `specs-item-${idx + 1}`]);
      const text = createElement('p', 'p-element');
      const isStrong = e.querySelector('strong');

      text.append(isStrong ?? e.innerText);
      item.append(text);
      specsList.append(item);
    });
  } else if (ulElements.length > 1) {
    specsList.classList.add('specs-list-multiple');

    ulElements.forEach((e, idx) => {
      const item = createElement('li', ['specs-item', `specs-item-${idx + 1}`]);

      const subtitle = e.parentNode.querySelector('p');
      subtitle.classList.add('specs-item-subtitle');
      if (idx <= 2) item.append(subtitle);

      const liElements = [...e.querySelectorAll('li')];
      const features = createElement('div', 'feature-list');

      liElements.forEach((feature) => {
        const text = createElement('p', 'p-element');
        const isStrong = feature.querySelector('strong');

        text.append(isStrong ?? feature.innerText);
        features.append(text);
      });
      item.append(features);
      specsList.append(item);
    });
  } else {
    children.forEach((e, idx) => {
      const item = createElement('li', ['specs-item', `specs-item-${idx + 1}`]);

      const pElements = [...e.querySelectorAll('p')];
      const picture = e.querySelector('picture');
      const [subtitle, content] = pElements;

      if (!subtitle || !content) {
        const singleText = e.innerText;
        const text = createElement('p', 'single-text');
        text.innerText = singleText;
        item.append(text);
      } else {
        if (picture) item.append(picture);
        item.append(subtitle, content);
      }
      specsList.append(item);
    });
  }
  specsHeading.append(specsTitle);
  specsSection.append(specsHeading, specsList);

  block.textContent = '';
  block.append(specsSection);
}
