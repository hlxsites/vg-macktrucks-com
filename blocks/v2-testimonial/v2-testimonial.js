import {
  isVideoLink,
  selectVideoLink,
} from '../../scripts/video-helper.js';
import { variantsClassesToBEM } from '../../scripts/common.js';

const blockName = 'v2-testimonial';
const variantClasses = ['media-left', 'media-right', 'overlap'];

const handleVideoLinks = (videoLinks) => {
  const selectedVideo = selectVideoLink(videoLinks);

  videoLinks.forEach((link) => {
    if (link !== selectedVideo) {
      link.parentElement.remove();
    }
  });

  if (selectedVideo) {
    selectedVideo.classList.add(`${blockName}__video-link`);
    return;
  }

  // eslint-disable-next-line no-console
  console.warn(`[${blockName}]: No proper video link provided for current cookie settings!`);
};

const createVideoSection = (col) => {
  const videoLinks = [...col.querySelectorAll('a')].filter(isVideoLink);

  if (videoLinks.length === 0) {
    return;
  }

  handleVideoLinks(videoLinks);
  col.classList.add(`${blockName}__video-section`);
  col.setAttribute('data-theme', 'gold');
  col.querySelector('p').classList.add(`${blockName}__author`);
  const videoLinkEl = col.querySelector(`.${blockName}__video-link`);
  videoLinkEl.parentElement.classList.add(`${blockName}__video-link-wrapper`);
};

export default async function decorate(block) {
  variantsClassesToBEM(block.classList, variantClasses, blockName);

  const columns = block.querySelectorAll(':scope > div > div');
  block.parentElement.classList.add('full-width');

  columns.forEach((col) => {
    col.classList.add(`${blockName}__column`);

    const headings = [...col.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    headings.forEach((h) => h.classList.add(`${blockName}__heading`));
    headings[0]?.classList.add('with-marker');

    const images = [...col.querySelectorAll('img')];
    images.forEach((img) => {
      img.classList.add(`${blockName}__image`);
      col.parentElement.classList.add(`${blockName}__image-row`);
    });

    const blockquotes = [...col.querySelectorAll('blockquote')];
    blockquotes.forEach((bq) => {
      const em = bq.querySelector('em');

      if (em) {
        em.outerHTML = em.innerHTML;
      }

      bq.classList.add(`${blockName}__blockquote`);
      bq.closest(`.${blockName}__column`)?.classList.add(`${blockName}__blockquote-column`);
      col.parentElement.classList.add(`${blockName}__text-row`);
    });

    createVideoSection(col, block);
  });
}
