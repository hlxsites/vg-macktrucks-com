import { createElement } from '../../scripts/common.js';

export default async function decorate(block) {
  const blockName = 'v2-columns';
  const columnsImage = createElement('div', { classes: `${blockName}__image` });
  const columnsText = createElement('div', { classes: `${blockName}-content` });

  const columns = [...block.querySelector(':scope > div').children];

  const imageFirst = columns[0].querySelector('picture');
  // block.classList.add(`image-${imageFirst ? 'first' : 'last'}`);

  const picture = block.querySelector('picture');

  const allTextElmts = block.querySelectorAll('p');
  const bodyElmts = [];

  allTextElmts.forEach((e) => {
    const nextElmt = e.nextElementSibling;

    const isButton = [...e.classList].includes('button-container');
    const isPretitle = nextElmt?.tagName.toLowerCase()[0] === 'h';

    if (!isPretitle && !isButton) bodyElmts.push(e);
  });
  bodyElmts.forEach((e) => e.classList.add(`${blockName}-content__body`));

  const buttons = [...block.querySelectorAll('a')];
  buttons.forEach((btn) => btn.classList.add('button', 'button--large', 'button--primary'));

  const headings = [...block.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  headings.forEach((heading) => heading.classList.add(`${blockName}-content__heading`));

  const pretitleText = headings[0].previousElementSibling;

  if (pretitleText) {
    const pretitle = createElement('span', { classes: `${blockName}-content__pretitle` });
    pretitle.textContent = pretitleText.textContent;
    columnsText.append(pretitle);
  }

  columnsImage.append(picture);
  columnsText.append(...headings, ...bodyElmts, ...buttons);

  block.textContent = '';
  if (imageFirst) {
    block.append(columnsImage, columnsText);
  } else {
    block.append(columnsText, columnsImage);
  }
}
