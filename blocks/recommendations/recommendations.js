import { createElement, getTextLabel } from '../../scripts/scripts.js';
import { getAllArticles, getLimit, clearRepeatedArticles } from '../recent-articles/recent-articles.js';
import {
  getMetadata,
  createOptimizedPicture,
  getOrigin,
} from '../../scripts/lib-franklin.js';

const recommendationsText = getTextLabel('Recommendations text');
const readNowText = getTextLabel('READ NOW');

export default async function decorate(block) {
  const limit = Number(getLimit(block));
  const category = getMetadata('category');
  const allArticles = await getAllArticles();

  const recommendedArticles = allArticles.filter((e) => e.category === category);
  const filteredArticles = clearRepeatedArticles(recommendedArticles);
  const selectedArticles = filteredArticles.slice(0, limit);

  const recommendationsSection = createElement('div', 'recommendations-section');
  const recommendationsTitle = createElement('h3', 'recommendations-section-title');
  recommendationsTitle.innerText = recommendationsText;

  const recommendationsList = createElement('ul', 'recommendations-list');

  selectedArticles.forEach((e, idx) => {
    const item = createElement('li', ['recommendations-item', `recommendations-item-${idx}`]);
    const linkUrl = new URL(e.path, getOrigin());

    const image = createElement('div', 'recommendations-image');
    const picture = createOptimizedPicture(e.image, e.title);
    const pictureTag = picture.outerHTML;
    image.innerHTML = `<a href="${linkUrl}" class="image-link">
      ${pictureTag}
    </a>`;

    const categoriesWithDash = e.category.replaceAll(' ', '-').toLowerCase();
    const categoryUrl = new URL(`magazine/categories/${categoriesWithDash}`, getOrigin());

    const content = createElement('div', 'recommendations-text-content');
    const categoryLink = createElement('a', 'recommendations-category', { href: categoryUrl });
    categoryLink.innerText = e.category;

    const title = createElement('a', 'recommendations-title', { href: linkUrl });
    title.innerText = e.title;

    const truck = createElement('div', 'recommendations-truck');
    const truckText = createElement('p', 'recommendations-truck-text');
    truckText.innerText = e.truck;
    const truckIcon = createElement('img', 'truck-icon', { src: '/icons/Truck_Key_icon.svg', alt: 'truck icon' });
    if (e.truck.length !== 0) truck.append(truckIcon, truckText);

    const link = createElement('a', 'recommendations-link', { href: linkUrl });
    link.innerText = readNowText;

    content.append(categoryLink, title);

    const subtitle = createElement('a', 'recommendations-subtitle', { href: linkUrl });
    subtitle.innerText = e.subtitle;
    if (e.subtitle.length !== 0) {
      content.append(subtitle);
    }
    content.append(truck, link);
    item.append(image, content);
    recommendationsList.append(item);
  });
  recommendationsSection.append(recommendationsTitle, recommendationsList);

  block.textContent = '';
  block.append(recommendationsSection);
}
