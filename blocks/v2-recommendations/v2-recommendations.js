import { getJsonFromUrl, unwrapDivs } from '../../scripts/common.js';
import { getMetadata } from '../../scripts/aem.js';

const blockName = 'v2-recommendations';

/**
 * Fetches magazine articles from a given URL.
 * @async
 * @returns {Promise<Array>} - A promise that resolves to an array of article objects or an
 * empty array if the fetch fails.
 */
const fetchMagazineArticles = async () => {
  try {
    const response = await getJsonFromUrl('/magazine-articles.json');

    if (!response?.data) {
      // eslint-disable-next-line no-console
      console.warn('No data found in response.');
      return [];
    }

    const { data } = response;

    return Array.isArray(data) ? data : [data];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching articles: ${error.message || error}`);
    return [];
  }
};

/**
 * Sorts articles by the most recent `lastModified` date in descending order.
 * @param {Array} articles - The array of article objects to be sorted.
 * @returns {Array} - A new array of articles sorted by the most recent date.
 */
const sortArticlesByLastModifiedDate = (articles) => articles
  .map((article) => ({
    ...article,
    timestamp: new Date(article.lastModified).getTime(),
  }))
  .sort((a, b) => b.timestamp - a.timestamp);

/**
 * Retrieves up to three articles based on the specified category.
 * If there are fewer than 3 matching articles, the most recent articles are used to fill the
 * remaining slots.
 *
 * @param {Array} articles - The array of sorted article objects.
 * @param {string} category - The category to filter articles by.
 * @returns {Array} - An array containing up to three articles.
 */
const getTopArticles = (articles, category) => {
  const topArticles = [];
  const nonCategoryArticles = [];

  for (const article of articles) {
    if (article.category === category) {
      topArticles.push(article);
      if (topArticles.length === 3) break;
    } else {
      nonCategoryArticles.push(article);
    }
  }

  // If we don't have enough filtered articles, fill with the remaining articles
  return topArticles.concat(nonCategoryArticles).slice(0, 3);
};

/**
 * Builds and appends a block of related articles to a given block element.
 * Each article is rendered inside an article container with an image, category, and title.
 *
 * @param {Array<Object>} articles - An array of article objects to be rendered. Each article
 * should have the following properties:
 *  - path {string}: The URL path to the article.
 *  - image {string}: The URL of the article's image.
 *  - category {string}: The category of the article.
 *  - title {string}: The title of the article.
 * @param {HTMLElement} block - The block element where the articles container will be appended.
 */
const buildBlock = (articles, block) => {
  const fragment = document.createDocumentFragment();

  articles.forEach((article) => {
    const articleElement = document.createElement('article');
    articleElement.classList.add(`${blockName}__article`);

    articleElement.innerHTML = `
      <a href="${article.path}" class="${blockName}__article-link">
        <img src="${article.image}" alt="" class="${blockName}__article-image">
        <div class="${blockName}__article-content">
          <p class="${blockName}__article-content-category">${article.category}</p>
          <h4 class="${blockName}__article-content-title">${article.title}</h4>
        </div>
      </a>
    `;

    fragment.appendChild(articleElement);
  });

  const articlesContainer = document.createElement('div');
  articlesContainer.classList.add(`${blockName}__articles`);
  articlesContainer.appendChild(fragment);

  block.appendChild(articlesContainer);
};

/**
 * Main function to decorate the block element with the top articles.
 * Fetches the articles, sorts them by date, filters them by category, and displays up to
 * three articles.
 * @param {HTMLElement} block - The block element to decorate.
 * @returns {void}
 */
export default async function decorate(block) {
  const articles = await fetchMagazineArticles();
  if (!articles.length) return;

  const sortedArticles = sortArticlesByLastModifiedDate(articles);
  const category = getMetadata('article-category');
  const topArticles = getTopArticles(sortedArticles, category);

  if (topArticles.length) {
    buildBlock(topArticles, block);
  }

  unwrapDivs(block);
}
