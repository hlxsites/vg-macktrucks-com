import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { createElement, removeEmptyTags, getTextLabel } from '../../scripts/common.js';
import { getAllElWithChildren } from '../../scripts/scripts.js';

const blockClassName = 'v2-images-grid';
export default function decorate(block) {
  // all items are inside a ul list with classname called 'v2-images-grid__items'
  const ul = createElement('ul', { classes: `${blockClassName}__items` });
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    // If cell contain any element, we add them in the ul
    if (cell.childElementCount) {
      const li = createElement('li', { classes: [`${blockClassName}__item`] });
      li.append(...cell.childNodes);
      ul.append(li);
    }
    cell.remove();
  });
  block.append(ul);

  // give format to the first 4 list items
  [...ul.children].forEach((li, idx) => {
    if (idx < 4) {
      const captionEle = getAllElWithChildren(li.querySelectorAll('p'), 'picture', true)[0];
      let picture = li.querySelector('picture');

      if (picture) {
        const img = picture.lastElementChild;
        // no width provided because we are using object-fit, we need the biggest option
        const newPicture = createOptimizedPicture(img.src, captionEle.textContent, false);
        picture.replaceWith(newPicture);
        picture = newPicture;
        picture.classList.add(`${blockClassName}__picture`);
        // use figcaption for text
        const figCaption = createElement('figcaption', { classes: `${blockClassName}__figcaption` });
        figCaption.textContent = captionEle.textContent;
        picture.append(figCaption);
      }

      li.innerHTML = '';

      li.append(picture);
      return;
    }
    li.remove();
  });

  const button = createElement('a', {
    classes: ['button', 'button--large', 'button--primary'],
  });
  button.textContent = getTextLabel('Open Gallery');
  block.append(button);

  // remove empty tags
  removeEmptyTags(block);
}
