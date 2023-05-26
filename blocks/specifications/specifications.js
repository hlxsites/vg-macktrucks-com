import { createElement } from '../../scripts/scripts.js';

export default function decorate(block) {
  const children = [...block.children];

  const specsTitle = children.shift().querySelector('h3');

  const specsSection = createElement('div', 'specs-section');
  const specsHeading = createElement('div', 'specs-heading');
  const specsList = createElement('ul', 'specs-list');

  const ulElements = block.querySelector('ul');

  if (ulElements) {
    const liElements = [...ulElements.querySelectorAll('li')];

    liElements.forEach((e, idx) => {
      const item = createElement('li', ['specs-item', `specs-item-${idx + 1}`]);
      const text = createElement('p', 'p-element');
      const isStrong = e.querySelector('strong');

      text.append(isStrong ?? e.innerText);
      item.append(text);
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
        picture && item.append(picture);
        item.append(subtitle, content);
      }
      specsList.append(item);
    });
  }
  specsHeading.append(specsTitle)
  specsSection.append(specsHeading, specsList);

  block.textContent = '';
  block.append(specsSection);
}
