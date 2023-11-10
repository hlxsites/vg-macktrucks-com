import { createElement } from '../../scripts/common.js';

export default function decorate(block) {
  const children = [...block.children];

  const downloadSpecsSection = createElement('div', { classes: 'download-specs-section' });
  const specsTitle = children.shift().querySelector('h3');
  const downloadSpecsList = createElement('ul', { classes: 'download-specs-list' });

  children.forEach((e, idx) => {
    const downloadItem = createElement('li', { classes: ['download-specs-item', `download-specs-item-${idx + 1}`] });

    const anchorElement = createElement('a', { classes: 'anchor-element' });
    const linkUrl = e.querySelector('a').getAttribute('href');
    anchorElement.setAttribute('href', linkUrl);
    anchorElement.setAttribute('target', '_blank');

    const img = createElement('img', { classes: 'download-specs-icon' });
    img.src = '/icons/pdficon.png';

    const pElement = createElement('p', { classes: 'p-element' });
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
