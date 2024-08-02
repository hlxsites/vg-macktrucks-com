import { createElement, decorateIcons, getTextLabel } from '../../scripts/common.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { getAllArticles } from '../recent-articles/recent-articles.js';

const blockName = 'v2-explore-articles';
const filterItemClass = `${blockName}__filter-item`;
const defaultAmount = 9;
let currentAmount = 0;

const decorateSelect = (filter, { styleClass = filterItemClass } = {}) => {
  const options = filter.innerText.split('\n').filter((item) => item.trim()).map((item) => item.trim());
  const defaultValue = options[0];
  const selectEl = createElement('select', {
    classes: [`${blockName}__filter`, styleClass],
    props: { name: defaultValue },
  });
  options.forEach((option) => {
    const optionElement = createElement('option', {
      props: { value: option },
    });
    optionElement.textContent = option;
    selectEl.appendChild(optionElement);
  });
  filter.textContent = '';
  filter.appendChild(selectEl);
};

const decorateFilters = (filters) => {
  // 1st row
  const filterElements = filters.querySelectorAll(':scope > ul > li');
  const filterListEL = filterElements[0].parentElement;
  filterListEL.classList.add(`${blockName}__filter-list`);
  filters.classList.add(`${blockName}__main-filters`);

  [...filterElements].forEach((filter) => {
    const optionListEl = filter.querySelector(':scope > ul');
    if (optionListEl) {
      // decorate select
      decorateSelect(filter);
    } else {
      // decorate input search
      const inputSearchEl = createElement('input', {
        classes: [`${blockName}__input-search`, filterItemClass],
        props: { type: 'search', placeholder: filter.textContent },
      });
      filter.textContent = '';
      filter.appendChild(inputSearchEl);
    }
  });
};

const decorateShowingText = (showingEl, allArticles) => {
  const [showing, of, stories] = showingEl.textContent.split('$');
  const boldedTextEl = createElement('strong');
  const amountSpanEl = createElement('span');
  boldedTextEl.textContent = `${showing}`;
  amountSpanEl.textContent = `${defaultAmount}`;
  boldedTextEl.appendChild(amountSpanEl);
  showingEl.textContent = '';
  showingEl.appendChild(boldedTextEl);
  showingEl.innerHTML += `${of}${allArticles.length}${stories}`;
};

const decorateExtraFilters = (extraFilters, allArticles) => {
  // 2nd row
  const showingTextEl = extraFilters.querySelector(':scope > p');
  const sortByTextEl = extraFilters.querySelector(':scope > p + p');
  const sortByItemsEl = extraFilters.querySelector(':scope > ul');

  if (![showingTextEl, sortByTextEl, sortByItemsEl].every(Boolean)) {
    return;
  }

  extraFilters.classList.add(`${blockName}__extra-filters`);
  showingTextEl.classList.add(`${blockName}__showing`);
  sortByTextEl.classList.add(`${blockName}__sort-by`);

  decorateShowingText(showingTextEl, allArticles);
  decorateSelect(sortByItemsEl, { styleClass: `${blockName}__sort-by-items` });
  sortByTextEl.appendChild(sortByItemsEl);
};

const createArticleItem = (article) => {
  const itemContainerEl = createElement('div', {
    classes: [`${blockName}__collage-item-container`],
  });
  const srcImage = `${window.location.origin}${article.image}`;
  const picture = createOptimizedPicture(srcImage, article.title, true);
  const collageItemFragment = document.createRange().createContextualFragment(`
    <a class="${blockName}__collage-item-link" href="${window.location.origin}${article.path}">
      <div class="${blockName}__collage-item-content">
        <div class="${blockName}__collage-item-category-title">${article.category}</div>
        <div class="${blockName}__collage-item-title">
          ${article.title.split('|')[0]}
          <span class="icon icon-arrow-right"></span>
        </div>
      </div>
      ${picture.outerHTML}
    </a>
  `);
  picture.setAttribute('tabindex', 0);

  itemContainerEl.appendChild(collageItemFragment);
  return itemContainerEl;
};

const addArticlesToCollage = (allArticles, collageEl) => {
  // eslint-disable-next-line no-plusplus
  for (let i = currentAmount; i < currentAmount + defaultAmount; i++) {
    const article = allArticles[i];
    if (!article) {
      break;
    }
    const collageItemContainerEl = createArticleItem(article);
    collageEl.appendChild(collageItemContainerEl);
  }
};

const decorateCollage = (allArticles, block) => {
  // 3rd row
  const collageWrapperEl = createElement('div', {
    classes: [`${blockName}__collage-wrapper`],
  });
  const collageEl = createElement('div', {
    classes: [`${blockName}__collage`],
  });

  addArticlesToCollage(allArticles, collageEl);
  currentAmount = defaultAmount;
  collageWrapperEl.appendChild(collageEl);
  block.appendChild(collageWrapperEl);
  decorateIcons(block);
};

const addShowMoreButton = (allArticles, block) => {
  // 4th row
  const buttonContainer = createElement('div', {
    classes: [`${blockName}__show-more-container`],
  });
  const showMoreButton = createElement('button', {
    classes: [`${blockName}__show-more-button`, 'button--secondary', 'button--large'],
  });

  showMoreButton.textContent = getTextLabel('Show More');
  buttonContainer.appendChild(showMoreButton);
  block.appendChild(buttonContainer);

  showMoreButton.addEventListener('click', () => {
    const collageEl = block.querySelector(`.${blockName}__collage`);
    const amountEl = block.querySelector(`.${blockName}__showing strong span`);
    addArticlesToCollage(allArticles, collageEl);

    currentAmount += defaultAmount;
    if (currentAmount >= allArticles.length) {
      showMoreButton.remove();
      currentAmount = allArticles.length;
    }
    amountEl.textContent = currentAmount;
  });
};

export default async function decorate(block) {
  const allArticles = await getAllArticles();
  const filtersRow1 = block.querySelector(':scope > div') || null;
  const filtersRow2 = block.querySelector(':scope > div + div') || null;
  const filters = filtersRow1 && filtersRow1.querySelector(':scope > div');
  const extraFilters = filtersRow2 && filtersRow2.querySelector(':scope > div');

  if (![filtersRow1, filters, filtersRow2, extraFilters].every(Boolean)) {
    return;
  }

  block.parentElement.classList.add('full-width');
  filtersRow1.classList.add(`${blockName}__filters`, `${blockName}__filters--row-1`);
  filtersRow2.classList.add(`${blockName}__filters`, `${blockName}__filters--row-2`);
  decorateFilters(filters); // 1st Row: search, category, topic, truck
  decorateExtraFilters(extraFilters, allArticles); // 2nd Row: amount of items, sort by
  decorateCollage(allArticles, block); // 3rd Row: collage
  addShowMoreButton(allArticles, block); // 4th Row: show more button
}
