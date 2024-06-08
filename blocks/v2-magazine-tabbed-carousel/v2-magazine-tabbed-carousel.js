import { createElement, unwrapDivs, getJsonFromUrl } from '../../scripts/common.js';
import { setCarouselPosition, listenScroll } from '../../scripts/carousel-helper.js';

const blockName = 'v2-magazine-tabbed-carousel';
const autoScrollInterval = 2000;
let autoScrollEnabled = true;

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

export default async function decorate(block) {
  let isFirstLoad = true;
  let scrollIntervalID;

  const url = '/magazine-articles.json';
  const allArticles = await getJsonFromUrl(url);
  const articleArray = Object.values(allArticles.data);

  const carouselContainer = createElement('div', { classes: `${blockName}__container` });
  const carouselItems = createElement('ul', { classes: `${blockName}__items` });
  carouselContainer.append(carouselItems);

  const tabNavigation = createElement('ul', { classes: `${blockName}__navigation` });

  function buildTabNavigation(title, category, index) {
    const listItem = document.createRange().createContextualFragment(`
      <li class='${blockName}__navigation-item item-${index + 1}'>
        <p class='pretitle'>${category}</p>
        <p class='title'>${title}</p>
      </li>
    `);
    listItem.querySelector('li').addEventListener('click', () => setCarouselPosition(carouselItems, index));

    return listItem;
  }

  const tabItems = block.querySelectorAll(':scope > div');
  tabItems.forEach((tabItem, index) => {
    if (index <= 3) {
      const picture = tabItem.querySelector('picture');

      const liItem = createElement('li', { classes: [`${blockName}__item`, `item-${index + 1}`] });
      const figure = createElement('figure', { classes: `${blockName}__figure` });
      const tabContent = tabItem.querySelector('a');
      const articlePath = tabContent.href;

      figure.append(picture);

      const figureCaption = createElement('figcaption');
      figureCaption.append(tabContent);
      figure.append(figureCaption);

      liItem.append(figure);
      carouselItems.appendChild(liItem);

      const fullArticleObj = articleArray.find((path) => {
        const shortUrl = articlePath.split('/magazine/')[1];
        const shortPath = path.path.split('/magazine/')[1];
        return shortPath === shortUrl;
      });
      const { title, category } = fullArticleObj;

      const navItem = buildTabNavigation(title, category, index);
      tabNavigation.append(navItem);
    }
    tabItem.innerHTML = '';
  });

  const handleAutoScroll = (enabled) => {
    const autoScrollFunction = () => {
      const amountOfSlides = carouselContainer.querySelectorAll(`.${blockName}__item`).length;
      const activeSlide = carouselContainer.querySelectorAll('.active');
      const classlistArray = [...activeSlide[0].classList];
      const item = classlistArray.find((el) => el.slice(0, 5) === 'item-');
      const itemNum = Number(item.split('-')[1]);

      activeSlide.forEach((el) => el.classList.remove('active'));

      const nextNum = itemNum === amountOfSlides ? 1 : itemNum + 1;
      const nextSlide = carouselContainer.querySelectorAll(`.item-${nextNum}`);

      nextSlide.forEach((el) => {
        el.classList.add('active');
        if (el.classList.contains(`${blockName}__item`)) {
          const itemsContainer = el.parentElement;
          const { x: itemWidth } = el.getBoundingClientRect();
          itemsContainer.scrollLeft += itemWidth;
        }
      });
    };

    if (enabled) {
      scrollIntervalID = setInterval(autoScrollFunction, autoScrollInterval);
    } else if (!enabled) {
      clearInterval(scrollIntervalID);
      scrollIntervalID = null;
    }
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

  const handleSwitch = (e) => {
    const slider = e.target.parentElement.querySelector('.switch-slider');
    const isOff = e.target.id === 'off';
    if (autoScrollEnabled === isOff) {
      autoScrollEnabled = !isOff;
    }
    slider.style.left = isOff ? '53px' : '0';
    handleAutoScroll(autoScrollEnabled);
  };

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
