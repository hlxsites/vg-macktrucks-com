import { createElement, removeEmptyTags } from '../../scripts/common.js';

const blockName = 'v2-tabbed-carousel';

const moveNavigationLine = (navigationLine, activeTab, tabNavigation) => {
  const { x: navigationX } = tabNavigation.getBoundingClientRect();
  const { x, width } = activeTab.getBoundingClientRect();
  Object.assign(navigationLine.style, {
    left: `${x + tabNavigation.scrollLeft - navigationX}px`,
    width: `${width}px`,
  });
};

function buildTabNavigation(tabItems, clickHandler) {
  const tabNavigation = createElement('ul', { classes: `${blockName}__navigation` });
  const navigationLine = createElement('li', { classes: `${blockName}__navigation-line` });
  let timeout;

  [...tabItems].forEach((tabItem, i) => {
    const listItem = createElement('li', { classes: `${blockName}__navigation-item` });
    const button = createElement('button');
    button.addEventListener('click', () => clickHandler(i));
    button.addEventListener('mouseover', (e) => {
      clearTimeout(timeout);
      moveNavigationLine(navigationLine, e.currentTarget, tabNavigation);
    });

    button.addEventListener('mouseout', () => {
      timeout = setTimeout(() => {
        const activeItem = document.querySelector(`.${blockName}__navigation-item.active`);
        moveNavigationLine(navigationLine, activeItem, tabNavigation);
      }, 600);
    });

    button.innerHTML = tabItem.dataset.carousel;
    listItem.append(button);
    tabNavigation.append(listItem);
  });

  tabNavigation.append(navigationLine);

  return tabNavigation;
}

const updateActiveItem = (index) => {
  const carouselItems = document.querySelector(`.${blockName}__items`);
  const navigation = document.querySelector(`.${blockName}__navigation`);
  const navigationLine = document.querySelector(`.${blockName}__navigation-line`);

  [carouselItems, navigation].forEach((c) => c.querySelectorAll('.active').forEach((i) => i.classList.remove('active')));
  carouselItems.children[index].classList.add('active');
  navigation.children[index].classList.add('active');

  const activeNavigationItem = navigation.children[index];
  moveNavigationLine(navigationLine, activeNavigationItem, navigation);

  // Center navigation item
  const navigationActiveItem = navigation.querySelector('.active');

  if (navigation && navigationActiveItem) {
    const { clientWidth: itemWidth, offsetLeft } = navigationActiveItem;
    // Calculate the scroll position to center the active item
    const scrollPosition = offsetLeft - (navigation.clientWidth - itemWidth) / 2;
    navigation.scrollTo({
      left: scrollPosition,
      behavior: 'smooth',
    });
  }
};

const listenScroll = (carousel) => {
  const elements = carousel.querySelectorAll(':scope > *');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (
        entry.isIntersecting
        && entry.intersectionRatio >= 0.75
      ) {
        const activeItem = entry.target;
        const currentIndex = [...activeItem.parentNode.children].indexOf(activeItem);
        updateActiveItem(currentIndex);
      }
    });
  }, {
    root: carousel,
    threshold: 0.75,
  });

  elements.forEach((el) => {
    io.observe(el);
  });
};

const setCarouselPosition = (carousel, index) => {
  const firstEl = carousel.firstElementChild;
  const scrollOffset = firstEl.getBoundingClientRect().width;
  const style = window.getComputedStyle(firstEl);
  const marginleft = parseFloat(style.marginLeft);

  carousel.scrollTo({
    left: index * scrollOffset + marginleft,
    behavior: 'smooth',
  });
};

export default function decorate(block) {
  const container = block.querySelector(':scope > div');
  container.classList.add(`${blockName}__container`);

  const carouselItems = createElement('div', { classes: `${blockName}__items` });
  container.appendChild(carouselItems);

  const tabItems = block.querySelectorAll('.v2-tabbed-carousel__item');

  tabItems.forEach((tabItem) => {
    const tabContent = tabItem.querySelector(':scope > div');

    const figure = createElement('figure', { classes: `${blockName}__figure` });
    const picture = tabItem.querySelector('picture');
    figure.appendChild(picture);

    const figureCaption = createElement('figcaption');
    const text = tabContent?.querySelectorAll(':scope > *');
    if (text) {
      figureCaption.append(...text);
    }

    tabContent.remove();
    figure.appendChild(figureCaption);

    tabItem.prepend(figure);

    carouselItems.appendChild(tabItem);
  });

  removeEmptyTags(container);

  const tabNavigation = buildTabNavigation(tabItems, (index) => {
    setCarouselPosition(carouselItems, index);
  });

  container.append(tabNavigation);

  // update the button indicator on scroll
  listenScroll(carouselItems);
}
