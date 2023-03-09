import {
  getMetadata,
  decorateIcons,
  buildBlock,
  decorateBlock,
} from '../../scripts/lib-franklin.js';
import { createElement, getNews } from '../../scripts/scripts.js';

async function buildNewsData(h1) {
  const pages = await getNews();
  const topic = getMetadata('subtopic') !== '' ? getMetadata('subtopic') : getMetadata('topic');
  let topicPath = '#';
  pages.forEach((page) => {
    if (page.topic === topic || page.subtopic === topic) {
      topicPath = page.path;
    }
  });
  const pubdate = getMetadata('date');

  h1.insertAdjacentHTML('beforebegin', `<p class='news-category'><a href='${topicPath}'>${topic}</a></p>`);
  const stats = createElement('div', 'news-stats');
  const pubDateSpan = createElement('span', 'pubdate');
  pubDateSpan.innerHTML = pubdate;
  stats.append(pubDateSpan);

  h1.insertAdjacentElement('afterend', stats);
  decorateIcons(h1.parentElement);
}

export default async function decorate(doc) {
  const h1 = doc.querySelector('h1');
  buildNewsData(h1);

  const classes = ['section'];
  const sidebarSection = createElement('div', classes, {
    'data-section-status': 'initialized',
  });
  const sidebarContainer = createElement('div');
  sidebarSection.append(sidebarContainer);

  let sidebarPreviousSection;
  let sectionFound = false;
  const sections = [...doc.querySelectorAll('.section')];
  while (!sectionFound && sections.length > 0) {
    const section = sections.pop();
    if (!sidebarPreviousSection) {
      sidebarPreviousSection = section;
    } else if (section.classList.contains('related-content-container') || section.classList.contains('news-cards-container')) {
      sidebarPreviousSection = section;
    } else {
      sectionFound = true;
    }
  }
  const newsSidebar = buildBlock('news-sidebar', '');
  sidebarContainer.append(newsSidebar);
  sidebarPreviousSection.insertAdjacentElement('beforebegin', sidebarSection);
  decorateBlock(newsSidebar);
}
