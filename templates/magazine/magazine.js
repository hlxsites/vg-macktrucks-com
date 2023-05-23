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

  const section = createElement('div', ['section', 'template', 'article-template', 'article-hero', 'hero']);

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

  truck.append(truckIcon);
  truck.append(truckText);

  articleHeroContent.append(truck);

  section.append(articleHeroImage);
  section.append(articleHeroContent);

  return section
  // container.insertAdjacentElement('afterbegin', section);
}

async function buildBreadcrumb(container) {
  const breadcrumb = container.querySelector('.breadcrumb-container .breadcrumb-wrapper');
  const breadcrumbContainer = createElement('div', ['section', 'breadcrumb-container', 'breadcrumb']);
  breadcrumbContainer.append(breadcrumb)

  return breadcrumbContainer
  // container.insertAdjacentElement('afterbegin', breadcrumbContainer);
}

async function buildRecommendations(container) {

  const recommendations = container.querySelector('.recommendations-container .recommendations-wrapper');
  const recommendationsContainer = createElement('div', ['section', 'recommendations-container', 'recent']);

  recommendationsContainer.append(recommendations)

  return recommendationsContainer
  // container.insertAdjacentElement('beforeend', recentArticlesContainer);
}

async function buildRecentArticles(container) {

  const recentArticles = container.querySelector('.recent-articles-container .recent-articles-wrapper');
  const recentArticlesContainer = createElement('div', ['section', 'recent-articles-container', 'recent']);

  recentArticlesContainer.append(recentArticles)

  return recentArticlesContainer
  // container.insertAdjacentElement('beforeend', recentArticlesContainer);
}

async function buildShareSection() {
  const shareSection = createElement('div', 'share-wrapper');



  const shareItems = [
    ['envelope', 'Share via email', 'mailto:?body=', 'Email'],
    ['twitter', 'Share on Twitter', 'https://twitter.com/intent/tweet?url=', 'Tweet'],
    ['facebook', 'Share on Facebook', 'https://www.facebook.com/sharer/sharer.php?u=', 'Like'],
  ];
  const shareSidebar = createElement('div', 'share');
  // const shareHeading = createElement('p');
  // shareHeading.innerText = 'Share this article';
  // shareSidebar.append(shareHeading);
  const shareList = createElement('div', 'share-icons');
  shareItems.forEach((share) => {
    const icon = createElement('span', ['icon', `icon-fa-${share[0]}`]);
    const shareItem = createElement('button', share[0], { title: share[1], type: 'button' });
    shareItem.addEventListener('click', () => {
      window.open(`${share[2]}${window.location.href}`, '_blank');
    });
    shareItem.innerText = share[3];
    shareItem.append(icon);
    shareList.append(shareItem);
  });
  shareSidebar.append(shareList);
  shareSection.append(shareSidebar);

  return shareSection

}

export default async function decorate(doc) {
  const container = doc.querySelector('main');

  const article = createElement('div', 'article-content');
  
  const breadSection = await buildBreadcrumb(container);
  const heroSection = await buildArticleHero();
  const shareSection = await buildShareSection()
  const recentSection = await buildRecentArticles(container);
  const recommendationsSection = await buildRecommendations(container);
  
  const authorName = getMetadata('author');
  const author = createElement('p', 'author-text');
  author.innerText = authorName;
  
  const defaultContent = container.querySelector('.default-content-wrapper');
  defaultContent.classList.add('default');

  const parentSection = defaultContent.parentNode;
  parentSection.classList.add('default-content-container');
  parentSection.classList.remove('breadcrumb-container')
  parentSection.classList.remove('recent-articles-container')
  
  const firstHeading = defaultContent.querySelector('h5');
  firstHeading.classList.add('default-content-subtitle')
  
  // defaultContent.insertAdjacentElement('beforebegin', author);
  
  // TODO share section
  const shareClone = await shareSection.cloneNode(true);


  defaultContent.insertAdjacentElement('beforebegin', shareSection);
  defaultContent.insertAdjacentElement('afterend', shareClone);
  
  parentSection.insertAdjacentElement('afterbegin', firstHeading);
  const articleTexts = createElement('div', 'article-texts');

  const currentArticle = createElement('div', 'current-article');


  console.log(shareSection)
  console.log(shareClone)
  
  currentArticle.append(firstHeading)
  currentArticle.append(authorName)
  currentArticle.append(shareSection)
  currentArticle.append(defaultContent)
  currentArticle.append(shareClone)

  articleTexts.append(currentArticle)
  articleTexts.append(recommendationsSection)
  articleTexts.append(recentSection)
  
  article.append(breadSection);
  article.append(heroSection);
  article.append(articleTexts);

  container.innerText = ''
  container.append(article)
}
