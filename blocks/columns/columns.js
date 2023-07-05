import {
  addVideoShowHandler,
  createElement,
  getAllElWithChildren,
  isVideoLink,
  selectVideoLink,
  wrapImageWithVideoLink,
} from '../../scripts/scripts.js';

const decorateUnderline = (col) => {
  const u = col.querySelector('u');
  const uText = u.textContent;
  const p = u.closest('p');
  const hr = createElement('hr', 'column-underline');
  u.parentElement.textContent = uText;
  p.appendChild(hr);
};

const removeEmptyPs = (pictureWrapper) => {
  const Ps = pictureWrapper.querySelectorAll('p');
  [...Ps].forEach((p) => {
    if (p.children.length === 0) p.remove();
  });
};

const videoHandling = (blockEl) => {
  const pictureWrapper = getAllElWithChildren(blockEl.querySelectorAll(':scope > div > div'), 'picture')[0];
  const picture = pictureWrapper && pictureWrapper.querySelector('picture');
  const links = pictureWrapper && pictureWrapper.querySelectorAll('a');

  if (!picture || !links.length) {
    return;
  }

  const videoLinks = [...links].filter((link) => isVideoLink(link));
  const selectedVideoLink = selectVideoLink(videoLinks);

  if (selectedVideoLink) {
    videoLinks
      .filter((videoLink) => videoLink.getAttribute('href') !== selectedVideoLink.getAttribute('href'))
      .forEach((link) => link.remove());
    wrapImageWithVideoLink(selectedVideoLink, picture);
    addVideoShowHandler(selectedVideoLink);
    selectedVideoLink.parentElement.replaceChildren(selectedVideoLink);
    removeEmptyPs(pictureWrapper);
  }
};

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  const isInfo = block.classList.contains('info');
  const isPromo = block.classList.contains('promo');
  if (isInfo) {
    cols.forEach((col) => {
      col.className = 'columns-col-wrapper';
      decorateUnderline(col);
    });
  }
  if (isPromo) {
    const textParent = block.querySelector(':scope > div > div:not(:has(picture))');
    const pictureParent = block.querySelector(':scope > div > div:has(picture)');
    textParent.className = 'columns-promo-text-wrapper';
    if (pictureParent) pictureParent.className = 'columns-promo-picture-wrapper';
  }

  videoHandling(block);
}
