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
  const recentArticlesTitle = createElement('h3', 'recentArticles-title');
  recentArticlesTitle.innerText = 'Recent Articles';

  const recentArticleList = createElement('ul', 'recent-articles-list');

  selectedArticles.forEach((e, idx) => {
    const item = createElement('li', ['recent-articles-item', `recent-articles-item-${idx}`]);
    const linkUrl = new URL(e.url, window.location.origin);

    const image = createElement('div', 'recent-articles-image');
    const picture = createOptimizedPicture(e.image, e.title);
    const pictureTag = picture.outerHTML;
    image.innerHTML = `<a href="${linkUrl}" class="image-link">
      ${pictureTag}
    </a>`;
    item.append(image);

    const title = createElement('a', 'recent-articles-title');
    title.href = linkUrl;
    title.innerText = e.title;
    item.append(title);

    if (idx === 0) {
      const category = createElement('a', 'recent-articles-category');
      const categoriesWithDash = e.category.replaceAll(' ', '-').toLowerCase();
      const categoryUrl = new URL(`magazine/categories/${categoriesWithDash}`, window.location.origin);
      category.href = categoryUrl;
      category.innerText = e.category;

      const subtitle = createElement('p', 'recent-articles-subtitle');
      subtitle.innerText = e.subtitle;

      const link = createElement('a', 'recent-articles-link');
      link.innerText = 'READ NOW';
      link.href = linkUrl;

      image.insertAdjacentElement('afterend', category);
      title.insertAdjacentElement('afterend', subtitle);
      subtitle.insertAdjacentElement('afterend', link);
    }
    recentArticleList.append(item);
  });

  recentArticlesSection.append(recentArticlesTitle);
  recentArticlesSection.append(recentArticleList);

  block.textContent = '';
  block.append(recentArticlesSection);
}
