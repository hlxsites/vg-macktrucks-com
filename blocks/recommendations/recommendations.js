import {
  createElement,
  getArticleTags,
  getOrigin,
  getTextLabel,
  getAllArticles,
  getLimit,
  deleteCurrentArticle,
  sortArticlesByLastModified,
} from '../../scripts/common.js';
import {
  getMetadata,
  createOptimizedPicture,
} from '../../scripts/aem.js';

const recommendationsText = getTextLabel('Recommendations text');
const readNowText = getTextLabel('READ NOW');
const blockName = 'recommendations';

export default async function decorate(block) {
  const limit = getLimit(block) || 2;
  const category = await getArticleTags('categories')
    || getMetadata('article-category')
    || getMetadata('category');
  const allArticles = await getAllArticles();
  const recommendedArticles = allArticles.filter((e) => e.category === category);
  const soredtArticles = sortArticlesByLastModified(recommendedArticles);
  const filteredArticles = deleteCurrentArticle(soredtArticles);
  const selectedArticles = filteredArticles.slice(0, limit);

  const recommendationsSection = createElement('div', { classes: `${blockName}-section` });
  const recommendationsTitle = createElement('h3', { classes: `${blockName}-section-title` });
  recommendationsTitle.innerText = selectedArticles.length > 1 ? recommendationsText : '';

  const recommendationsList = createElement('ul', { classes: `${blockName}-list` });

  selectedArticles.forEach((e, idx) => {
    const item = createElement('li', { classes: [`${blockName}-item`, `${blockName}-item-${idx}`] });
    const linkUrl = new URL(e.path, getOrigin());

    const image = createElement('div', { classes: `${blockName}-image` });
    const picture = createOptimizedPicture(e.image, e.title);
    const pictureTag = picture.outerHTML;
    image.innerHTML = `<a href="${linkUrl}" class="image-link">
      ${pictureTag}
    </a>`;

    const categoriesWithDash = e.category.replaceAll(' ', '-').toLowerCase();
    const categoryUrl = new URL(`magazine/categories/${categoriesWithDash}`, getOrigin());

    const content = createElement('div', { classes: `${blockName}-text-content` });
    const categoryLink = createElement('a', {
      classes: `${blockName}-category`,
      props: { href: categoryUrl },
    });
    categoryLink.innerText = e.category;

    const title = createElement('a', {
      classes: `${blockName}-title`,
      props: { href: linkUrl },
    });
    title.innerText = e.title;

    const truck = createElement('div', { classes: `${blockName}-truck` });
    const truckText = createElement('p', { classes: `${blockName}-truck-text` });
    truckText.innerText = e.truck;
    const truckIcon = createElement('img', {
      classes: 'truck-icon',
      props: { src: '/icons/Truck_Key_icon.svg', alt: 'truck icon' },
    });
    if (e.truck.length !== 0) truck.append(truckIcon, truckText);

    const link = createElement('a', {
      classes: `${blockName}-link`,
      props: { href: linkUrl },
    });
    link.innerText = readNowText;

    content.append(categoryLink, title);

    const subtitle = createElement('a', {
      classes: `${blockName}-subtitle`,
      props: { href: linkUrl },
    });
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
