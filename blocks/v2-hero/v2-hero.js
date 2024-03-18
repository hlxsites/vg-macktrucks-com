import {
  getImageURLs,
  createResponsivePicture,
  variantsClassesToBEM,
} from '../../scripts/common.js';

const variantClasses = ['dark', 'light'];
const blockName = 'v2-hero';

export default async function decorate(block) {
  variantsClassesToBEM(block.classList, variantClasses, blockName);
  const blockContainer = block.parentElement.parentElement;
  const isPdp = blockContainer.dataset.page === 'pdp';

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

  if (images.length !== 0) {
    block.prepend(newPicture);
  } else {
    block.classList.add(`${blockName}--no-image`);
  }

  const contentWrapper = block.querySelector(':scope > div');
  contentWrapper.classList.add(`${blockName}__content-wrapper`);

  const content = block.querySelector(':scope > div > div');
  content.classList.add(`${blockName}__content`);

  const headings = [...content.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  headings.forEach((h) => h.classList.add(`${blockName}__heading`));

  if (!isPdp) {
    const firstHeading = headings[0];
    firstHeading.classList.add('with-marker');
  }

  const button = content.querySelector('a');
  const allTexts = content.querySelectorAll('p');

  if (!button && (allTexts.length > 0)) {
    content.classList.add('with-text');
    allTexts.forEach((p) => p.classList.add(`${blockName}__text`));
  }

  const ctaButtons = content.querySelectorAll('.button-container > a');
  [...ctaButtons].forEach((b) => {
    b.classList.add((isPdp ? `${blockName}__cta` : 'button--large'), 'button--cta');
    b.classList.remove('button--primary');
    b.parentElement.classList.add(`${blockName}__cta-wrapper`);
  });

  block.parentElement.classList.add('full-width');
}
