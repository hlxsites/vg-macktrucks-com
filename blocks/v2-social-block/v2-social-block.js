import {
  getTextLabel,
  unwrapDivs,
  createElement,
  decorateIcons,
} from '../../scripts/common.js';

const blockName = 'v2-social-block';

const LABELS = {
  COPIED: getTextLabel('tooltip copied text'),
};
const CLASSES = {
  title: `${blockName}__title`,
  listWrapper: `${blockName}__list-wrapper`,
  list: `${blockName}__list`,
  button: `${blockName}__button`,
  tooltipTop: ['tooltip', 'tooltip--top'],
  tooltipShow: 'show',
};

const buildTemplateBlock = (block) => {
  const shareConfigs = [
    ['twitter', 'https://twitter.com/intent/tweet?url='],
    ['linkedin', 'https://www.linkedin.com/cws/share?url='],
    ['fb', 'https://www.facebook.com/sharer/sharer.php?u='],
  ];
  const fragment = document.createDocumentFragment();

  shareConfigs.forEach((link) => {
    const linkElement = createElement('li');
    linkElement.innerHTML = `
      <a class='${CLASSES.button}'>
        <span class='icon icon-${link[0]}'></span>
      </a>
    `;
    linkElement.querySelector('a').addEventListener('click', () => {
      window.open(`${link[1]}${window.location.href}`, '_blank');
    });

    fragment.appendChild(linkElement);
  });
  decorateIcons(fragment);

  const shareLinkList = createElement('ul');
  shareLinkList.classList.add(CLASSES.list);

  shareLinkList.appendChild(fragment);

  const isFirstOrLast = document.querySelectorAll(`.${CLASSES.list}`).length === 0;

  const socialWrapper = createElement('div');
  socialWrapper.classList.add(CLASSES.listWrapper);

  socialWrapper.appendChild(shareLinkList);

  block.classList.add(isFirstOrLast ? 'first' : 'last');
  block.appendChild(socialWrapper);
};

const buildDefaultBlock = (block) => {
  const headings = block.querySelectorAll('h1, h2, h3, h4, h5, h6');
  [...headings].forEach((heading) => heading.classList.add(CLASSES.title));

  const socialWrapper = block.querySelector(':scope > div');
  socialWrapper.classList.add(CLASSES.listWrapper);

  const list = socialWrapper.querySelector('ul');
  list.classList.add(CLASSES.list);

  [...list.children].forEach((item) => {
    const anchor = item.querySelector('a');
    if (anchor) {
      anchor.className = CLASSES.button;
    }

    const copyLink = item.querySelector('.icon-link');
    if (copyLink) {
      anchor.dataset.tooltip = LABELS.COPIED;

      anchor.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(`${anchor.href}`);
          anchor.classList.add(CLASSES.tooltipShow);

          setTimeout(() => {
            anchor.classList.remove(CLASSES.tooltipShow);
          }, 1000);
        } catch (err) {
          /* eslint-disable-next-line no-console */
          console.error('Failed to copy: ', err);
        }
      });
      anchor.classList.add(...CLASSES.tooltipTop);
    }
  });
};

export default async function decorate(block) {
  const isMagazineTemplate = document.querySelector('body').classList.contains('v2-magazine');
  if (isMagazineTemplate) {
    buildTemplateBlock(block);
  } else {
    buildDefaultBlock(block);
  }

  unwrapDivs(block);
}
