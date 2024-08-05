import { decorateIcons, getTextLabel } from '../../scripts/common.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { getAllArticles } from '../recent-articles/recent-articles.js';

const LABELS = {
  SHOW_MORE: getTextLabel('Show More'),
  SEARCH: getTextLabel('Search'),
  FILTERS_PLACEHOLDERS: getTextLabel('Magazine filters placeholders'),
  SHOWING_PLACEHOLDER: getTextLabel('Showing placeholder'),
  SORT_BY: getTextLabel('Sort by'),
  SORT_PLACEHOLDERS: getTextLabel('Sort filter placeholders'),
};

const blockName = 'v2-explore-articles';
const CLASSES = {
  filterItem: `${blockName}__filter-item`,
  collageWrapper: `${blockName}__collage-wrapper`,
  collage: `${blockName}__collage`,
  showMoreButton: `${blockName}__show-more-button`,
  showMoreButtonWrapper: `${blockName}__show-more-container`,
};

const docRange = document.createRange();
const defaultAmount = 9;
let currentAmount = 0;

const getData = async () => {
  const allArticles = await getAllArticles();
  // Preparing the data for every collage item
  const collageItemsData = allArticles.map((article) => {
    const {
      title, image, path, category,
    } = article;
    const linkUrl = new URL(path, window.location.origin);
    const picture = createOptimizedPicture(new URL(image, window.location.origin), title, true);
    picture.setAttribute('tabindex', '0');
    return {
      title, picture, linkUrl, category,
    };
  });

  // TODO: prepare the data to fill the categories, topics, and trucks filters

  return {
    articles: collageItemsData,
    // categories: [],
    // topics: [],
    // trucks: [],
  };
};

const buildFiltersTemplate = () => {
  const filtersPlaceholderList = LABELS.FILTERS_PLACEHOLDERS.split(',');
  return filtersPlaceholderList.reduce((accumulator, placeholder) => {
    const filterFragment = `
    <select class="${CLASSES.filterItem}" name="${placeholder}">
      <option value="">${placeholder}</option>
    </select>`;
    return `${accumulator}${filterFragment}`;
  }, '');
};

const buildFiltersExtraLine = (articlesAmount) => {
  const sortPlaceholderList = LABELS.SORT_PLACEHOLDERS.split(',');
  const showingText = LABELS.SHOWING_PLACEHOLDER.replace('$0', defaultAmount)
    .replace('$1', articlesAmount);
  return `
    <div class="${blockName}__showing">
      ${showingText}
    </div>
    <div class="${blockName}__sort-by">
      <span>${LABELS.SORT_BY}</span>
      <select class="${CLASSES.filterItem}" name="${LABELS.SORT_BY}">
        ${sortPlaceholderList.reduce((accumulator, placeholder) => `
          ${accumulator}<option value="${placeholder.toLowerCase()}">${placeholder}</option>`, '')}
      </select>
    </div>
  `;
};

const buildArticlesTemplate = (articles) => articles.reduce((accumulator, article) => {
  const collageItemFragment = `
    <a class="${blockName}__collage-item-link" href="${article.linkUrl.toString()}">
      <div class="${blockName}__collage-item-content">
        <div class="${blockName}__collage-item-category-title">${article.category}</div>
        <div class="${blockName}__collage-item-title">
          ${article.title.split('|')[0]}
          <span class="icon icon-arrow-right"></span>
        </div>
      </div>
      ${article.picture.outerHTML}
    </a>
  `;
  return `${accumulator}
    <div class="${blockName}__collage-item-container">${collageItemFragment}</div>`;
}, '');

// TODO: add <span class="icon icon-search"></span> below the input
const buildTemplate = (articles, articlesAmount) => docRange.createContextualFragment(`
  <div class="v2-explore-articles__filters">
    <input class="${CLASSES.filterItem}" type="search" placeholder="${LABELS.SEARCH}" />
    ${buildFiltersTemplate()}
  </div>
  <div class="v2-explore-articles__extra-line">
    ${buildFiltersExtraLine(articlesAmount)}
  </div>
  <div class="${CLASSES.collageWrapper}">
    <div class="${CLASSES.collage}">
      ${buildArticlesTemplate(articles)}
    </div>
  </div>
  <div class="${CLASSES.showMoreButtonWrapper}">
    <button class="${CLASSES.showMoreButton} button--secondary button--large">
      ${LABELS.SHOW_MORE}
    </button>
  </div>
`);

const addEventListeners = (block, articles) => {
  const showMoreButtonEl = block.querySelector(`.${CLASSES.showMoreButton}`);

  showMoreButtonEl.addEventListener('click', () => {
    const collageEl = block.querySelector(`.${blockName}__collage`);
    const amountEl = block.querySelector(`.${blockName}__showing strong span`);
    const newArticles = articles.slice(currentAmount, currentAmount + defaultAmount);
    const newArticlesTemplate = buildArticlesTemplate(newArticles);
    const newArticlesFragment = docRange.createContextualFragment(newArticlesTemplate);
    collageEl.appendChild(newArticlesFragment);

    currentAmount += defaultAmount;
    if (currentAmount >= articles.length) {
      showMoreButtonEl.remove();
      currentAmount = articles.length;
    }
    amountEl.textContent = currentAmount;
  });
};

export default async function decorate(block) {
  const {
    articles, // TODO: categories, topics, trucks, are missing
  } = await getData();

  const initialArticles = articles.slice(0, defaultAmount);
  const template = buildTemplate(initialArticles, articles.length);
  currentAmount += defaultAmount;

  block.appendChild(template);
  decorateIcons(block);

  addEventListeners(block, articles);
}
