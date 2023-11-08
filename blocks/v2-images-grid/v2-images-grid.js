import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import {
  createElement, removeEmptyTags, getTextLabel, debounce,
} from '../../scripts/common.js';
import { getAllElWithChildren } from '../../scripts/scripts.js';

const blockClassName = 'v2-images-grid';

const createModalContent = (content) => {
  const carouselItemsList = createElement('ul', { classes: `${blockClassName}__carousel-items-list` });
  const carouselImagesList = createElement('ul', { classes: `${blockClassName}__carousel-preview-list` });

  const debouncedOnItemChange = debounce((index) => {
    carouselImagesList.scrollTo({
      left: index * 90,
      behavior: 'smooth',
    });
  }, 100);

  [...content.querySelectorAll('.v2-images-grid__item')].forEach((el, index) => {
    const image = el.querySelector('img');

    // adding image to carousel preview
    const carouselImage = createOptimizedPicture(image.src, image.alt, false, [{ width: '80' }]);
    const carousePreviewlItem = createElement('li', { classes: `${blockClassName}__carousel-preview-item` });
    const buttonWithImage = createElement('button');

    buttonWithImage.addEventListener('click', () => {
      const itemWidth = carouselItemsList.getBoundingClientRect().width;

      carouselItemsList.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth',
      });
    });

    buttonWithImage.append(carouselImage);
    carousePreviewlItem.append(buttonWithImage);
    carouselImagesList.append(carousePreviewlItem);

    // creating item content
    const itemImage = createOptimizedPicture(image.src, image.alt, false);
    const [, caption, description] = el.querySelectorAll('p');
    const carouselItem = createElement('li', { classes: `${blockClassName}__carousel-item` });

    carouselItem.append(itemImage, description || caption);
    carouselItemsList.append(carouselItem);

    const options = {
      root: carouselItemsList,
      rootMargin: '0px',
      threshold: 1.0,
    };

    const observer = new IntersectionObserver(() => {
      debouncedOnItemChange(index);
    }, options);

    observer.observe(carouselItem);
  });

  const wrapper = createElement('div', { classes: `${blockClassName}__modal-content` });

  wrapper.innerHTML = `
    <div>
      <button><-</button>
      <button>-></button>
    </div>
  `;

  [...wrapper.querySelectorAll('button')].forEach((el, elIndex) => {
    const modifiers = [-1, 1];

    el.addEventListener('click', () => {
      const itemWidth = carouselItemsList.getBoundingClientRect().width;
      let index = Math.round(carouselItemsList.scrollLeft / itemWidth) + modifiers[elIndex];

      if (index < 0) {
        index = carouselItemsList.children.length - 1;
      }

      if (index > carouselItemsList.children.length - 1) {
        index = 0;
      }

      carouselImagesList.scrollTo({
        left: index * 90,
        behavior: 'smooth',
      });

      carouselItemsList.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth',
      });
    });
  });
  wrapper.append(carouselItemsList, carouselImagesList);
  document.querySelector('.v2-images-grid.block').append(wrapper);
};

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

  createModalContent(ul);

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
