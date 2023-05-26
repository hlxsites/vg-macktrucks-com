import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { createElement } from '../../scripts/scripts.js';

const setClickableCard = (ul, isDarkVar = false) => {
  const lis = [...ul.children];
  lis.forEach((li) => {
    const buttons = li.querySelectorAll('.cards-card-body .button-container');
    const { length } = buttons;
    if (length === 0) return;
    const tempLink = [...buttons].at(-1).firstChild;
    const newLink = createElement('a', '', { href: tempLink.href, title: tempLink.title });
    // get image for setting as background image

    if (isDarkVar) {
      const img = li.querySelector('img');
      newLink.style.backgroundImage = `url(${img.src})`;
      const pictureDiv = li.querySelector('.cards-card-image');
      pictureDiv.remove();
    }
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

const observerFallBack = (changes, observer, cards, imgMaxHeight) => {
  changes.forEach((change) => {
    const isAttribute = change.type === 'attributes';
    const isStatus = isAttribute && change.attributeName === 'data-section-status';
    const isLoaded = isStatus && change.target.dataset.sectionStatus === 'loaded';
    if (!isLoaded) return;
    let maxHeight = imgMaxHeight;
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

const setSameHeightCards = (block, cards, imgMaxHeight) => {
  const parentSection = getParentSection(block);
  const observer = new MutationObserver(
    (changes) => observerFallBack(changes, observer, cards, imgMaxHeight),
  );
  observer.observe(parentSection, { attributes: true, attributeFilter: ['data-section-status'] });
};

export default function decorate(block) {
  const isCTABlock = block.classList.contains('cta');
  const isDarkVar = block.classList.contains('dark');
  let imgMaxHeight = 0;
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
    .forEach((img) => {
      if (isDarkVar) {
        imgMaxHeight = img.height > imgMaxHeight ? img.height : imgMaxHeight;
      }
      img.closest('picture')
        .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])); 
    });

  // add background black
  if (isDarkVar) {
    const cardsContainer = block.parentElement.parentElement;
    cardsContainer.classList.add('dark-card-conatiner');
  }
  block.textContent = '';
  block.append(ul);

  if (isCTABlock) {
    setClickableCard(ul, isDarkVar);
    setSameHeightCards(block, ul, imgMaxHeight);
  }
}
