import { createElement } from '../../scripts/scripts.js';
import { getNews } from '../../scripts/news.js';

// TODO: make index configurable in block
export default async function decorate(block) {
  const rssFeedUrl = block.querySelector('a').href;
  block.textContent = '';

  const rssLink = createElement('a', ['title-with-icon'], { href: rssFeedUrl, target: '_blank' });
  rssLink.textContent = 'News RSS';
  block.append(rssLink);

  const articles = await getNews('mack-news');

  const list = createElement('ul', ['news-sidebar-list']);
  list.append(...articles.map((article) => {
    const articleLink = createElement('a', [], { href: article.path });

    const heading = createElement('h3');
    heading.textContent = (article.heading && article.heading !== '0') ? article.heading : '';
    articleLink.append(heading);

    const summary = createElement('p');
    summary.textContent = article.summary;
    articleLink.append(summary);

    const li = createElement('li');
    li.append(articleLink);
    return li;
  }));
  block.append(list);
}
