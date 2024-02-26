import { createElement, variantsClassesToBEM } from '../../scripts/common.js';

export default async function decorate(block) {
  const blockParent = block.parentElement.parentElement;
  const blockName = 'v2-columns';

  const variantClasses = ['with-background-image', 'background-plane'];
  variantsClassesToBEM(block.classList, variantClasses, blockName);

  const isBackgroundImageVariant = block.classList.contains(`${blockName}--with-background-image`);
  const hasHeader = blockParent.classList.contains('header-with-mark');

  const rows = [...block.querySelectorAll(':scope > div')];
  const columns = [...block.querySelectorAll(':scope > div > div')];

  rows.forEach((row) => {
    row.classList.add(`${blockName}__row`);
  });

  columns.forEach((col) => {
    col.classList.add(`${blockName}__column`);

    const picture = col.querySelector('picture');
    const allTextElmts = col.querySelectorAll('p, ul, ol');
    const bodyElmts = [];

    if (picture) {
      col.classList.add(`${blockName}__column--with-image`);
    } else {
      col.classList.add(`${blockName}__column--with-text`);
    }

    allTextElmts.forEach((e) => {
      const nextElmt = e.nextElementSibling;

      const isButton = [...e.classList].includes('button-container');
      const isPretitle = nextElmt?.tagName.toLowerCase()[0] === 'h';

      if (!isPretitle && !isButton) bodyElmts.push(e);
    });
    bodyElmts.forEach((e) => e.classList.add(`${blockName}__body`));

    block.querySelectorAll(`ul.${blockName}__body li`).forEach((item) => {
      item.classList.add('li--hyphen');
    });
    const buttons = [...col.querySelectorAll('.button-container a')];

    if (isBackgroundImageVariant) {
      blockParent.classList.add(`${blockName}-container--with-background-image`);
      const btnSection = createElement('div', { classes: 'button-container' });

      buttons.forEach((btn) => {
        btn.classList.add('button--large');
        const btnContainer = btn.closest('.button-container');
        btnContainer.replaceWith(btn);
        btnSection.append(btn);
      });
      if (!picture) col.append(btnSection);

      if (hasHeader) {
        const defaultContent = blockParent.querySelector('.default-content-wrapper');
        const header = [...defaultContent.querySelectorAll('h1, h2, h3, h4, h5, h6')];
        header[0].classList.add(`${blockName}__body-header`, 'with-marker');
        bodyElmts[0].insertAdjacentElement('beforebegin', header[0]);
        defaultContent.remove();
      }
    } else {
      buttons.forEach((btn) => {
        btn.classList.add('button--large');
      });
    }

    const headings = [...col.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    headings.forEach((heading) => heading.classList.add(`${blockName}__heading`, 'h2'));

    // icons
    [...col.querySelectorAll('.icon')].forEach((icon) => {
      const iconParentEl = icon.parentElement;
      if (iconParentEl.children.length === 1) {
        iconParentEl.replaceWith(icon);
      }
    });

    const prevEl = headings[0]?.previousElementSibling;
    const pretitleText = prevEl && !prevEl.classList.contains('icon') && prevEl.textContent;

    if (pretitleText) {
      const pretitle = createElement('span', { classes: 'pretitle' });
      pretitle.textContent = pretitleText;
      prevEl.replaceWith(pretitle);
    }
  });
}
