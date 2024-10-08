import {
  createElement,
  getOrigin,
  getTextLabel,
  getAllArticles,
  getLimit,
  clearOpenArticle,
  sortArticlesByLastModified,
} from '../../scripts/common.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

const sectionTitle = getTextLabel('Recent article text');
const readNowText = getTextLabel('READ NOW');

export default async function decorate(block) {
  const limit = getLimit(block) || 5;
  const allArticles = await getAllArticles();

  const sortedArticles = sortArticlesByLastModified(allArticles);
  const filteredArticles = clearOpenArticle(sortedArticles);
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

    // TODO: to be updated if the category is not properly gathered from magazine-articles.json
    const categoriesWithDash = e.category.replaceAll(' ', '-').toLowerCase();
    const categoryUrl = new URL(`magazine/categories/${categoriesWithDash}`, getOrigin());
    const category = createElement('a', {
      classes: `recent-articles-${firstOrRest}-category`,
      props: { href: categoryUrl },
    });
    category.innerText = e.category;

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
