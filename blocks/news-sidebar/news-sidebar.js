import { getMetadata } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

/**
 * loads more data from the query index
 * */
async function loadMoreNews() {
  if (!window.mack.newsData.allLoaded) {
    const queryLimit = 200;
    const resp = await fetch(`/mack-news.json?limit=${queryLimit}&offset=${window.mack.newsData.offset}`);
    const json = await resp.json();
    const {
      total,
      data,
    } = json;
    window.mack.newsData.news.push(...data);
    window.mack.newsData.allLoaded = total <= (window.mack.newsData.offset + queryLimit);
    window.mack.newsData.offset += queryLimit;
  }
}

/**
 * @param {boolean} more indicates to force loading additional data from query index
 * @returns the currently loaded listed of posts from the query index pages
 */
export async function loadNews(more) {
  if (window.mack.newsData.news.length === 0 || more) {
    await loadMoreNews();
  }
  return window.mack.newsData.news;
}

/**
 * A function for sorting an array of posts by date
 */
function sortNewsByDate(newsA, newsB) {
  const aDate = Number(newsA.date || newsA.lastModified);
  const bDate = Number(newsB.date || newsB.lastModified);
  return bDate - aDate;
}

/**
 * Get the list of news from the query index. News are auto-filtered based on page context
 * e.g tags, etc. and sorted by date
 *
 * @param {string} filter the name of the filter to apply
 * one of: topic, subtopic, author, tag, post, auto, none
 * @param {number} limit the number of posts to return, or -1 for no limit
 * @returns the posts as an array
 */
export async function getNews(filter, limit) {
  const pages = await loadNews();
  // filter out anything that isn't a mack news (eg. must have an author)
  let finalNews;
  const allNews = pages.filter((page) => page.template === 'mack-news');
  const template = getMetadata('template');
  let applicableFilter = filter ? filter.toLowerCase() : 'none';
  if (applicableFilter === 'auto') {
    if (template === 'mack-news') {
      applicableFilter = 'mack-news';
    } else {
      applicableFilter = 'none';
    }
  }

  if (applicableFilter === 'mack-news') {
    finalNews = allNews
      .sort(sortNewsByDate);
  }
  return limit < 0 ? finalNews : finalNews.slice(0, limit);
}

export default async function decorate(block) {
  const navPages = await getNews('mack-news');
  const newsPage = navPages.filter((page) => page.title.toLowerCase() !== getMetadata('title')
    ?.toLowerCase());
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

  block.querySelector('select')
    .addEventListener('change', (event) => {
      const selectedNews = newsPage.find((item) => item.path === event.target.value);

      block.querySelector('.news-sidebar-select-text').textContent = selectedNews?.heading;
      window.location = event.target.value;
    });
}
