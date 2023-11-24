import {
  processImagesToOptimizedPicture,
} from '../../scripts/common.js';

export default async function decorate(block) {
  const blockName = 'v2-hero';
  const BREAKPOINTS = {
    0: '(min-width: 400px)',
    1: '(min-width: 1200px)',
  };
  const images = block.querySelectorAll('p > picture');

  processImagesToOptimizedPicture(images, true, BREAKPOINTS, (newPicture) => {
    // Remove the original containers of the images
    images.forEach((image) => image.parentNode.remove());

    const img = newPicture.querySelector('img');
    img.classList.add(`${blockName}__image`);

    // Prepend the new picture element to the tab
    block.prepend(newPicture);
  });

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
