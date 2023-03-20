import {
  getMetadata,
} from '../../scripts/lib-franklin.js';
import {
  getNews, createElement,
} from '../../scripts/scripts.js';

export default async function decorate(block) {
  const navPages = await getNews('mack-news');
  const newsPage = navPages.filter((page) => page.title.toLowerCase() !== getMetadata('title')?.toLowerCase());
  const newsContainer = createElement('div');
  const list = createElement('ul');

  newsContainer.classList.add('news-sidebar-container');
  list.classList.add('news-sidebar-list');

  // creating RSS link
  const rssLink = document.createElement('a');
  rssLink.setAttribute('href', '/mack-news/rss/');
  rssLink.textContent = 'News RSS';
  rssLink.classList.add('news-sidebar-rss-icon');
  list.appendChild(rssLink);

  // creating the year link
  const yearLink = document.createElement('a');
  const currentLink = newsPage && newsPage.find((item) => item.path === window.location.pathname);
  const newsYear = (new Date(currentLink?.date)).getFullYear();

  if (!Number.isNaN(Number(newsYear))) {
    yearLink.setAttribute('href', `/mack-news/${newsYear}`);
    yearLink.textContent = newsYear;
    list.appendChild(yearLink);
  }

  if (newsPage) {
    newsPage.forEach((newsData) => {
      const li = createElement('li');
      const newsItem = document.createElement('a');

      if (window.location.pathname === newsData.path) {
        newsItem.classList.add('new-sidebar-active-link');
      }

      newsItem.href = newsData.path;
      newsItem.textContent = (newsData.heading && newsData.heading !== '0') ? newsData.heading : '';
      li.append(newsItem);
      list.append(li);
    });
    newsContainer.append(list);
  }

  // creating select - for mobile only
  const selectTemplate = `
    <div class="news-sidebar-select">
      <div class="news-sidebar-select-label">
        <div class="news-sidebar-select-text">Choose...</div>
        <div class="news-sidebar-select-icon">
          <span>▲</span>
        </div>
      </div>
      <select>
        <option>Choose...</option>
        ${(newsPage.map((item) => `<option value="${item.path}">${item.heading}</option>`)).join('')}
      </select>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = selectTemplate;
  const selectEl = div.firstElementChild;
  newsContainer.append(selectEl);

  block.innerHTML = newsContainer.innerHTML;

  block.querySelector('select').addEventListener('change', (event) => {
    const selectedNews = newsPage.find((item) => item.path === event.target.value);

    block.querySelector('.news-sidebar-select-text').textContent = selectedNews?.heading;
    window.location = event.target.value;
  });
}
