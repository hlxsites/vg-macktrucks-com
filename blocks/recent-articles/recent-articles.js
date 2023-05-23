import { createElement } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

const getAllArticles = async () => {
  // TODO change route to main folder
  const response = await fetch('/drafts/shomps/magazine/article-list.json');
  const json = await response.json();
  return json.data;
};

const getLimit = (block) => {
  const children = [...block.children];
  const number = [...children[0].children][1].innerText;
  return number;
};

export default async function decorate(block) {
  const limit = Number(getLimit(block));
  const allArticles = await getAllArticles();

  const sortedArticles = allArticles.sort((a, b) => {
    a.date = Number(a.date);
    b.date = Number(b.date);
    return a.date - b.date;
  });

  const selectedArticles = sortedArticles.slice(0, limit);

  const recentArticlesSection = createElement('div', 'recent-articles-section');
  const recentArticlesTitle = createElement('h3', 'recent-articles-section-title');
  recentArticlesTitle.innerText = 'Recent Articles';

  const recentArticleList = createElement('ul', 'recent-articles-list');

  selectedArticles.forEach((e, idx) => {
    const linkUrl = new URL(e.url, window.location.origin);
    if (idx === 0) {
      const item = createElement('li', 'recent-articles-first-item');

      const image = createElement('div', 'recent-articles-image');
      const picture = createOptimizedPicture(e.image, e.title);
      const pictureTag = picture.outerHTML;
      image.innerHTML = `<a href="${linkUrl}">
        ${pictureTag}
      </a>`;
      item.append(image);

      const category = createElement('a', 'recent-articles-first-category');
      const categoriesWithDash = e.category.replaceAll(' ', '-').toLowerCase();
      const categoryUrl = new URL(`magazine/categories/${categoriesWithDash}`, window.location.origin);
      category.href = categoryUrl;
      category.innerText = e.category;

      const title = createElement('a', 'recent-articles-first-title');
      title.href = linkUrl;
      title.innerText = e.title;

      const subtitle = createElement('p', 'recent-articles-first-subtitle');
      subtitle.innerText = e.subtitle;

      const link = createElement('a', 'recent-articles-first-link');
      link.innerText = 'READ NOW';
      link.href = linkUrl;

      item.append(category, title, subtitle, link);
      recentArticleList.append(item);
    } else {
      const item = createElement('li', 'recent-articles-rest-item');

      const image = createElement('div', 'recent-articles-rest-image');
      const picture = createOptimizedPicture(e.image, e.title);
      const pictureTag = picture.outerHTML;
      image.innerHTML = `<a href='${linkUrl}'>
        ${pictureTag}
      </a>`;

      const title = createElement('a', 'recent-articles-rest-title');
      title.href = linkUrl;
      title.innerText = e.title;

      item.append(image, title);
      recentArticleList.append(item);
    }
  });
  recentArticlesSection.append(recentArticlesTitle, recentArticleList);

  block.textContent = '';
  block.append(recentArticlesSection);
}
