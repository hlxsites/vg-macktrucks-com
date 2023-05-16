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

  const section = createElement('div', ['section', 'template', 'article-template', 'article-hero']);

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
  container.insertAdjacentElement('afterbegin', section);
}
async function buildBreadcrumb(container) {
  const breadcrumb = container.querySelector('.breadcrumb-wrapper');
  container.insertAdjacentElement('afterbegin', breadcrumb);
}

export default async function decorate(doc) {
  const container = doc.querySelector('main');
  buildArticleHero(container);
  buildBreadcrumb(container);

  const authorName = getMetadata('author');
  const author = createElement('p', 'author-text');
  author.innerText = authorName;

  const defaultContent = container.querySelector('.default-content-wrapper');
  const parentSection = defaultContent.parentNode;
  parentSection.classList.add('default-content-container');

  const firstHeading = defaultContent.querySelector('h5');

  // TODO check if this is the right implementation
  const shareSection = createElement('div', 'share');
  const testShare = createElement('span');
  testShare.innerHTML = `
    <div class="addthis_toolbox addthis_default_style ">
      <a class="addthis_button_facebook_like at300b" fb:like:layout="button_count">
        <div 
        class="fb-like 
        fb_iframe_widget" 
        data-layout="button_count" 
        data-show_faces="false" 
        data-share="false" 
        data-action="like" 
        data-width="90" 
        data-height="25" 
        data-font="arial" 
        data-href="https://www.macktrucks.com/magazine/articles/2023/march/mack-trucks-unveils-the-md-electric-medium-duty-truck/" 
        data-send="false" 
        style="height: 25px;" 
        fb-xfbml-state="rendered" 
        fb-iframe-plugin-query="action=like&amp;app_id=172525162793917&amp;container_width=0&amp;font=arial&amp;height=25&amp;href=https%3A%2F%2Fwww.macktrucks.com%2Fmagazine%2Farticles%2F2023%2Fmarch%2Fmack-trucks-unveils-the-md-electric-medium-duty-truck%2F&amp;layout=button_count&amp;locale=en_US&amp;sdk=joey&amp;send=false&amp;share=false&amp;show_faces=false&amp;width=90">
          <span style="vertical-align: bottom; width: 90px; height: 28px;">
            <iframe 
            name="f1bfe444a631b3" 
            width="90px" 
            height="25px" 
            data-testid="fb:like Facebook Social Plugin" 
            title="fb:like Facebook Social Plugin" 
            frameborder="0" 
            allowtransparency="true" 
            allowfullscreen="true" 
            scrolling="no" 
            allow="encrypted-media" 
            src="https://www.facebook.com/v2.6/plugins/like.php?action=like&amp;app_id=172525162793917&amp;channel=https%3A%2F%2Fstaticxx.facebook.com%2Fx%2Fconnect%2Fxd_arbiter%2F%3Fversion%3D46%23cb%3Df32b3b88d544a1c%26domain%3Dwww.macktrucks.com%26is_canvas%3Dfalse%26origin%3Dhttps%253A%252F%252Fwww.macktrucks.com%252Ff3865e9b8454658%26relation%3Dparent.parent&amp;container_width=0&amp;font=arial&amp;height=25&amp;href=https%3A%2F%2Fwww.macktrucks.com%2Fmagazine%2Farticles%2F2023%2Fmarch%2Fmack-trucks-unveils-the-md-electric-medium-duty-truck%2F&amp;layout=button_count&amp;locale=en_US&amp;sdk=joey&amp;send=false&amp;share=false&amp;show_faces=false&amp;width=90" 
            style="border: none; visibility: visible; width: 90px; height: 28px;" 
            class="">
            </iframe>
          </span>
        </div>
      </a>
      <a class="addthis_button_tweet at300b">
        <div class="tweet_iframe_widget" style="width: 62px; height: 25px;">
          <span>
            <iframe 
              id="twitter-widget-0" 
              scrolling="no" 
              frameborder="0" 
              allowtransparency="true" 
              allowfullscreen="true" 
              class="twitter-share-button 
              twitter-share-button-rendered 
              twitter-tweet-button" 
              style="position: static; visibility: visible; width: 73px; height: 20px;"
              title="Twitter Tweet Button" 
              src="https://platform.twitter.com/widgets/tweet_button.2b2d73daf636805223fb11d48f3e94f7.en.html#dnt=false&amp;id=twitter-widget-0&amp;lang=en&amp;original_referer=https%3A%2F%2Fwww.macktrucks.com%2Fmagazine%2Farticles%2F2023%2Fmarch%2Fmack-trucks-unveils-the-md-electric-medium-duty-truck%2F&amp;size=m&amp;text=Mack%20Trucks%20unveils%20the%20MD%20Electric%20medium-duty%20truck%20&amp;time=1684160607514&amp;type=share&amp;url=https%3A%2F%2Fwww.macktrucks.com%2Fmagazine%2Farticles%2F2023%2Fmarch%2Fmack-trucks-unveils-the-md-electric-medium-duty-truck%2F%23.ZGJAXkni3EE.twitter" data-url="https://www.macktrucks.com/magazine/articles/2023/march/mack-trucks-unveils-the-md-electric-medium-duty-truck/#.ZGJAXkni3EE.twitter">
            </iframe>
          </span>
        </div>
      </a>
      <a class="addthis_counter addthis_pill_style addthis_nonzero" href="#" style="display: inline-block;">
        <a class="atc_s addthis_button_compact">Share<span></span>
        </a>
          <a class="addthis_button_expanded" target="_blank" title="More" href="#">
            2
          </a>
        </a>
      <div class="atclear"></div>
    </div>
    <script type="text/javascript" src="https://s7.addthis.com/js/250/addthis_widget.js"></script>`;
  shareSection.append(testShare);

  const clone = shareSection.cloneNode(true);

  defaultContent.insertAdjacentElement('beforebegin', author);
  defaultContent.insertAdjacentElement('beforebegin', shareSection);
  defaultContent.insertAdjacentElement('afterend', clone);

  parentSection.insertAdjacentElement('afterbegin', firstHeading);
}
