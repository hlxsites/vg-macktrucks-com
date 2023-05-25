import { createElement } from '../../scripts/scripts.js';

export default function decorate(block) {
  const children = [...block.children];

  const specsSection = createElement('div', 'specs-section');
  const specsTitle = children.shift().querySelector('h3')

  const specsList = createElement('ul', 'specs-list');

  const ulElements = block.querySelector('ul')

  if (ulElements) {
    const liElements = ulElements.querySelector('li')
    console.log(liElements.innerHTML)

  }



  children.forEach((e, idx) => {
    const item = createElement('li', ['specs-item', `specs-item-${idx + 1}`]);
  
    const pElements = [...e.querySelectorAll('p')]

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
