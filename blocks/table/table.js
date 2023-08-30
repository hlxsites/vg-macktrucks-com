import { createElement } from '../../scripts/common.js';

export default async function decorate(block) {
  const headings = block.querySelectorAll('table h1, table h2, table h3, table h4, table h5, table h6');

  headings.forEach((heading) => {
    // unifing headings
    const newHeading = createElement('h5', { classes: 'table-cell-heading' });
    newHeading.innerHTML = heading.innerHTML;
    heading.replaceWith(newHeading);
    newHeading.closest('tr')?.classList.add('table-heading');
  });

  const isRowHeader = block.classList.contains('row-header');
  if (isRowHeader) {
    const firstColumn = block.querySelectorAll('table td:first-child');
    firstColumn.forEach((cell) => {
      const newP = createElement('p');
      newP.textContent = cell.querySelector('strong').textContent;
      cell.replaceChild(newP, cell.querySelector('strong'));
      cell.addEventListener('click', () => {
        cell.classList.toggle('open');
        cell.nextElementSibling.classList.toggle('open');
      });
    });
  }

  return block;
}
