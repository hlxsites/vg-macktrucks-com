import {
  addVideoShowHandler,
  createElement,
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

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  const isInfo = block.classList.contains('info');
  const isPromo = block.classList.contains('promo');
  const hasVideo = block.classList.contains('video');
  const hasDownloadLink = block.classList.contains('with-download-link');
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
  if (hasVideo) {
    const pictureWrapper = block.querySelector(':scope > div > div:has(picture)');
    const picture = pictureWrapper.querySelector('picture');
    const links = pictureWrapper && pictureWrapper.querySelectorAll('a');
    const videoLinks = [...links].filter((link) => isVideoLink(link));
    const selectedVideoLink = selectVideoLink(videoLinks);
    if (selectedVideoLink) {
      videoLinks
        .filter((videoLink) => videoLink.getAttribute('href') !== selectedVideoLink.getAttribute('href'))
        .forEach((link) => link.remove());
      wrapImageWithVideoLink(selectedVideoLink, picture);
      addVideoShowHandler(selectedVideoLink);
      selectedVideoLink.parentElement.replaceWith(selectedVideoLink);
      removeEmptyPs(pictureWrapper);
    }
  }
  if (hasDownloadLink) {
    const links = block.querySelectorAll('a');
    links.forEach((link) => {
      const hasDownload = (link.innerText.toLowerCase().split(' '));
      if (hasDownload[0] === 'download') link.setAttribute('target', '_blank');
    });
  }
}
