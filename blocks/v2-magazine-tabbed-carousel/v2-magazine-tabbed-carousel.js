import {
  createElement,
  unwrapDivs,
  getJsonFromUrl,
  getTextLabel,
} from '../../scripts/common.js';
import { setCarouselPosition, listenScroll } from '../../scripts/carousel-helper.js';

const blockName = 'v2-magazine-tabbed-carousel';
let autoScrollEnabled = true;
const maxAmountOfTabs = 4;
const intervalTime = 4000;

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
  const item = document.createRange().createContextualFragment(`
    <button tabindex="0" class="${blockName}__navigation-item item-${index + 1}">
      <p class="pretitle">${category}</p>
      <p class="title">${title}</p>
    </button>
  `);
  item.querySelector('button').addEventListener('click', () => setCarouselPosition(carousel, index));

  return item;
};

const buildTabItems = (carousel, navigation, items, articles) => {
  items.forEach((item, index) => {
    if (index <= (maxAmountOfTabs - 1)) {
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

const autoScrollFunction = (container) => {
  const amountOfSlides = container.querySelectorAll(`.${blockName}__item`).length;
  const activeSlide = container.querySelector('.active');
  const classlistArray = [...activeSlide.classList];
  const item = classlistArray.find((el) => el.slice(0, 5) === 'item-');
  const itemNum = Number(item.split('-')[1]);

  activeSlide.classList.remove('active');

  const nextNum = itemNum === amountOfSlides ? 1 : itemNum + 1;
  const nextSlide = container.querySelector(`.item-${nextNum}`);

  nextSlide.classList.add('active');
  if (nextSlide.classList.contains(`${blockName}__item`)) {
    const itemsContainer = nextSlide.parentElement;
    const { x: itemWidth } = nextSlide.getBoundingClientRect();
    itemsContainer.scrollLeft += itemWidth;
  }
};

const handleSwitch = (e, setAutoScroll) => {
  const slider = e.target.parentElement.querySelector('.switch-slider');
  const isOff = e.target.id === 'off';
  if (autoScrollEnabled === isOff) {
    autoScrollEnabled = !isOff;
  }
  slider.style.left = isOff ? '53px' : '0';
  setAutoScroll(autoScrollEnabled);
};

export default async function decorate(block) {
  let isFirstLoad = true;
  let scrollIntervalID;

  const switchFullTexts = getTextLabel('autoscroll_switch');

  const carouselContainer = createElement('div', { classes: `${blockName}__container` });
  const carouselItems = createElement('ul', { classes: `${blockName}__items` });
  carouselContainer.append(carouselItems);

  const tabNavigation = createElement('nav', { classes: `${blockName}__navigation` });

  const tabItems = block.querySelectorAll(':scope > div');

  buildTabItems(carouselItems, tabNavigation, tabItems, articleArray);

  const handleAutoScroll = (isEnabled) => {
    if (isEnabled) {
      scrollIntervalID = setInterval(() => {
        autoScrollFunction(carouselContainer);
      }, intervalTime);
    } else {
      clearInterval(scrollIntervalID);
      scrollIntervalID = null;
    }
  };

  const switchSplittedTexts = switchFullTexts.split(',');
  const autoScrollSwitch = document.createRange().createContextualFragment(`
    <div class="switch">
      <p class="switch-label">${switchSplittedTexts[0]}</p>
      <div class="switch-buttons">
        <button id="on">${switchSplittedTexts[1]}</button>
        <button id="off">${switchSplittedTexts[2]}</button>
        <div class="switch-slider"></div>
      </div>
    </div>
  `);

  autoScrollSwitch.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', (e) => handleSwitch(e, handleAutoScroll)));

  carouselContainer.append(tabNavigation);
  block.append(carouselContainer);

  if (isFirstLoad && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    carouselContainer.append(autoScrollSwitch);
    handleAutoScroll(autoScrollEnabled);
    isFirstLoad = false;
  }

  // update the button indicator on scroll
  const elements = carouselItems.querySelectorAll(':scope > *');
  listenScroll(carouselItems, elements, updateActiveItem, 0.75);
  unwrapDivs(block);
}
