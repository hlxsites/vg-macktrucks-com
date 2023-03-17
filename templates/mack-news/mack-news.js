import {
  getMetadata,
  decorateIcons,
  buildBlock,
  decorateBlock,
} from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

async function buildNewsData(h1) {
  const pubdate = getMetadata('date');

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

  const mackNewsContent = doc.querySelector('main .section:not(.related-content-container, .news-cards-container)');
  mackNewsContent.classList.add('mack-news-content');

  // finding picture wrappers
  [...mackNewsContent.querySelectorAll('picture')].forEach(pic => {
    const parent = pic.parentElement;
    const isParentPicturesWrapper = [...parent.children].every(el => el.tagName.toLowerCase() === 'picture');

    if (isParentPicturesWrapper) {
      parent.classList.add('mack-news-picture-wrapper');
    }
  });

  const newsSidebar = buildBlock('news-sidebar', '');
  sidebarContainer.append(newsSidebar);
  mackNewsContent.insertAdjacentElement('beforebegin', sidebarSection);
  decorateBlock(newsSidebar);
}
