const blockClass = 'v2-cards';

export default async function decorate(block) {
  const cardsItems = [...block.querySelectorAll(':scope > div')];
  cardsItems.forEach((el) => el.classList.add(`${blockClass}__card-item`));

  const cardsSections = [...block.querySelectorAll(':scope > div > div')];
  cardsSections.forEach((el) => {
    el.classList.add(`${blockClass}__text-wrapper`);
  });

  const pictures = [...block.querySelectorAll('picture')];
  pictures.forEach((el) => {
    el.classList.add(`${blockClass}__picture`);
    el.parentElement.classList.add(`${blockClass}__picture-wrapper`);
    el.parentElement.classList.remove(`${blockClass}__text-wrapper`);
  });

  const images = [...block.querySelectorAll('img')];
  images.forEach((el) => el.classList.add(`${blockClass}__image`));

  const cardsHeadings = [...block.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  cardsHeadings.forEach((el) => el.classList.add(`${blockClass}__heading`));

  const buttons = [...block.querySelectorAll('.button-container')];
  buttons.forEach((el) => {
    el.classList.add(`${blockClass}__button-container`);
    [...el.querySelectorAll('a')].forEach((link) => link.classList.add(`${blockClass}__button`));
  });
}
