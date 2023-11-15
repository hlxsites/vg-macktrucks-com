import { createElement, unwrapDivs } from '../../scripts/common.js';

const blockName = 'v2-tabbed-carousel';

const moveNavigationLine = (navigationLine, activeTab, tabNavigation) => {
  const { x: navigationX } = tabNavigation.getBoundingClientRect();
  const { x, width } = activeTab.getBoundingClientRect();
  Object.assign(navigationLine.style, {
    left: `${x + tabNavigation.scrollLeft - navigationX}px`,
    width: `${width}px`,
  });
};

const updateActiveItem = (index, block) => {
  const carouselItems = block.querySelector(`.${blockName}__items`);
  const navigation = block.querySelector(`.${blockName}__navigation`);
  const navigationLine = block.querySelector(`.${blockName}__navigation-line`);

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

const listenScroll = (carousel, block) => {
  const elements = carousel.querySelectorAll(':scope > *');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (
        entry.isIntersecting
        && entry.intersectionRatio >= 0.75
      ) {
        const activeItem = entry.target;
        const currentIndex = [...activeItem.parentNode.children].indexOf(activeItem);
        updateActiveItem(currentIndex, block);
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
  const carouselContainer = createElement('div', { classes: `${blockName}__container` });
  const carouselItems = createElement('ul', { classes: `${blockName}__items` });
  carouselContainer.append(carouselItems);

  const tabNavigation = createElement('ul', { classes: `${blockName}__navigation` });
  const navigationLine = createElement('li', { classes: `${blockName}__navigation-line` });
  let timeout;

  function buildTabNavigation(buttonContent, index) {
    const listItem = createElement('li', { classes: `${blockName}__navigation-item` });
    const button = createElement('button');

    button.addEventListener('click', () => setCarouselPosition(carouselItems, index));
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

    button.innerHTML = buttonContent;
    listItem.append(button);

    return listItem;
  }

  const tabItems = block.querySelectorAll(':scope > div');
  tabItems.forEach((tabItem, index) => {
    const liItem = createElement('li', { classes: `${blockName}__item` });
    const figure = createElement('figure', { classes: `${blockName}__figure` });
    const tabContent = tabItem.querySelector('p');

    figure.append(tabContent.querySelector('picture'));

    const figureCaption = createElement('figcaption');
    const lastItems = [...tabContent.childNodes].at(-1);
    if (lastItems.nodeType === Node.TEXT_NODE) {
      figureCaption.append(lastItems);
      figure.append(figureCaption);
    }

    figure.appendChild(figureCaption);
    liItem.append(figure);
    carouselItems.appendChild(liItem);

    // navigation item
    const tabTitle = tabItem.querySelector('h3');
    const navItem = buildTabNavigation(tabTitle.innerHTML, index);
    tabNavigation.append(navItem);
    tabTitle.remove();
    tabItem.innerHTML = '';
  });

  tabNavigation.append(navigationLine);
  carouselContainer.append(tabNavigation);

  block.append(carouselContainer);
  listenScroll(carouselItems, block);

  unwrapDivs(block);
}
