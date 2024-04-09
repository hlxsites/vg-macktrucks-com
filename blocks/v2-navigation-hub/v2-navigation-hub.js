import { unwrapDivs, variantsClassesToBEM } from '../../scripts/common.js';

const blockName = 'v2-navigation-hub';
const variantClasses = ['media-left', 'media-right', 'overlap'];
const blockNames = {
  card: `${blockName}__card-container`,
  cardContent: `${blockName}__card-content`,
  cardNavigation: `${blockName}__card-navigation`,
  cardNavTitle: `${blockName}__card-nav-title`,
  cardNavList: `${blockName}__card-nav-list`,
  media: `${blockName}__media-container`,
  mediaRight: `${blockName}__media-right`,
};

export default function decorate(block) {
  variantsClassesToBEM(block.classList, variantClasses, blockName);
  const blockWrapper = block.closest(`.${blockName}-wrapper`);
  // Card elements
  const cardContainer = block.querySelector(':scope > div:first-child');
  const cardContent = cardContainer.querySelector(':scope > div:first-child');
  const cardNavigation = cardContainer.querySelector(':scope > div:last-child');
  const cardNavTitle = cardNavigation.querySelector(':scope > :first-child');
  const cardNavList = cardNavigation.querySelector(':scope > ul');
  const cardNavLinks = [...cardNavList.querySelectorAll('a')];
  // Media element
  const mediaContainer = block.querySelector(':scope > div:last-child');
  // By default, media is on the left side
  const isMediaLeft = mediaContainer.firstElementChild.children.length > 0;

  blockWrapper.classList.add('full-width');
  cardContainer.className = blockNames.card;
  cardContent.className = blockNames.cardContent;
  cardNavigation.className = blockNames.cardNavigation;
  cardNavTitle.className = blockNames.cardNavTitle;
  cardNavList.className = blockNames.cardNavList;
  cardNavLinks.forEach((link) => { link.className = 'standalone-link'; });
  mediaContainer.className = blockNames.media;
  if (!isMediaLeft) mediaContainer.classList.add(blockNames.mediaRight);

  unwrapDivs(mediaContainer);
}
