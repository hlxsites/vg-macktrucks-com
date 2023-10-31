import { createElement } from '../../scripts/common.js';

export default function decorate(block) {
  block.querySelectorAll(':scope > div').forEach((row) => row.classList.add('row'));
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    cell.classList.add('teaser-column');

    if (cell.querySelector('picture')) {
      cell.classList.add('text-on-image-column');
    } else {
      const textCol = createElement('div', { classes: ['text-wrapper'] });
      textCol.innerHTML = cell.innerHTML;
      cell.innerHTML = '';
      cell.appendChild(textCol);
    }
  });

  // unwrap picture so that text styles are not applied to this paragraphs
  block.querySelectorAll('picture').forEach((picture) => picture.closest('p').replaceWith(picture));
}
