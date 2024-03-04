import {
  buildBlock,
  decorateBlock,
  loadBlock,
} from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/common.js';
import {
  FORM_MAGAZINE_SUBSCRIBE,
  FORM_MAGAZINE_SUBSCRIBE_SIZE,
} from '../../scripts/constants.js';

export default async function decorate(block) {
  const children = block.querySelectorAll('p');
  // eslint-disable-next-line no-unused-vars
  const [picture, title, subtitle, text] = children;

  const generalSection = createElement('div', { classes: 'default-content-wrapper' });

  const heading = createElement('h2', { props: { id: 'subscribe-to-bulldog-magazine' } });
  heading.textContent = subtitle.textContent;

  text.classList.add('magazine-subscribe-text');

  const iframeLink = createElement('a', {
    classes: 'iframe-link',
    props: { href: FORM_MAGAZINE_SUBSCRIBE },
  });

  generalSection.append(heading, text);

  block.textContent = '';
  block.append(generalSection);
  block.parentElement.classList.add('section', 'center', 'padding-0');
  block.parentElement.setAttribute('data-form-type', 'Subscribe-magazine');

  const iframeForm = buildBlock('iframe', { elems: [iframeLink] });
  block.insertAdjacentElement('afterend', iframeForm);
  iframeForm.classList.add(FORM_MAGAZINE_SUBSCRIBE_SIZE);
  decorateBlock(iframeForm);
  loadBlock(iframeForm);
}
