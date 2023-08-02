import { html } from '../../scripts/scripts.js';
import {
  feedsInfo, getBodyBuilderNews, getMackNews, PagingInfo,
} from '../../scripts/news.js';
import { readBlockConfig } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);

  const type = window.location.pathname.startsWith('/parts-and-services/support/body-builders')
    ? 'body-builder-news'
    : 'mack-news';

  const filter = config.filter || '';
  block.textContent = '';

  // eslint-disable-next-line function-call-argument-newline,function-paren-newline
  block.append(html`<a class="title-with-icon" href="${feedsInfo[type].feedPath}" target="_blank">
      News RSS</a>`);

  const pagingInfo = new PagingInfo();
  const posts = type === 'body-builder-news'
    ? await getBodyBuilderNews(pagingInfo)
    : await getMackNews(window.location.pathname, pagingInfo, filter);

  const list = html`<ul class="news-sidebar-list">
     
  </ul>`;
  posts.forEach((post) => list.append(html`
      <li>
          <a href="${post.path}">
              <h3>${(post.title && post.title !== '0') ? post.title : ''}</h3>
              <p>${post.summary}</p>
          </a>
      </li>`));
  block.append(list);
}
