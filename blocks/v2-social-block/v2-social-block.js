import {
  getTextLabel,
  unwrapDivs,
  createElement,
  decorateIcons,
} from '../../scripts/common.js';

const blockName = 'v2-social-block';

const buildTemplateBlock = (block) => {
  const shareURLs = [
    ['twitter', 'https://twitter.com/intent/tweet?url='],
    ['linkedin', 'https://www.linkedin.com/cws/share?url='],
    ['fb', 'https://www.facebook.com/sharer/sharer.php?u='],
  ];
  const fragment = document.createDocumentFragment();

  shareURLs.forEach((link) => {
    const linkElement = createElement('li');
    linkElement.innerHTML = `
      <a class='${blockName}__button'>
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
  shareLinkList.classList.add(`${blockName}__list`);

  shareLinkList.appendChild(fragment);

  const isFirstOrLast = document.querySelectorAll(`.${blockName}__list`).length === 0;

  const socialWrapper = createElement('div');
  socialWrapper.classList.add(`${blockName}__list-wrapper`);

  socialWrapper.appendChild(shareLinkList);

  block.classList.add(isFirstOrLast ? 'first' : 'last');
  block.appendChild(socialWrapper);
};

const buildDefaultBlock = (block) => {
  const headings = block.querySelectorAll('h1, h2, h3, h4, h5, h6');
  [...headings].forEach((heading) => heading.classList.add(`${blockName}__title`));

  const socialWrapper = block.querySelector(':scope > div');
  socialWrapper.classList.add(`${blockName}__list-wrapper`);

  const list = socialWrapper.querySelector('ul');
  // let copyAnchor;

  list.classList.add(`${blockName}__list`);
  list.classList.remove('cta-list');

  [...list.children].forEach((item) => {
    const anchor = item.querySelector('a');
    if (anchor) {
      anchor.className = `${blockName}__button`;
    }

    const copyLink = item.querySelector('.icon-link');
    if (copyLink) {
      // copyAnchor = anchor;
      anchor.dataset.tooltip = getTextLabel('tooltip copied text');

      anchor.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(`${anchor.href}`);
          anchor.classList.add('show');

          setTimeout(() => {
            anchor.classList.remove('show');
          }, 1000);
        } catch (err) {
          /* eslint-disable-next-line no-console */
          console.error('Failed to copy: ', err);
        }
      });
      anchor.classList.add('tooltip', 'tooltip--top');
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
