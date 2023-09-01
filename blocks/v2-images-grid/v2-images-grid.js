import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { createElement, removeEmptyTags, getTextLabel } from '../../scripts/common.js';

const blockClassName = 'v2-images-grid';
export default function decorate(block) {
  const headings = [...block.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  headings.forEach((heading) => {
    heading.classList.add(`${blockClassName}-title`, 'with-marker');
    heading.parentElement.parentElement.remove();
  });
  // all items are inside a ul list with classname called 'v2-images-grid-items'
  const ul = createElement('ul', { classes: `${blockClassName}-items` });
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    // If cell contain any element, we add them in the ul
    if (cell.childElementCount) {
      const li = createElement('li', { classes: [`${blockClassName}-item`, 'border'] });
      li.append(...cell.childNodes);
      ul.append(li);
    }
    cell.remove();
  });
  block.parentElement.prepend(...headings);
  block.append(ul);

  // give format to the first 4 list items
  [...ul.children].forEach((li, idx) => {
    if (idx < 4) {
      const section = createElement('div');
      const captionEle = li.querySelector('p:not(:has(*))');
      let picture = li.querySelector('picture');

      if (picture) {
        const img = picture.lastElementChild;
        // no width provided because we are using object-fit, we need the biggest option
        const newPicture = createOptimizedPicture(img.src, captionEle.textContent, false);
        picture.replaceWith(newPicture);
        picture = newPicture;
        picture.classList.add(`${blockClassName}-picture`);
        // use figcaption for text
        const figCaption = createElement('figcaption', { classes: `${blockClassName}-figcaption` });
        figCaption.textContent = captionEle.textContent;
        picture.append(figCaption);
      }

      // Move image outside of the wrapper
      section.prepend(picture);

      // Remove caption element
      captionEle.remove();

      li.append(section);
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
