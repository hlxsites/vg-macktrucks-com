import { getMetadata } from './lib-franklin.js';

/**
 * loads more data from the query index
 */
async function loadMoreNews() {
  if (!window.mack.newsData.allLoaded) {
    const queryLimit = 200;
    const resp = await fetch(`/mack-news/feed.json?limit=${queryLimit}&offset=${window.mack.newsData.offset}`);
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
  const aDate = Number(newsA.publicationDate || newsA.lastModified);
  const bDate = Number(newsB.publicationDate || newsB.lastModified);
  return bDate - aDate;
}

/**
 * A function for filter news results by date
 */
function filterNewsByDate(results, year) {
  const filteredResults = results.filter((result) => {
    const resultYear = new Date(result.publicationDate * 1000).getFullYear();
    return resultYear === year;
  });

  return filteredResults;
}

/**
 * A function for extract year from url pathname
 */
function extractYearFromPath(path) {
  const yearRegex = /\/(\d{4})\//;
  const matches = path.match(yearRegex);

  if (matches && matches.length >= 2) {
    const year = parseInt(matches[1], 10);
    return year;
  }

  return null;
}
/**
 * Get the list of news posts from the query index. News are auto-filtered based on page context
 * e.g tags, etc. and sorted by date
 *
 * @param filter {"mack-news"|"body-builder-news"|"auto"}  the name of the filter to apply
 * one of: topic, subtopic, author, tag, post, auto, none
 * @param path {string}  the path of the current page, used to filter by year
 * @param limit {number}  the number of posts to return, or -1 for no limit
 * @returns the posts as an array
 */
export async function getNews(filter, path, limit) {
  const pages = await loadNews();
  const allNews = pages.filter((page) => page.template === 'mack-news');

  // filter out anything that isn't a mack news (e.g. must have an author)
  let finalNews;

  const year = path ? extractYearFromPath(path) : null;
  const allYearsNews = year ? filterNewsByDate(allNews, year) : allNews;
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
    finalNews = allYearsNews.sort(sortNewsByDate);
  } else if (applicableFilter === 'body-builder-news') {
    finalNews = allYearsNews.sort(sortNewsByDate);
  } else {
    finalNews = [];
  }
  return limit < 0 ? finalNews : finalNews.slice(0, limit);
}
