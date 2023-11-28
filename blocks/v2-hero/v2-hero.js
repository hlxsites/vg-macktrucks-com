import {
  getImageURLs,
  createResponsivePicture,
} from '../../scripts/common.js';

export default async function decorate(block) {
  const blockName = 'v2-hero';
  const images = [...block.querySelectorAll('p > picture')];
  const imageURLs = getImageURLs(images);
  const imageData = imageURLs.map((src) => ({ src, breakpoints: [] }));

  if (imageData.length === 1) {
    imageData[0].breakpoints = [
      { media: '(min-width: 600px)', width: 600 },
      { media: '(min-width: 1200px)', width: 1200 },
      { media: '(min-width: 1440px)', width: 1440 },
      { media: '(min-width: 1920px)', width: 1920 },
      { width: 750 },
    ];
  }

  if (imageData.length > 1) {
    imageData[0].breakpoints = [
      { media: '(min-width: 600px)', width: 600 },
      { width: 750 },
    ];

    imageData[1].breakpoints = [
      { media: '(min-width: 1200px)', width: 1200 },
      { media: '(min-width: 1440px)', width: 1440 },
      { media: '(min-width: 1920px)', width: 1920 },
    ];
  }

  const altText = [...block.querySelectorAll('p > picture img.alt')];
  const newPicture = createResponsivePicture(imageData, true, altText, `${blockName}__image`);
  images.forEach((image) => image.parentNode.remove());

  block.prepend(newPicture);

  const contentWrapper = block.querySelector(':scope > div');
  contentWrapper.classList.add(`${blockName}__content-wrapper`);

  const content = block.querySelector(':scope > div > div');
  content.classList.add(`${blockName}__content`);

  const headings = [...content.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  headings.forEach((h) => h.classList.add(`${blockName}__heading`));

  const firstHeading = headings[0];
  firstHeading.classList.add('with-marker');

  const ctaButtons = content.querySelectorAll('.button-container > a');
  [...ctaButtons].forEach((b) => {
    b.classList.add(`${blockName}__cta`, 'button--cta');
    b.classList.remove('button--primary');
    b.parentElement.classList.add(`${blockName}__cta-wrapper`);
  });

  block.parentElement.classList.add('full-width');
}
