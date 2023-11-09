import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import {
  createElement, removeEmptyTags, getTextLabel, debounce,
} from '../../scripts/common.js';
import { getAllElWithChildren } from '../../scripts/scripts.js';
import { showModal } from '../../common/modal/modal-component.js';

const blockClassName = 'v2-images-grid';

const setActiveSlide = (activeSlideIndex, carouselItemsList, carouselImagesList) => {
  const itemWidth = carouselItemsList.getBoundingClientRect().width;

  carouselImagesList.scrollTo({
    left: activeSlideIndex * 90,
    behavior: 'smooth',
  });

  carouselItemsList.scrollTo({
    left: activeSlideIndex * itemWidth,
    behavior: 'smooth',
  });
};

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

  const itemsWrapper = createElement('div', { classes: `${blockClassName}__carousel-items-wrapper` });
  const wrapper = createElement('div', { classes: `${blockClassName}__modal-content` });

  itemsWrapper.innerHTML = `
    <div class="${blockClassName}__modal-arrows-wrapper">
      <button class="${blockClassName}__modal-arrow">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path fill="var(--color-icon, #000)" d="M21 11C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13V11ZM2.29289 12.7071C1.90237 12.3166 1.90237 11.6834 2.29289 11.2929L8.65685 4.92893C9.04738 4.53841 9.68054 4.53841 10.0711 4.92893C10.4616 5.31946 10.4616 5.95262 10.0711 6.34315L4.41421 12L10.0711 17.6569C10.4616 18.0474 10.4616 18.6805 10.0711 19.0711C9.68054 19.4616 9.04738 19.4616 8.65685 19.0711L2.29289 12.7071ZM21 13L3 13V11L21 11V13Z" />
        </svg>
      </button>
      <button class="${blockClassName}__modal-arrow">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="var(--color-icon, #000)" d="M3 11C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13L3 11ZM21.7071 12.7071C22.0976 12.3166 22.0976 11.6834 21.7071 11.2929L15.3431 4.92893C14.9526 4.53841 14.3195 4.53841 13.9289 4.92893C13.5384 5.31946 13.5384 5.95262 13.9289 6.34315L19.5858 12L13.9289 17.6569C13.5384 18.0474 13.5384 18.6805 13.9289 19.0711C14.3195 19.4616 14.9526 19.4616 15.3431 19.0711L21.7071 12.7071ZM3 13L21 13V11L3 11L3 13Z" />
        </svg>
      </button>
    </div>
  `;
  itemsWrapper.append(carouselItemsList);

  [...itemsWrapper.querySelectorAll('button')].forEach((el, elIndex) => {
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

  wrapper.append(itemsWrapper, carouselImagesList);

  return wrapper;
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

  const modalContent = createModalContent(ul);

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

      li.addEventListener('click', async () => {
        const carouselItemsList = modalContent.querySelector(`.${blockClassName}__carousel-items-list`);
        const carouselImagesList = modalContent.querySelector(`.${blockClassName}__carousel-preview-list`);

        await showModal(modalContent, { classes: ['modal-content--bottom'] });
        setActiveSlide(idx, carouselItemsList, carouselImagesList);
      });

      return;
    }
    li.remove();
  });

  const button = createElement('a', {
    classes: ['button', 'button--large', 'button--primary'],
  });
  button.textContent = getTextLabel('Open Gallery');
  button.addEventListener('click', () => {
    showModal(modalContent, { classes: ['modal-content--bottom'] });
  });

  block.append(button);

  // remove empty tags
  removeEmptyTags(block);
}
