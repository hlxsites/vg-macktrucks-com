import {
  createElement,
  getOrigin,
  getTextLabel,
  getArticleTagsJSON,
} from '../../scripts/common.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

const sectionTitle = getTextLabel('Recent article text');
const readNowText = getTextLabel('READ NOW');
const allArticleTags = await getArticleTagsJSON();
const allCategories = allArticleTags.categories;

const getArticleCategory = (article) => {
  try {
    const articleTags = JSON.parse(article.tags);
    const categoriesSet = new Set(allCategories);
    return articleTags.find((tag) => categoriesSet.has(tag)) || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error parsing article tags:', error);
    return null;
  }
};

export const getAllArticles = async () => {
  const response = await fetch('/magazine-articles.json');
  const json = await response.json();
  return json.data;
};

export const getLimit = (block) => {
  const classes = block.classList;
  let limit;
  classes.forEach((e) => {
    const [name, value] = e.split('-');
    if (name === 'limit') limit = value;
  });
  return limit;
};

export const clearRepeatedArticles = (articles) => articles.filter((e) => {
  const currentArticlePath = window.location.href.split('/').pop();
  const path = e.path.split('/').pop();
  if (path !== currentArticlePath) return e;
  return null;
});

export const sortArticles = (articles) => articles.sort((a, b) => {
  a.lastModified = +(a.lastModified);
  b.lastModified = +(b.lastModified);
  return b.lastModified - a.lastModified;
});

export default async function decorate(block) {
  const limit = Number(getLimit(block));
  const allArticles = await getAllArticles();

  const sortedArticles = sortArticles(allArticles);
  const filteredArticles = clearRepeatedArticles(sortedArticles);
  const selectedArticles = filteredArticles.slice(0, limit);

  const recentArticlesSection = createElement('div', { classes: 'recent-articles-section' });
  const recentArticlesTitle = createElement('h3', { classes: 'recent-articles-section-title' });
  recentArticlesTitle.innerText = sectionTitle;

  const recentArticleList = createElement('ul', { classes: 'recent-articles-list' });

  selectedArticles.forEach((e, idx) => {
    const linkUrl = new URL(e.path, getOrigin());
    const firstOrRest = (idx === 0) ? 'first' : 'rest';

    const item = createElement('li', { classes: `recent-articles-${firstOrRest}-item` });

    const image = createElement('div', { classes: `recent-articles-${firstOrRest}-image` });
    const picture = createOptimizedPicture(e.image, e.title);
    const pictureTag = picture.outerHTML;
    image.innerHTML = `<a href='${linkUrl}'>
      ${pictureTag}
    </a>`;

    const articleCategory = getArticleCategory(e);
    const categoryWithDash = articleCategory.replaceAll(' ', '-').toLowerCase();
    const categoryUrl = new URL(`magazine/categories/${categoryWithDash}`, getOrigin());
    const category = createElement('a', {
      classes: `recent-articles-${firstOrRest}-category`,
      props: { href: categoryUrl },
    });
    category.innerText = articleCategory;

    const title = createElement('a', {
      classes: `recent-articles-${firstOrRest}-title`,
      props: { href: linkUrl },
    });
    title.innerText = e.title;

    const subtitle = createElement('p', { classes: `recent-articles-${firstOrRest}-subtitle` });
    subtitle.innerText = e.subtitle;

    const link = createElement('a', {
      classes: `recent-articles-${firstOrRest}-link`,
      props: { href: linkUrl },
    });
    link.innerText = readNowText;

    if (idx === 0) {
      item.append(image, category, title, subtitle, link);
    } else {
      item.append(image, title);
    }
    recentArticleList.append(item);
  });
  recentArticlesSection.append(recentArticlesTitle, recentArticleList);

  block.style.display = 'block';
  block.textContent = '';
  block.append(recentArticlesSection);
}
