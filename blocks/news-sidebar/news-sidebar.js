import { getMetadata } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';
import { getNews } from '../../scripts/news.js';

export default async function decorate(block) {
  const navPages = await getNews('mack-news', window.location.pathname);
  const newsPage = navPages.filter((page) => page.title.toLowerCase() !== getMetadata('title')
    ?.toLowerCase());

  block.textContent = '';

  const list = createElement('ul', ['news-sidebar-list']);

  // creating RSS link
  const rssLink = document.createElement('a');
  rssLink.setAttribute('href', '/mack-news/rss/');
  rssLink.textContent = 'News RSS';
  rssLink.classList.add('news-sidebar-rss-icon');
  list.appendChild(rssLink);

  // creating the year link
  const yearLink = document.createElement('a');
  const currentLink = newsPage && newsPage.find((item) => item.path === window.location.pathname);
  const newsYear = new Date(currentLink.publicationDate * 1000).getFullYear();

  if (!Number.isNaN(Number(newsYear))) {
    yearLink.setAttribute('href', `/mack-news/${newsYear}/`);
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
      newsItem.textContent = (newsData.title && newsData.title !== '0') ? newsData.title.split('|')[0] : '';
      li.append(newsItem);
      list.append(li);
    });
    block.append(list);
  }

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
    const optionText = item.title.split('|')[0];
    option.textContent = optionText;
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
