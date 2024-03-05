import {
  buildBlock,
  decorateBlock,
  loadBlock,
} from '../../scripts/lib-franklin.js';
import {
  createElement,
  getTextLabel,
} from '../../scripts/common.js';
import { FORM_MAGAZINE_SUBSCRIBE } from '../../scripts/constants.js';

export default async function decorate(block) {
  const content = document.createRange().createContextualFragment(`
    <div class="default-content-wrapper">
      <h2 id="subscribe-to-bulldog-magazine">${getTextLabel('form-subscribe-magazine:heading')}</h2>
      <p>${getTextLabel('form-subscribe-magazine:text')}</p>
    </div>
  `);

  const iframeLink = createElement('a', {
    classes: 'iframe-link',
    props: { href: FORM_MAGAZINE_SUBSCRIBE.href },
  });

  block.textContent = '';
  block.append(content);
  block.parentElement.classList.add('section', 'center', 'padding-0');
  block.parentElement.setAttribute('data-form-type', 'Subscribe-magazine');

  const iframeForm = buildBlock('iframe', { elems: [iframeLink] });
  block.insertAdjacentElement('afterend', iframeForm);
  iframeForm.classList.add(FORM_MAGAZINE_SUBSCRIBE.iframeSize);
  decorateBlock(iframeForm);
  loadBlock(iframeForm);
}
