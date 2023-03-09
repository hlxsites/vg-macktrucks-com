import {
  getMetadata,
  createOptimizedPicture,
  decorateIcons,
} from '../../scripts/lib-franklin.js';
import {
  createElement,
  getNews,
} from '../../scripts/scripts.js';

const tags = getMetadata('article:tag').split(', ');

function buildRelatedNews(sidebar) {
  if (getMetadata('title') !== '') {
    const tagsContainer = createElement('div', 'tags-container');
    const list = createElement('ul', 'tags-list');
    tagsContainer.append(list);
    tags.forEach((tag) => {
      const item = createElement('li');
      const link = createElement('a');
      link.innerHTML = `<span class="tag-name">#${tag}</span>`;
      link.href = `/mack-news/${encodeURIComponent(tag)}`;
      item.append(link);
      list.append(item);
    });
    sidebar.append(tagsContainer);
  }
}

export default async function decorate(block) {
  let authorImage;
  let authorName;
  let authorTitle;
  let authorUrl;
  const navPages = await getNews('mack-news');

  const authorPage = navPages.find((page) => page.title.toLowerCase() === getMetadata('title')?.toLowerCase());
  if (authorPage) {
    authorImage = authorPage.image;
    authorName = authorPage.title;
    authorTitle = (authorPage.authortitle !== '' && authorPage.authortitle !== '0') ? authorPage.authortitle : 'Contributor';
    authorUrl = authorPage.path;
  } else {
    authorImage = '/default-meta-image';
    authorName = getMetadata('heading');
    authorTitle = 'Contributor';
    authorUrl = '#';
  }

  let picHtml = '<span class="icon icon-user"></span>';
  if (!authorImage.includes('/default-meta-image')) {
    const picMedia = [{ media: '(min-width: 160px)', width: '160' }];
    const pic = createOptimizedPicture(authorImage, '', false, picMedia);
    picHtml = pic.outerHTML;
  }

  block.innerHTML = `<a class="author-image" href="${authorUrl}">${picHtml}</a>
      <div class="author-details">
        <h3 class="author-name"><a href="${authorUrl}">${authorName}</a></h3>
        <h4 class="author-title">${authorTitle}</h4>
      </div>`;
  buildRelatedNews(block);
  decorateIcons(block);
}
