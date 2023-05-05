import { createElement } from '../../scripts/scripts.js';
import { getNews } from '../../scripts/news.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const rssFeedUrl = config.feed;
  const filter = config.filter || 'mack-news';
  block.textContent = '';

  const rssLink = createElement('a', ['title-with-icon'], { href: rssFeedUrl, target: '_blank' });
  rssLink.textContent = 'News RSS';
  block.append(rssLink);

  const posts = await getNews(filter);
  const list = createElement('ul', ['news-sidebar-list']);
  list.append(...posts.map((post) => {
    const articleLink = createElement('a', [], { href: post.path });

    const heading = createElement('h3');
    heading.textContent = (post.heading && post.heading !== '0') ? post.heading : '';
    articleLink.append(heading);

    const summary = createElement('p');
    summary.textContent = post.summary;
    articleLink.append(summary);

    const li = createElement('li');
    li.append(articleLink);
    return li;
  }));
  block.append(list);
}
