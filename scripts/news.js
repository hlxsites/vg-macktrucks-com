import { getMetadata } from './lib-franklin.js';

/**
 * loads more data from the query index
 * */
async function loadMoreNews() {
  if (!window.mack.newsData.allLoaded) {
    const queryLimit = 200;
    const resp = await fetch(`/mack-news.json?limit=${queryLimit}&offset=${window.mack.newsData.offset}`);
    const json = await resp.json();
    const { total, data } = json;
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
