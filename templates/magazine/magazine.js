import {
  getMetadata,
  createOptimizedPicture,
} from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

async function buildArticleHero(container) {
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

async function buildRecentArticles(container) {

  const recentArticles = container.querySelector('.recent-articles-container .recent-articles-wrapper');
  const recentArticlesContainer = createElement('div', ['section', 'recent-articles-container', 'recent']);

  recentArticlesContainer.append(recentArticles)

  return recentArticlesContainer
  // container.insertAdjacentElement('beforeend', recentArticlesContainer);
}

async function buildShareSection() {
  const section = createElement('div', 'share-wrapper');

  // const HTMLContent = createElement('div', ['addthis_toolbox', 'addthis_default_style'])
  // HTMLContent.innerHTML = `
  // <a class="addthis_button_facebook_like at300b" fb:like:layout="button_count"><div class="fb-like fb_iframe_widget fb_iframe_widget_fluid" data-layout="button_count" data-show_faces="false" data-share="false" data-action="like" data-width="90" data-height="25" data-font="arial" data-href="https://www.macktrucks.com/magazine/articles/2022/august/bulldog-bits-gold-rush/" data-send="false" style="height: 25px;" fb-xfbml-state="rendered" fb-iframe-plugin-query="action=like&;app_id=172525162793917&;container_width=0&;font=arial&;height=25&;href=https%3A%2F%2Fwww.macktrucks.com%2Fmagazine%2Farticles%2F2022%2Faugust%2Fbulldog-bits-gold-rush%2F&;layout=button_count&;locale=en_US&;sdk=joey&;send=false&;share=false&;show_faces=false&;width=90"><span style="vertical-align: bottom; width: 90px; height: 28px;"><iframe name="f367715f563fa9c" width="90px" height="25px" data-testid="fb:like Facebook Social Plugin" title="fb:like Facebook Social Plugin" frameborder="0" allowtransparency="true" allowfullscreen="true" scrolling="no" allow="encrypted-media" src="https://www.facebook.com/v2.6/plugins/like.php?action=like&;app_id=172525162793917&;channel=https%3A%2F%2Fstaticxx.facebook.com%2Fx%2Fconnect%2Fxd_arbiter%2F%3Fversion%3D46%23cb%3Df3ae931bee7f3c4%26domain%3Dwww.macktrucks.com%26is_canvas%3Dfalse%26origin%3Dhttps%253A%252F%252Fwww.macktrucks.com%252Ff38ce6dc4cbd664%26relation%3Dparent.parent&;container_width=0&;font=arial&;height=25&;href=https%3A%2F%2Fwww.macktrucks.com%2Fmagazine%2Farticles%2F2022%2Faugust%2Fbulldog-bits-gold-rush%2F&;layout=button_count&;locale=en_US&;sdk=joey&;send=false&;share=false&;show_faces=false&;width=90" style="border: none; visibility: visible; width: 90px; height: 28px;" class=""></iframe></span></div></a>
  // <a class="addthis_button_tweet at300b"><div class="tweet_iframe_widget" style="width: 62px; height: 25px;"><span><iframe id="twitter-widget-1" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" class="twitter-share-button twitter-share-button-rendered twitter-tweet-button" style="position: static; visibility: visible; width: 73px; height: 20px;" title="Twitter Tweet Button" src="https://platform.twitter.com/widgets/tweet_button.2b2d73daf636805223fb11d48f3e94f7.en.html#dnt=false&;id=twitter-widget-1&;lang=en&;original_referer=https%3A%2F%2Fwww.macktrucks.com%2Fmagazine%2Farticles%2F2022%2Faugust%2Fbulldog-bits-gold-rush%2F&;size=m&;text=Gold%20Rush%20%7C%20Mack%20Trucks%3A&;time=1684406054467&;type=share&;url=https%3A%2F%2Fwww.macktrucks.com%2Fmagazine%2Farticles%2F2022%2Faugust%2Fbulldog-bits-gold-rush%2F%23.ZGX_JJetS-U.twitter" data-url="https://www.macktrucks.com/magazine/articles/2022/august/bulldog-bits-gold-rush/#.ZGX_JJetS-U.twitter"></iframe></span></div></a>
  // <a class="addthis_counter addthis_pill_style" href="#" style="display: inline-block;"><a class="atc_s addthis_button_compact">Share<span></span></a><a class="addthis_button_expanded" target="_blank" title="More" href="#"></a></a>
  // <div class="atclear"></div>`;

  // const scriptTag = createElement('script')
  // scriptTag.src = 'https://s7.addthis.com/js/250/addthis_widget.js'

  // section.append(HTMLContent)
  // section.append(scriptTag)


  return section

}

export default async function decorate(doc) {
  const container = doc.querySelector('main');

  const article = createElement('div', 'article-content');
  
  const breadSection = await buildBreadcrumb(container);
  const heroSection = await buildArticleHero(container);
  const recentSection = await buildRecentArticles(container);
  
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
  // const shareSection = await buildShareSection()
  // const shareClone = await shareSection.cloneNode(true);
  // defaultContent.insertAdjacentElement('beforebegin', shareSection);
  // defaultContent.insertAdjacentElement('afterend', shareClone);
  
  parentSection.insertAdjacentElement('afterbegin', firstHeading);
  const articleTexts = createElement('div', 'article-texts');

  const presentArticle = createElement('div', 'present-article');
  presentArticle.append(firstHeading)
  presentArticle.append(authorName)
  presentArticle.append(defaultContent)

  articleTexts.append(presentArticle)
  articleTexts.append(recentSection)
  

  article.append(breadSection);
  article.append(heroSection);
  article.append(articleTexts);

  console.log(container)
  
  container.innerText = ''
  container.append(article)
  // container.insertAdjacentElement('afterbegin', article);
  
  
  console.log(container)


}
