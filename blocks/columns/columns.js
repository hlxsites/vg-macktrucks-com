import { createElement } from '../../scripts/scripts.js';

const getParentParagraph = (el) => (el.parentElement.localName === 'p'
  ? el.parentElement
  : getParentParagraph(el.parentElement));

const decorateUnderline = (col) => {
  const u = col.querySelector('u');
  const uText = u.textContent;
  const p = getParentParagraph(u);
  const hr = createElement('hr', 'column-underline');
  u.parentElement.textContent = uText;
  p.appendChild(hr);
};

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  const isInfo = block.classList.contains('info');
  const isPromo = block.classList.contains('promo');
  if (isInfo) {
    cols.forEach((col) => {
      col.className = 'columns-col-wrapper';
      decorateUnderline(col);
    });
  }
  if (isPromo) {
    const textParent = block.querySelector('p')?.parentElement;
    const pictureParent = block.querySelector('picture')?.parentElement;
    textParent.className = 'columns-promo-text-wrapper';
    pictureParent.className = 'columns-promo-picture-wrapper';
  }
}
