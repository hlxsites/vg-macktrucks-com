import { createElement, getTextLabel } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export const getAllArticles = async () => {
  const response = await fetch('/magazine-articles.json');
  const json = await response.json();
  return json.data;
};

export const getLimit = (block) => {
  const children = [...block.children];
  const number = [...children[0].children][1].innerText;
  return number;
};

export default async function decorate(block) {
  const limit = Number(getLimit(block));
  const allArticles = await getAllArticles();
  const sectionTitle = await getTextLabel('Recent article text');

  const sortedArticles = allArticles.sort((a, b) => {
    a.date = +(a.date);
    b.date = +(b.date);
    return a.date - b.date;
  });

  const currentArticlePath = window.location.href.split('/').pop();
  const filteredArticles = sortedArticles.filter((e) => {
    const path = e.path.split('/').pop();
    if (path !== currentArticlePath) return e;
    return null;
  });

  const selectedArticles = filteredArticles.slice(0, limit);

  const recentArticlesSection = createElement('div', 'recent-articles-section');
  const recentArticlesTitle = createElement('h3', 'recent-articles-section-title');
  recentArticlesTitle.innerText = sectionTitle;

  const recentArticleList = createElement('ul', 'recent-articles-list');

  selectedArticles.forEach((e, idx) => {
    const linkUrl = new URL(e.path, window.location.origin);
    const firstOrRest = (idx === 0) ? 'first' : 'rest';

    const item = createElement('li', `recent-articles-${firstOrRest}-item`);

    const image = createElement('div', `recent-articles-${firstOrRest}-image`);
    const picture = createOptimizedPicture(e.image, e.title);
    const pictureTag = picture.outerHTML;
    image.innerHTML = `<a href='${linkUrl}'>
      ${pictureTag}
    </a>`;

    const categoriesWithDash = e.category.replaceAll(' ', '-').toLowerCase();
    const categoryUrl = new URL(`magazine/categories/${categoriesWithDash}`, window.location.origin);
    const category = createElement('a', `recent-articles-${firstOrRest}-category`, { href: categoryUrl });
    category.innerText = e.category;

    const title = createElement('a', `recent-articles-${firstOrRest}-title`, { href: linkUrl });
    title.innerText = e.title;

    const subtitle = createElement('p', `recent-articles-${firstOrRest}-subtitle`);
    subtitle.innerText = e.subtitle;

    const link = createElement('a', `recent-articles-${firstOrRest}-link`, { href: linkUrl });
    link.innerText = 'READ NOW';

    if (idx === 0) {
      item.append(image, category, title, subtitle, link);
    } else {
      item.append(image, title);
    }
    recentArticleList.append(item);
  });
  recentArticlesSection.append(recentArticlesTitle, recentArticleList);

  block.textContent = '';
  block.append(recentArticlesSection);
}
