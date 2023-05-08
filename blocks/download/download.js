import { createElement } from '../../scripts/scripts.js';

export default function decorate(block) {
  const children = [...block.children];

  const downloadList = createElement('ul', 'download-list');

  children.forEach((e, idx) => {
    const downloadItem = createElement('li', ['download-item', `download-item-${idx + 1}`]);

    const image = e.querySelector('picture').innerHTML;

    const allTexts = e.querySelectorAll('p');

    const titleElement = allTexts[0].querySelector('a');
    const title = titleElement.getAttribute('title');
    const titleUrl = titleElement.getAttribute('href');

    const textContent = allTexts[1].innerHTML;

    const linkElement = allTexts[2].querySelector('a');
    const linkText = linkElement.getAttribute('title');
    const linkUrl = linkElement.getAttribute('href');

    downloadItem.innerHTML = `
    <div class='download-card'>
      <div class='download-image'>
        <picture>
          ${image}
        </picture>
      </div>
      <div class='download-texts'>
        <a href='${titleUrl}' class='download-texts-title'>
          ${title}
        </a>
        <p class='download-texts-text'>
          ${textContent}
        </p>
        <a href='${linkUrl}' class='download-texts-link'>
          ${linkText}
        </a>
      </div>
    </div>`;
    downloadList.append(downloadItem);
  });
  block.textContent = '';
  block.append(downloadList);
}
