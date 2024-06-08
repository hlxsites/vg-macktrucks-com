import { createElement, unwrapDivs, getJsonFromUrl } from '../../scripts/common.js';
import { setCarouselPosition, listenScroll } from '../../scripts/carousel-helper.js';

const blockName = 'v2-magazine-tabbed-carousel';
let autoScrollEnabled = true;

const url = '/magazine-articles.json';
const allArticles = await getJsonFromUrl(url);
const articleArray = Object.values(allArticles.data);

const updateActiveItem = (elements, entry) => {
  elements.forEach((el, index) => {
    if (el === entry.target && entry.intersectionRatio >= 0.75) {
      const carouselItems = el.parentElement;
      const navigation = el.parentElement.nextElementSibling;

      [carouselItems, navigation].forEach((c) => c.querySelectorAll('.active').forEach((i) => i.classList.remove('active')));
      carouselItems.children[index].classList.add('active');
      navigation.children[index].classList.add('active');

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
    }
  });
};

const buildTabNavigation = (carousel, title, category, index) => {
  const listItem = document.createRange().createContextualFragment(`
    <li class='${blockName}__navigation-item item-${index + 1}'>
      <p class='pretitle'>${category}</p>
      <p class='title'>${title}</p>
    </li>
  `);
  listItem.querySelector('li').addEventListener('click', () => setCarouselPosition(carousel, index));

  return listItem;
};

const buildTabItems = (carousel, navigation, items, itemsLength, articles) => {
  items.forEach((item, index) => {
    if (index <= 3) {
      const picture = item.querySelector('picture');

      const liItem = createElement('li', { classes: [`${blockName}__item`, `item-${index + 1}`] });
      const figure = createElement('figure', { classes: `${blockName}__figure` });
      const tabContent = item.querySelector('a');
      const articlePath = tabContent.href;

      figure.append(picture);

      const figureCaption = createElement('figcaption');
      figureCaption.append(tabContent);
      figure.append(figureCaption);

      liItem.append(figure);
      carousel.appendChild(liItem);

      const fullArticleObj = articles.find((path) => {
        const shortUrl = articlePath.split('/magazine/')[1];
        const shortPath = path.path.split('/magazine/')[1];
        return shortPath === shortUrl;
      });
      const { title, category } = fullArticleObj;

      const navItem = buildTabNavigation(carousel, title, category, index);
      navigation.append(navItem);
    }
    item.innerHTML = '';
  });
};

export default async function decorate(block) {
  let isFirstLoad = true;
  let scrollIntervalID;

  const carouselContainer = createElement('div', { classes: `${blockName}__container` });
  const carouselItems = createElement('ul', { classes: `${blockName}__items` });
  carouselContainer.append(carouselItems);

  const tabNavigation = createElement('ul', { classes: `${blockName}__navigation` });

  const tabItems = block.querySelectorAll(':scope > div');
  const totalTabs = tabItems.length;

  buildTabItems(carouselItems, tabNavigation, tabItems, totalTabs, articleArray);

  const handleAutoScroll = (enabled) => {
    const interval = 2000;

    const autoScrollFunction = () => {
      const amountOfSlides = carouselContainer.querySelectorAll(`.${blockName}__item`).length;
      const activeSlide = carouselContainer.querySelector('.active');
      const classlistArray = [...activeSlide.classList];
      const item = classlistArray.find((el) => el.slice(0, 5) === 'item-');
      const itemNum = Number(item.split('-')[1]);

      activeSlide.classList.remove('active');

      const nextNum = itemNum === amountOfSlides ? 1 : itemNum + 1;
      const nextSlide = carouselContainer.querySelector(`.item-${nextNum}`);

      nextSlide.classList.add('active');
      if (nextSlide.classList.contains(`${blockName}__item`)) {
        const itemsContainer = nextSlide.parentElement;
        const { x: itemWidth } = nextSlide.getBoundingClientRect();
        itemsContainer.scrollLeft += itemWidth;
      }
    };

    if (enabled) {
      scrollIntervalID = setInterval(autoScrollFunction, interval);
    } else if (!enabled) {
      clearInterval(scrollIntervalID);
      scrollIntervalID = null;
    }
  };

  const handleSwitch = (e) => {
    const slider = e.target.parentElement.querySelector('.switch-slider');
    const isOff = e.target.id === 'off';
    if (autoScrollEnabled === isOff) {
      autoScrollEnabled = !isOff;
    }
    slider.style.left = isOff ? '53px' : '0';
    handleAutoScroll(autoScrollEnabled);
  };

  const autoScrollSwitch = document.createRange().createContextualFragment(`
    <div class='switch'>
      <p class='switch-label'>Auto:</p>
      <div class='switch-buttons'>
        <button id='on'>On</button>
        <button id='off'>Off</button>
        <div class='switch-slider'></div>
      </div>
    </div>
  `);

  autoScrollSwitch.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', (e) => handleSwitch(e)));

  carouselContainer.append(tabNavigation, autoScrollSwitch);
  block.append(carouselContainer);

  if (isFirstLoad) {
    handleAutoScroll(autoScrollEnabled);
    isFirstLoad = false;
  }

  // update the button indicator on scroll
  const elements = carouselItems.querySelectorAll(':scope > *');
  listenScroll(carouselItems, elements, updateActiveItem, 0.75);
  unwrapDivs(block);
}
