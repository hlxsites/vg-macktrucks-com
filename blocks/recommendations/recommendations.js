import { createElement } from '../../scripts/scripts.js';
import {
  getMetadata,
  createOptimizedPicture,
} from '../../scripts/lib-franklin.js';

const getAllArticles = async () => {
  const response = await fetch('/magazine-articles.json');
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
  const category = getMetadata('category');

  const allArticles = await getAllArticles();
  const recommendedArticles = allArticles.filter((e) => e.category === category);
  const selectedArticles = recommendedArticles.slice(0, limit);

  const recommendationsSection = createElement('div', 'recommendations-section');
  const recommendationsTitle = createElement('h3', 'recommendations-section-title');
  recommendationsTitle.innerText = 'Based on your reading, you might like this...';

  const recommendationsList = createElement('ul', 'recommendations-list');

  selectedArticles.forEach((e, idx) => {
    const item = createElement('li', ['recommendations-item', `recommendations-item-${idx}`]);
    const linkUrl = new URL(e.url, window.location.origin);

    const image = createElement('div', 'recommendations-image');
    const picture = createOptimizedPicture(e.image, e.title);
    const pictureTag = picture.outerHTML;
    image.innerHTML = `<a href="${linkUrl}" class="image-link">
      ${pictureTag}
    </a>`;

    const content = createElement('div', 'recommendations-text-content');

    const categoryLink = createElement('a', 'recommendations-category');
    const categoriesWithDash = e.category.replaceAll(' ', '-').toLowerCase();
    const categoryUrl = new URL(`magazine/categories/${categoriesWithDash}`, window.location.origin);
    categoryLink.href = categoryUrl;
    categoryLink.innerText = e.category;

    const title = createElement('a', 'recommendations-title');
    title.href = linkUrl;
    title.innerText = e.title;

    content.append(categoryLink, title);

    const subtitle = createElement('a', 'recommendations-subtitle');
    subtitle.href = linkUrl;
    subtitle.innerText = e.subtitle;

    if (e.subtitle.length !== 0) {
      content.append(subtitle);
    }
    item.append(image, content);
    recommendationsList.append(item);
  });

  recommendationsSection.append(recommendationsTitle, recommendationsList);

  block.textContent = '';
  block.append(recommendationsSection);
}
