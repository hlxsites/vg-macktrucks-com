import {
  createElement,
  getOrigin,
  getTextLabel,
  getArticleTagsJSON,
} from '../../scripts/common.js';
import {
  getAllArticles,
  getLimit,
  deleteCurrentArticle,
  sortArticlesByLastModified,
} from '../../scripts/magazine-helper.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

const sectionTitle = getTextLabel('Recent article text');
const readNowText = getTextLabel('READ NOW');
const blockName = 'recent-articles';

export default async function decorate(block) {
  const limit = getLimit(block) || 5;
  const allArticles = await getAllArticles();

  const sortedArticles = sortArticlesByLastModified(allArticles);
  const filteredArticles = deleteCurrentArticle(sortedArticles);
  const selectedArticles = filteredArticles.slice(0, limit);

  const recentArticlesSection = createElement('div', { classes: `${blockName}-section` });
  const recentArticlesTitle = createElement('h3', { classes: `${blockName}-section-title` });
  recentArticlesTitle.innerText = sectionTitle;

  const recentArticleList = createElement('ul', { classes: `${blockName}-list` });

  selectedArticles.forEach((e, idx) => {
    const linkUrl = new URL(e.path, getOrigin());
    const firstOrRest = (idx === 0) ? 'first' : 'rest';

    const item = createElement('li', { classes: `${blockName}-${firstOrRest}-item` });

    const image = createElement('div', { classes: `${blockName}-${firstOrRest}-image` });
    const picture = createOptimizedPicture(e.image, e.title);
    const pictureTag = picture.outerHTML;
    image.innerHTML = `<a href='${linkUrl}'>
      ${pictureTag}
    </a>`;

    const articleCategory = getArticleCategory(e);
    const categoryWithDash = articleCategory.replaceAll(' ', '-').toLowerCase();
    const categoryUrl = new URL(`magazine/categories/${categoryWithDash}`, getOrigin());
    const category = createElement('a', {
      classes: `${blockName}-${firstOrRest}-category`,
      props: { href: categoryUrl },
    });
    category.innerText = articleCategory;

    const title = createElement('a', {
      classes: `${blockName}-${firstOrRest}-title`,
      props: { href: linkUrl },
    });
    title.innerText = e.title;

    const subtitle = createElement('p', { classes: `${blockName}-${firstOrRest}-subtitle` });
    subtitle.innerText = e.subtitle;

    const link = createElement('a', {
      classes: `${blockName}-${firstOrRest}-link`,
      props: { href: linkUrl },
    });
    link.innerText = readNowText;

    if (idx === 0) {
      item.append(image, e.category !== '' ? category : '', title, subtitle, link);
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
