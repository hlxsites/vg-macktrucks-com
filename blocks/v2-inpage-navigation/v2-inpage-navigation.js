import {
  getMetadata,
} from '../../scripts/lib-franklin.js';
import {
  createElement,
} from '../../scripts/scripts.js';

const blockName = 'v2-inpage-navigation';

const getInpageNavigationButtons = () => {
  // if we have a button title & button link
  if (getMetadata('inpage-button') && getMetadata('inpage-link')) {
    const titleMobile = getMetadata('inpage-button');
    const url = getMetadata('inpage-link');
    const link = createElement('a', `${blockName}__cta`, {
      href: url,
      title: titleMobile,
    });
    const mobileText = createElement('span', `${blockName}__cta--mobile`);
    mobileText.textContent = titleMobile;
    link.appendChild(mobileText);

    const titleDesktop = getMetadata('inpage-button-large');
    if (titleDesktop) {
      const desktopText = createElement('span', `${blockName}__cta--desktop`);
      desktopText.textContent = titleDesktop;
      link.setAttribute('title', titleDesktop);
      link.appendChild(desktopText);
    }

    return link;
  }

  return [];
};

const gotoSection = (event) => {
  // let waitingTime = 500;
  const { target } = event;
  const button = target.closest('button');

  if (button) {
    const { id } = button.dataset;

    const container = document.querySelector(`main .section[data-inpageid='${id}']`);
    container?.scrollIntoView({ behavior: 'smooth' });

    // // create an Observer instance
    // const resizeObserver = new ResizeObserver((entries) => {
    //   console.log('Body height changed:', entries[0].target.clientHeight);
    // });

    // // start observing a DOM node
    // resizeObserver.observe(document.body);
  }
};

const updateActive = (id) => {
  console.log('updateActive', id);

  const currentItem = document.querySelector(`.${blockName}__selected-item`);
  const listItems = document.querySelector(`.${blockName}__item--active`);
  listItems.classList.remove(`${blockName}__item--active`);
  const itemsButton = document.querySelectorAll(`.${blockName}__items button`);
  // console.log(itemsButton);

  const selectedButton = [...itemsButton].filter((button) => button.dataset.id === id);
  if (!selectedButton[0]) return;
  currentItem.textContent = selectedButton[0].textContent;
  selectedButton[0].parentNode.classList.add(`${blockName}__item--active`);
};

const toggleList = (e) => {
  console.log(e.target);
  const dropdownWrapper = document.querySelector(`.${blockName}__dropdown`);

  if (e.target.classList.contains(`${blockName}__selected-item`)) {
    dropdownWrapper.classList.toggle(`${blockName}__dropdown--open`);
  } else {
    dropdownWrapper.classList.remove(`${blockName}__dropdown--open`);
  }
};

const listenScroll = () => {
  const main = document.querySelector('main');
  const elements = document.querySelectorAll('main .section[data-inpageid]');

  console.log(main, elements);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // entry.target.classList.add('active');
        console.log(entry.intersectionRatio, entry.target.dataset.inpageid, entry.target);
        updateActive(entry.target.dataset.inpageid);
      }
    });
  }, {
    // root: main,
    threshold: [0.2, 0.5, 0.7, 1],
  });

  elements.forEach((el) => {
    io.observe(el);
  });
};

export default async function decorate(block) {
  const buttons = getInpageNavigationButtons();

  const wrapper = block.querySelector(':scope > div');
  wrapper.classList.add(`${blockName}__wrapper`);
  const itemsWrapper = block.querySelector(':scope > div > div');

  const dropdownWrapper = createElement('div', `${blockName}__dropdown`);
  const activeItem = createElement('div', `${blockName}__selected-item`);

  const list = createElement('ul', `${blockName}__items`);

  [...itemsWrapper.children].forEach((item, index) => {
    const classes = [`${blockName}__item`];
    if (index === 0) {
      classes.push(`${blockName}__item--active`);
      activeItem.textContent = item.textContent;
    }
    const listItem = createElement('li', classes);

    listItem.innerHTML = item.innerHTML;
    list.appendChild(listItem);
  });

  dropdownWrapper.append(activeItem);
  dropdownWrapper.append(list);
  wrapper.append(dropdownWrapper);

  itemsWrapper.remove();

  wrapper.appendChild(buttons);

  list.addEventListener('click', gotoSection);

  // Listener to toggle the dropdown or close it
  document.addEventListener('click', toggleList);

  // listen scroll to change the url
  listenScroll();
}
