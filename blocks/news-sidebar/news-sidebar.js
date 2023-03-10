import {
  getMetadata,
} from '../../scripts/lib-franklin.js';
import {
  getNews, createElement,
} from '../../scripts/scripts.js';

export default async function decorate(block) {
  const navPages = await getNews('mack-news');
  const newsPage = navPages.filter((page) => page.title.toLowerCase() !== getMetadata('title')?.toLowerCase());
  const newsContainer = createElement('div', 'news-container');
  const list = createElement('ul');
  if (newsPage) {
    newsPage.forEach((a) => {
      const li = createElement('li');
      const newsItem = document.createElement('a');
      newsItem.href = a.path;
      newsItem.textContent = (a.heading !== '' && a.heading !== '0') ? a.heading : '';
      li.append(newsItem);
      list.append(li);
    });
    newsContainer.append(list);
  }
  block.innerHTML = newsContainer.innerHTML;
}
