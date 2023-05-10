import {
  getMetadata,
  decorateIcons,
  createOptimizedPicture,
} from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

async function buildArticleHero(container) {
  const title = getMetadata('og:title');
  const headPic = getMetadata('og:image');
  const headAlt = getMetadata('og:image:alt');
  
  const tags = getMetadata('article:tag');
  const category = getMetadata('category');

  const row = createElement('div', ['row', 'size-img']);
  const headImg = createOptimizedPicture(headPic, headAlt);
  
  const content = createElement('div', 'content');


  const titleH3 = createElement('h3', 'title-sentence');
  titleH3.innerHTML = title;
  content.append(titleH3);

  const tagSpan = createElement('span', 'tag');
  tagSpan.innerHTML = tags;
  content.append(tagSpan);
  const categorySpan = createElement('span', 'category');
  categorySpan.innerHTML = category;
  content.append(categorySpan);


  const details = createElement('div', 'details');
  content.append(details);

  // row
  row.append(headImg);
  row.append(content);
  const section = createElement('div', ['section', 'template', 'article-hero']);
  section.insertAdjacentElement('afterbegin', row);
  container.insertAdjacentElement('afterbegin', section);
}

export default async function decorate(doc) {
  console.warn(doc)

  const container = doc.querySelector('main');

  const defaultContent = container.querySelector('.default-content-wrapper')

  const parentSection = defaultContent.parentNode;
  parentSection.classList.add('default-content-container');
  
  const firstHeading = defaultContent.querySelector('h5')
  console.log(firstHeading)


  // buildArticleHero(container);


  //sidebar
  const classes = ['section', 'template', 'article-sidebar', 'loading'];
  const sidebarSection = createElement('div', classes, { id: 'sidebar' });


  //RSS
  const recentSidebar = createElement('div', 'recent');
  const recentHeading = createElement('h3');
  recentHeading.innerHTML = 'Recent articles';
  recentSidebar.append(recentHeading);

  // const shareList = createElement('div', 'recent-articles');
  // shareItems.forEach((share) => {
  //   const icon = createElement('span', ['icon', `icon-fa-${share[0]}`]);
  //   const shareItem = createElement('button', share[0], { title: share[1], type: 'button' });
  //   shareItem.addEventListener('click', () => {
  //     window.open(`${share[2]}${window.location.href}`, '_blank');
  //   });
  //   shareItem.append(icon);
  //   shareList.append(shareItem);
  // });

  // recentSidebar.append(shareList);
  sidebarSection.append(recentSidebar);


  //RSS
  const shareItems = [
    ['twitter', 'Tweet', 'https://twitter.com/intent/tweet?url='],
    ['facebook', 'Like', 'https://www.facebook.com/sharer/sharer.php?u='],
  ];
  const shareSection = createElement('div', 'share');
  const shareHeading = createElement('p');
  shareHeading.innerHTML = 'Share this article';
  shareSection.append(shareHeading);
  const shareList = createElement('div', 'share-icons');
  shareItems.forEach((share) => {
    const icon = createElement('span', ['icon', `icon-fa-${share[0]}`]);
    const shareItem = createElement('button', share[0], { title: share[1], type: 'button' });
    shareItem.addEventListener('click', () => {
      window.open(`${share[2]}${window.location.href}`, '_blank');
    });
    shareItem.append(icon);
    shareList.append(shareItem);
  });
  shareSection.append(shareList);


  // sidebarSection.append(shareSection);





  // topics
  // const topicsSidebar = createElement('div', 'topics');
  // sidebarSection.append(topicsSidebar);
  // const topicsHeading = createElement('p');
  // topicsHeading.innerHTML = 'Topics in this article';
  // topicsSidebar.append(topicsHeading);
  // const topics = getMetadata('article:tag').split(',');
  // const topicsList = createElement('ul', 'topic-list');
  // topics.forEach((topic) => {
  //   const topicItem = createElement('li');
  //   topicItem.innerHTML = topic;
  //   topicsList.appendChild(topicItem);
  // });
  // topicsSidebar.append(topicsList);

  // share
  // const shareItems = [
  //   ['envelope', 'Share via email', 'mailto:?body='],
  //   ['twitter', 'Share on Twitter', 'https://twitter.com/intent/tweet?url='],
  //   ['linkedin', 'Share on LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url='],
  //   ['facebook', 'Share on Facebook', 'https://www.facebook.com/sharer/sharer.php?u='],
  // ];
  // const shareSection = createElement('div', 'share');
  // const shareHeading = createElement('p');
  // shareHeading.innerHTML = 'Share this article';
  // shareSection.append(shareHeading);
  // const shareList = createElement('div', 'share-icons');
  // shareItems.forEach((share) => {
  //   const icon = createElement('span', ['icon', `icon-fa-${share[0]}`]);
  //   const shareItem = createElement('button', share[0], { title: share[1], type: 'button' });
  //   shareItem.addEventListener('click', () => {
  //     window.open(`${share[2]}${window.location.href}`, '_blank');
  //   });
  //   shareItem.append(icon);
  //   shareList.append(shareItem);
  // });
  // shareSection.append(shareList);
  // sidebarSection.append(shareSection);

  // subscribe
  // const subscribeSidebar = createElement('div', 'subscribe');
  // const button = createElement('a', 'cta');
  // button.href = '#eloquaForm';
  // button.innerText = 'Subscribe';
  // const arrowIcon = createElement('span', ['icon', 'icon-fa-angle-right']);
  // button.append(arrowIcon);
  // subscribeSidebar.append(button);
  // sidebarSection.append(subscribeSidebar);

  let sidebarPreviousSection;
  let sectionFound = false;
  const sections = [...doc.querySelectorAll('.section')];
  while (!sectionFound && sections.length > 0) {
    const section = sections.pop();
    if (!sidebarPreviousSection) {
      sidebarPreviousSection = section;
    } else if (section.classList.contains('related-articles-container')) {
      sidebarPreviousSection = section;
    } else {
      sectionFound = true;
    }
  }
  sidebarPreviousSection.insertAdjacentElement('beforebegin', sidebarSection);



  // decorateIcons(doc);
  // show hidden sidebar until all sections are loaded to improve CLS
  const sectionObserver = new MutationObserver(() => {
    const pendingSection = doc.querySelector('main > .section[data-section-status="initialized"],main > .section[data-section-status="loading"]');
    if (!pendingSection) {
      sidebarSection.classList.remove('loading');
      sectionObserver.disconnect();
    }
  });
  doc.querySelectorAll('main > .section[data-section-status]').forEach((section) => {
    sectionObserver.observe(section, { attributeFilter: ['data-section-status'] });
  });


  var clone = shareSection.cloneNode(true);
  
  defaultContent.insertAdjacentElement('beforebegin', shareSection);
  defaultContent.insertAdjacentElement('afterend', clone);
  
  parentSection.insertAdjacentElement('afterbegin', firstHeading);
  // defaultContent.prepend(firstHeading)

  buildArticleHero(container);

}
