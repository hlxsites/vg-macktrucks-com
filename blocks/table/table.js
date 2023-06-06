import { createElement } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const headings = block.querySelectorAll('table h1, table h2, table h3, table h4, table h5, table h6');

  headings.forEach((heading) => {
    // unifing headings
    const newHeading = createElement('h5', 'table-cell-heading');
    newHeading.innerHTML = heading.innerHTML;
    heading.replaceWith(newHeading);

    newHeading.closest('tr')?.classList.add('table-heading');
  });

  return block;
}
