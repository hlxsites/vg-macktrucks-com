import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import {
  createElement, isVideoLink, selectVideoLink, wrapImageWithVideoLink, addVideoShowHandler,
} from '../../scripts/scripts.js';

const debounceDelay = 30;

function calcCarouselItemsOffset(slidesEl) {
  const first = slidesEl.firstElementChild;
  const second = first.nextElementSibling;
  const scrollOffset = second.getBoundingClientRect().x - first.getBoundingClientRect().x;

  return scrollOffset;
}

function initScroll(slidesList, onActiveItemChange) {
  let activeIndex = 0;

  slidesList.addEventListener('scroll', () => {
    const scrollOffset = calcCarouselItemsOffset(slidesList);
    let index = 0;
    // how many items have scrolled out?
    while (slidesList.scrollLeft - scrollOffset * (index + 1) > 0) index += 1;

    if (activeIndex !== index) {
      activeIndex = index;
      onActiveItemChange(activeIndex);
    }
  });
}

function adjustWidthAndControls(block, carousel, ...controls) {
  function toggle() {
    const gap = parseInt(window.getComputedStyle(carousel).gap, 10);
    const itemWidth = parseInt(window.getComputedStyle(carousel.firstElementChild).width, 10);
    const itemsWidth = itemWidth * carousel.children.length + gap * (carousel.children.length - 1);
    const containerWidth = parseInt(window.getComputedStyle(carousel.parentElement).width, 10);
    const showControls = itemsWidth > containerWidth;
    controls.forEach((ul) => (showControls ? ul.classList.remove('hidden') : ul.classList.add('hidden')));
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(toggle, debounceDelay);
  });

  // wait for the section to be loaded before we initially resize the carousel
  const section = block.closest('.section');
  new MutationObserver((_, observer) => {
    if (section.dataset.sectionStatus === 'loaded') {
      observer.disconnect();
      setTimeout(toggle);
    }
  }).observe(section, { attributes: true });
}

function createDesktopControls(ul) {
  function scroll(direction) {
    const scrollOffset = calcCarouselItemsOffset(ul);
    const left = direction === 'left' ? -1 * scrollOffset : scrollOffset;
    ul.scrollBy({ top: 0, left, behavior: 'smooth' });
  }

  const desktopControls = document.createElement('ul');
  desktopControls.className = 'desktop-controls hidden';
  desktopControls.innerHTML = '<li><button type="button">Left</button></li><li><button type="button">Right</button></li>';
  ul.insertAdjacentElement('beforebegin', desktopControls);
  const [prevButton, nextButton] = desktopControls.querySelectorAll(':scope button');
  prevButton.addEventListener('click', () => scroll('left'));
  nextButton.addEventListener('click', () => scroll('right'));
  return desktopControls;
}

export default function decorate(block) {
  const ul = createElement('ul', ['items']);

  // We support two formats:
  // 1. Each slide in a row (can be splitted into columns)
  // 2. All values in the first cell as a list.
  const isList = block.querySelectorAll(':scope > div > div > ul').length;
  const rows = [...block.querySelectorAll(isList ? ':scope > div > div > ul > li' : ':scope > div')];

  rows.forEach((row) => {
    row.querySelectorAll(':scope > div').forEach((column) => {
      column.classList.add('carousel-item-column');
    });

    const listItem = createElement('li', ['carousel-item']);
    listItem.append(...row.children);
    ul.append(listItem);
  });

  [...ul.children].forEach((li) => {
    // Add wrapper around the content
    const container = createElement('div', ['carousel-content-wrapper']);

    container.innerHTML = li.innerHTML;
    li.innerHTML = '';
    li.append(container);

    // for each column
    li.querySelectorAll('.carousel-item-column').forEach((column) => {
      let picture = column.querySelector('picture');
      const links = [...column.querySelectorAll('a')];
      const videoLinks = links.filter((link) => isVideoLink(link));

      if (picture) {
        const img = picture.lastElementChild;
        const newPicture = createOptimizedPicture(img.src, img.alt, false, [{ width: '370' }]);
        picture.replaceWith(newPicture);
        picture = newPicture;
      }

      // handling image with video link
      if (videoLinks.length && picture) {
        const selectedVideoLink = selectVideoLink(videoLinks);

        // removing unused video links
        videoLinks
          .filter((videoLink) => videoLink.getAttribute('href') !== selectedVideoLink.getAttribute('href'))
          .forEach((link) => link.remove());

        wrapImageWithVideoLink(selectedVideoLink, picture);
        addVideoShowHandler(selectedVideoLink);
      } else if (links.length && picture) {
        // handling image with link
        const clone = links[0].cloneNode(false);
        picture.replaceWith(clone);
        clone.append(picture);
        column.prepend(clone);
      }
    });

    // removing new lines from the text
    container.innerHTML = container.innerHTML
      .split('<br>').filter((text) => text.trim() !== '');

    const carouselLink = container.querySelector('a');
    if (carouselLink) {
      carouselLink.classList.add('button', 'carousel-link');
    }

    block.innerHTML = '';
    block.append(ul);
  });

  const desktopControls = createDesktopControls(ul);

  const slideNumber = ul.querySelectorAll('li').length;
  const onActiveItemChange = (newActiveItemIndex) => {
    ul.querySelector('li.active')?.classList.remove('active');
    ul.querySelectorAll('li')[newActiveItemIndex].classList.add('active');
    const desktopControlsList = block.querySelectorAll('.desktop-controls li');

    if (desktopControlsList.length) {
      // hidding left/right arrow when there is no more slides in selected direction
      desktopControlsList[0].style.visibility = newActiveItemIndex ? 'visible' : 'hidden';
      desktopControlsList[1].style.visibility = newActiveItemIndex + 1 < slideNumber ? 'visible' : 'hidden';
    }
  };

  initScroll(ul, onActiveItemChange);
  onActiveItemChange(0);

  adjustWidthAndControls(block, ul, desktopControls);
}
