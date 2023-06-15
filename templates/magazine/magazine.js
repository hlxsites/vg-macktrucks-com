import {
  getMetadata,
  createOptimizedPicture,
} from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

async function buildArticleHero() {
  const title = getMetadata('og:title');
  const headPic = getMetadata('og:image');
  const headAlt = getMetadata('og:image:alt');

  const truckModel = getMetadata('truck');
  const category = getMetadata('category');

  const section = createElement('div', ['section', 'template', 'article-template', 'article-hero-container']);

  const headImg = createOptimizedPicture(headPic, headAlt);
  const articleHeroImage = createElement('div', 'article-hero-image');
  const articleHeroContent = createElement('div', 'article-hero-content');

  const categoryUrl = category.toLowerCase().replaceAll(' ', '-');
  const categorySpan = createElement('a', 'article-hero-category', { href: `/magazine/categories/${categoryUrl}` });
  categorySpan.innerText = category;

  const titleH4 = createElement('h4', 'article-hero-title');
  titleH4.innerText = title;

  const truck = createElement('div', 'article-hero-truck');
  const truckText = createElement('p', 'truck-text');
  truckText.innerText = truckModel;
  const truckIcon = createElement('img', 'truck-icon', { src: '/icons/Truck_Key_icon.svg', alt: 'truck icon' });

  articleHeroImage.append(headImg);
  truck.append(truckIcon, truckText);

  articleHeroContent.append(categorySpan, titleH4, truck);
  section.append(articleHeroImage, articleHeroContent);

  return section;
}

async function buildSection(container, sectionName = '') {
  const selectedContent = container.querySelector(`.${sectionName}-container .${sectionName}-wrapper`);
  const classes = sectionName === 'breadcrumbs' ? ['section', 'template', 'article-template', `${sectionName}-container`] : `${sectionName}-container`;
  const sectionContainer = createElement('div', classes);
  sectionContainer.append(selectedContent);

  return sectionContainer;
}

async function buildShareSection() {
  const shareSection = createElement('div', 'share-wrapper');
  const shareItems = [
    ['envelope', 'Share via email', 'mailto:?body=', 'Email', '#FD6D4B'],
    ['twitter', 'Share on Twitter', 'https://twitter.com/intent/tweet?url=', 'Tweet', '#1C9BEF'],
    ['facebook', 'Share on Facebook', 'https://www.facebook.com/sharer/sharer.php?u=', 'Like', '#1977F2'],
  ];
  const shareSidebar = createElement('div', 'share');
  const shareList = createElement('div', 'share-icons');
  shareItems.forEach((share) => {
    const icon = createElement('span', ['icon', `fa-${share[0]}`]);
    const shareItem = createElement('button', share[0], { title: share[1], type: 'button' });
    shareItem.addEventListener('click', () => {
      window.open(`${share[2]}${window.location.href}`, '_blank');
    });
    const [, , , label, color] = share;
    shareItem.innerText = label;
    shareItem.style.backgroundColor = color;

    shareItem.append(icon);
    shareList.append(shareItem);
  });
  shareSidebar.append(shareList);
  shareSection.append(shareSidebar);

  return shareSection;
}

export default async function decorate(doc) {
  const container = doc.querySelector('main');

  const article = createElement('div', 'article-content');
  const articleTexts = createElement('div', ['section', 'template', 'article-template', 'article-texts-container']);
  const currentArticle = createElement('div', 'current-article-container');

  const [
    breadSection,
    heroSection,
    shareSection1,
    shareSection2,
    recentSection,
    recommendationsSection,
  ] = await Promise.all([
    buildSection(container, 'breadcrumb'),
    buildArticleHero(),
    buildShareSection(),
    buildShareSection(),
    buildSection(container, 'recent-articles'),
    buildSection(container, 'recommendations'),
  ]);

  const authorName = getMetadata('author');
  const author = createElement('p', 'author-text');
  author.innerText = authorName;

  const defaultContent = container.querySelector('.default-content-wrapper');
  const subscribeContent = container.querySelector('.magazine-subscribe-wrapper');

  const parentSection = defaultContent.parentNode;
  parentSection.classList.add('default-content-container');
  parentSection.classList.remove('breadcrumb-container', 'recent-articles-container');

  const altSubtitle = createElement('h5', 'default-content-subtitle');
  altSubtitle.innerText = getMetadata('og:title');

  const firstHeading = defaultContent.querySelector('h5') ?? altSubtitle;
  firstHeading?.classList.add('default-content-subtitle');

  parentSection.insertAdjacentElement('afterbegin', firstHeading);

  currentArticle.append(firstHeading, author, shareSection1, defaultContent, shareSection2);
  articleTexts.append(currentArticle, recommendationsSection, recentSection);
  article.append(breadSection, heroSection, articleTexts, subscribeContent);

  container.innerText = '';
  container.append(article);
}
