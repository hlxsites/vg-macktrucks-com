import { readBlockConfig } from '../../scripts/lib-franklin.js';
import { getTextLabel, createElement } from '../../scripts/common.js';

const ctaText = getTextLabel('learn more');

export default async function decorate(block) {
  const picture = block.querySelector('picture');
  const blockConfig = readBlockConfig(block);
  const [, eyebrow, headline, body, link] = Object.values(blockConfig);

  const columnsImage = createElement('div', { classes: 'v2-columns-image' });
  const columnsText = createElement('div', { classes: 'v2-columns-content' });

  const eyebrowElmt = createElement('p', { classes: 'v2-columns-content__eyebrow' });
  eyebrowElmt.textContent = eyebrow;
  const headlineElmt = createElement('h1', { classes: 'v2-columns-content__headline' });
  headlineElmt.textContent = headline;
  const bodyElmt = createElement('p', { classes: 'v2-columns-content__body' });
  bodyElmt.textContent = body;
  const ctaElmt = createElement('button', {
    classes: ['v2-columns-content__cta', 'button--primary'],
    props: { type: 'button', href: link },
  });
  ctaElmt.textContent = ctaText;

  columnsImage.appendChild(picture);
  columnsText.append(eyebrowElmt, headlineElmt, bodyElmt, ctaElmt);

  block.textContent = '';
  block.append(columnsImage, columnsText);
}
