import { createElement } from '../../scripts/scripts.js';

export default function decorate(block) {
  const children = [...block.children];

  const specsSection = createElement('div', 'specs-section');
  const specsTitle = children.shift().querySelector('h3')

  const specsList = createElement('ul', 'specs-list');

  children.forEach((e, idx) => {

    console.log(e.children)
    const item = createElement('li', ['specs-item', `specs-item-${idx + 1}`]);

    const pElements = [...e.querySelectorAll('p')]

    // pElements.length === 0 ? e.querySelector('ul') : null
    // const ulElement = e.querySelector('ul')
    // console.log(ulElement)
    // console.log(pElements)

    const picture = e.querySelector('picture')
    const [subtitle, content] = pElements

    picture && item.append(picture)
    item.append(subtitle, content)

    specsList.append(item);
  });
  specsSection.append(specsTitle, specsList);

  block.textContent = '';
  block.append(specsSection);
}
