import { createElement } from '../../scripts/scripts.js';

export default function decorate(block) {
  const children = [...block.children];

  const downloadSpecsSection = createElement('div', 'download-specs-section');
  const specsTitle = children.shift().querySelector('h3');
  const downloadSpecsList = createElement('ul', 'download-specs-list');

  children.forEach((e, idx) => {
    const downloadItem = createElement('li', ['download-specs-item', `download-specs-item-${idx + 1}`]);

    const anchorElement = createElement('a', 'anchor-element');
    const linkUrl = e.querySelector('a').getAttribute('href');
    anchorElement.setAttribute('href', linkUrl);
    anchorElement.setAttribute('target', '_blank');

    const img = createElement('img', 'download-specs-icon');
    img.src = '/icons/pdficon.png';

    const pElement = createElement('p', 'p-element');
    const text = e.querySelector('div').innerText;
    pElement.textContent = text;

    anchorElement.append(img, pElement);
    downloadItem.append(anchorElement);
    downloadSpecsList.append(downloadItem);
  });
  downloadSpecsSection.append(specsTitle, downloadSpecsList);

  block.textContent = '';
  block.append(downloadSpecsSection);
}
