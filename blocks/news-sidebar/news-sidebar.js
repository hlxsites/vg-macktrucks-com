import { getMetadata } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

// TODO: make index configurable in block

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
  const isSidebar = !block.classList.contains('large');

  const newsPages = await getNews('mack-news');
  // TODO: what does this do? getMetadata('title') is always undefined. maybe use path instead?
  const newsPage = newsPages.filter((page) => page.title.toLowerCase() !== getMetadata('title')
    ?.toLowerCase());

  block.textContent = '';

  // creating RSS link
  const rssLink = createElement('a', ['news-sidebar-rss-icon'], { href: '/mack-news/rss/' });
  rssLink.textContent = 'News RSS';
  block.append(rssLink);

  const list = createElement('ul', ['news-sidebar-list']);

  // creating the year link
  const currentLink = newsPage && newsPage.find((item) => item.path === window.location.pathname);
  const newsYear = (new Date(currentLink?.date)).getFullYear();
  if (!Number.isNaN(Number(newsYear)) && newsYear < 2200) {
    const yearLink = createElement('a', [], { href: `/mack-news/${newsYear}` });
    yearLink.textContent = newsYear;
    list.append(yearLink);
  }

  if (newsPage) {
    newsPage.forEach((newsData) => {
      const li = createElement('li');
      const newsItem = createElement('a', [], { href: newsData.path });
      if (window.location.pathname === newsData.path) {
        newsItem.classList.add('new-sidebar-active-link');
      }
      newsItem.textContent = (newsData.heading && newsData.heading !== '0') ? newsData.heading : '';
      li.append(newsItem);
      list.append(li);
    });
    block.append(list);
  }

  if (isSidebar) {
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
      option.textContent = item.heading;
      select.append(option);
    });
    const selectEl = div.firstElementChild;
    block.append(selectEl);
    select.addEventListener('change', (event) => {
      const selectedNews = newsPage.find((item) => item.path === event.target.value);
      block.querySelector('.news-sidebar-select-text').textContent = selectedNews?.heading;
      window.location = event.target.value;
    });
  }
}
