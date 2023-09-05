import { createElement } from '../../scripts/common.js';

export default async function decorate(block) {
  const blockName = 'v2-columns';
  const rows = [...block.querySelectorAll(':scope > div')];
  const columns = [...block.querySelectorAll(':scope > div > div')];

  rows.forEach((row) => {
    row.classList.add(`${blockName}__row`);
  });

  columns.forEach((col) => {
    col.classList.add(`${blockName}__column`);

    const picture = col.querySelector('picture');
    const allTextElmts = col.querySelectorAll('p');
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

    const buttons = [...col.querySelectorAll('a')];
    buttons.forEach((btn) => {
      btn.classList.add('button', 'button--large', 'button--primary');

      if (btn.parentElement.classList.contains('button-container')) {
        btn.parentElement.replaceWith(btn);
      }
    });

    const headings = [...col.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    headings.forEach((heading) => heading.classList.add(`${blockName}__heading`));

    const pretitleText = headings[0]?.previousElementSibling;

    if (pretitleText) {
      const pretitle = createElement('span', { classes: `${blockName}__pretitle` });
      pretitle.textContent = pretitleText.textContent;
      pretitleText.replaceWith(pretitle);
    }
  });
}
