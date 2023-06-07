import { createElement } from '../../scripts/scripts.js';
import {
  feedsInfo,
  getBodyBuilderNews, getMackNews, PagingInfo,
} from '../../scripts/news.js';

export default async function decorate(block) {
  const type = window.location.pathname.startsWith('/parts-and-services/support/body-builders')
    ? 'body-builder-news'
    : 'mack-news';

  const pagingInfo = new PagingInfo();
  const newsPage = type === 'body-builder-news'
    ? await getBodyBuilderNews(pagingInfo)
    : await getMackNews(window.location.pathname, pagingInfo, '');

  block.textContent = '';
  const list = createElement('ul', ['news-sidebar-list']);
  block.append(list);

  const rssLink = createElement('a', ['news-sidebar-rss-icon'], { href: feedsInfo[type].feedPath });
  rssLink.textContent = 'News RSS';

  list.appendChild(rssLink);
  list.appendChild(getParentCategoryLink(window.location.pathname));

  newsPage.forEach((newsData) => {
    const li = createElement('li');

    const newsItem = createElement('a', [], { href: newsData.path });
    if (window.location.pathname === newsData.path) {
      newsItem.classList.add('new-sidebar-active-link');
    }
    newsItem.textContent = (newsData.title && newsData.title !== '0') ? newsData.title.split('|')[0] : '';

    li.append(newsItem);
    list.append(li);
  });

  // creating select - for mobile only
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="news-sidebar-select">
      <div class="news-sidebar-select-label">
        <div class="news-sidebar-select-text">Choose...</div>
        <div class="news-sidebar-select-icon">
          <span>▲</span>
        </div>
      </div>
      <select>
        <option>Choose...</option>
      </select>
    </div>
  `;

  const select = div.querySelector('select');
  newsPage.forEach((item) => {
    const option = createElement('option', [], { value: item.path });
    // eslint-disable-next-line prefer-destructuring
    option.textContent = item.title.split('|')[0];
    select.append(option);
  });
  const selectEl = div.firstElementChild;
  block.append(selectEl);
  select.addEventListener('change', (event) => {
    const selectedNews = newsPage.find((item) => item.path === event.target.value);
    block.querySelector('.news-sidebar-select-text').textContent = selectedNews?.title.split('|')[0];
    window.location = event.target.value;
  });
}

function getParentCategoryLink(pagePath) {
  const parentFolders = pagePath.split('/').filter((item) => item !== '');
  parentFolders.pop();
  // either a category like 'news and events' or a year like 2023
  let parentFolderName = parentFolders.at(-1);

  // format the parent folder name to be more readable
  parentFolderName = parentFolderName.replaceAll('-', ' ');

  const category = createElement('a', [], { href: `/${parentFolders.join('/')}/` });
  category.textContent = parentFolderName;
  return category;
}
