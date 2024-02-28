import { createElement, variantsClassesToBEM } from '../../scripts/common.js';

export default async function decorate(block) {
  const link = block.querySelector('a')?.getAttribute('href') || block.textContent.trim();
  const title = block.querySelector('h1, h2, h3, h4, h5, h6').textContent;
  const iframe = createElement('iframe', { props: { src: link, frameborder: 0, title } });
  const fixedHeightClass = [...block.classList].find((el) => /[0-9]+px/.test(el));
  const maxWidthClass = [...block.classList].find((el) => /width-[0-9]+px/.test(el));

  variantsClassesToBEM(block.classList, ['full-viewport'], 'v2-iframe');

  if (fixedHeightClass) {
    iframe.height = fixedHeightClass;
  }
  if (maxWidthClass) {
    const maxWidth = maxWidthClass.split('width-')[1];
    iframe.style.maxWidth = maxWidth;
  }

  block.replaceChildren(iframe);
}
