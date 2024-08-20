import {
  buildBlock,
  decorateBlock,
  loadBlock,
} from '../../scripts/lib-franklin.js';
import {
  createElement,
  getTextLabel,
  MAGAZINE_CONFIGS,
} from '../../scripts/common.js';

export default async function decorate(block) {
  const { SUBSCRIBE_DISABLED } = MAGAZINE_CONFIGS;
  if (!MAGAZINE_CONFIGS || !SUBSCRIBE_DISABLED || SUBSCRIBE_DISABLED === 'true') {
    const blockContainer = block.closest('.magazine-subscribe-wrapper');
    if (blockContainer) blockContainer.remove();
    return;
  }
  const content = document.createRange().createContextualFragment(`
    <div class="default-content-wrapper">
      <h2 id="subscribe-to-bulldog-magazine">${getTextLabel('form-subscribe-magazine:heading')}</h2>
      <p>${getTextLabel('form-subscribe-magazine:text')}</p>
    </div>
  `);

  const iframeLink = createElement('a', {
    classes: 'iframe-link',
    props: { href: MAGAZINE_CONFIGS.HREF },
  });
  const iframeForm = buildBlock('iframe', { elems: [iframeLink] });

  block.textContent = '';
  block.append(content);
  block.parentElement.classList.add('section', 'center', 'padding-0');
  block.parentElement.setAttribute('data-form-type', 'Subscribe-magazine');
  block.insertAdjacentElement('afterend', iframeForm);
  iframeForm.classList.add(MAGAZINE_CONFIGS.IFRAME_SIZE);
  decorateBlock(iframeForm);
  loadBlock(iframeForm);
}
