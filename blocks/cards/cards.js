import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

const setClickableCard = (ul) => {
  const lis = [...ul.children];
  lis.forEach((li) => {
    const buttons = li.querySelectorAll('.cards-card-body .button-container');
    const { length } = buttons;
    if (length === 0) return;
    const tempLink = [...buttons].at(-1).firstChild;
    const newLink = document.createElement('a');
    newLink.href = tempLink.href;
    newLink.title = tempLink.title;
    buttons[length - 1].remove();
    newLink.innerHTML = li.innerHTML;
    li.textContent = '';
    li.appendChild(newLink);
  });
};

const getParentSection = (element) => {
  const parent = element.parentElement;
  return parent.dataset.sectionStatus ? parent : getParentSection(parent);
};

const observerFallBack = (changes, observer, cards) => {
  changes.forEach((change) => {
    const isAttribute = change.type === 'attributes';
    const isStatus = isAttribute && change.attributeName === 'data-section-status';
    const isLoaded = isStatus && change.target.dataset.sectionStatus === 'loaded';
    if (!isLoaded) return;
    let maxHeight = 0;
    const { children } = cards;
    [...children].forEach((card) => {
      const height = card.offsetHeight;
      if (height > maxHeight) maxHeight = height;
    });
    [...children].forEach((card) => {
      card.style.height = `${maxHeight}px`;
    });
    observer.disconnect();
  });
};

const setSameHeightCards = (block, cards) => {
  const parentSection = getParentSection(block);
  const observer = new MutationObserver((changes) => observerFallBack(changes, observer, cards));
  observer.observe(parentSection, { attributes: true, attributeFilter: ['data-section-status'] });
};

export default function decorate(block) {
  const isCTABlock = block.classList.contains('cta');
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.innerHTML = row.innerHTML;
    [...li.children].forEach((div) => {
      const hasPicture = isCTABlock
        ? div.querySelector('picture')
        : div.children.length === 1 && div.querySelector('picture');
      if (hasPicture) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img')
    .forEach((img) => img.closest('picture')
      .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
  if (isCTABlock) {
    setClickableCard(ul);
    setSameHeightCards(block, ul);
  }
}
