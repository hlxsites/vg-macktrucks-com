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
  articleHeroImage.append(headImg);

  const articleHeroContent = createElement('div', 'article-hero-content');

  const categorySpan = createElement('a', 'article-hero-category');
  categorySpan.innerText = category;
  articleHeroContent.append(categorySpan);

  const titleH4 = createElement('h4', 'article-hero-title');
  titleH4.innerText = title;
  articleHeroContent.append(titleH4);

  const truck = createElement('div', 'article-hero-truck');
  const truckText = createElement('p', 'truck-text');
  truckText.innerText = truckModel;
  const truckIcon = createElement('img', 'truck-icon');
  truckIcon.src = '/icons/Truck_Key_icon.svg';
  truckIcon.alt = 'truck icon';

  truck.append(truckIcon, truckText);
  articleHeroContent.append(truck);
  section.append(articleHeroImage, articleHeroContent);

  return section;
}

async function buildBreadcrumb(container) {
  const breadcrumb = container.querySelector('.breadcrumb-container .breadcrumb-wrapper');
  const breadcrumbContainer = createElement('div', ['section', 'template', 'article-template', 'breadcrumb-container']);
  breadcrumbContainer.append(breadcrumb);

  return breadcrumbContainer;
}

async function buildRecommendations(container) {
  const recommendations = container.querySelector('.recommendations-container .recommendations-wrapper');
  const recommendationsContainer = createElement('div', 'recommendations-container');
  recommendationsContainer.append(recommendations);

  return recommendationsContainer;
}

async function buildRecentArticles(container) {
  const recentArticles = container.querySelector('.recent-articles-container .recent-articles-wrapper');
  const recentArticlesContainer = createElement('div', 'recent-articles-container');
  recentArticlesContainer.append(recentArticles);

  return recentArticlesContainer;
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
    shareSection,
    recentSection,
    recommendationsSection,
  ] = await Promise.all([
    buildBreadcrumb(container),
    buildArticleHero(),
    buildShareSection(),
    buildRecentArticles(container),
    buildRecommendations(container),
  ]);

  const shareClone = shareSection.cloneNode(true);

  const authorName = getMetadata('author');
  const author = createElement('p', 'author-text');
  author.innerText = authorName;

  const defaultContent = container.querySelector('.default-content-wrapper');

  const parentSection = defaultContent.parentNode;
  parentSection.classList.add('default-content-container');
  parentSection.classList.remove('breadcrumb-container', 'recent-articles-container');

  const altSubtitle = createElement('h5', 'default-content-subtitle');
  altSubtitle.innerText = getMetadata('og:title');

  const firstHeading = defaultContent.querySelector('h5') ?? altSubtitle;
  firstHeading?.classList.add('default-content-subtitle');

  parentSection.insertAdjacentElement('afterbegin', firstHeading);

  defaultContent.insertAdjacentElement('beforebegin', shareSection);
  defaultContent.insertAdjacentElement('afterend', shareClone);

  currentArticle.append(firstHeading, author, shareSection, defaultContent, shareClone);
  articleTexts.append(currentArticle, recommendationsSection, recentSection);
  article.append(breadSection, heroSection, articleTexts);

  container.innerText = '';
  container.append(article);
}
