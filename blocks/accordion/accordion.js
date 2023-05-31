import { createElement } from '../../scripts/scripts.js';
import fragmentBlock from '../fragment/fragment.js';

/* Function checks if the content of the provied element is just a link to other doc */
function isContentLink(el) {
  // The assumpions:
  // 1. The content is just plain text - no HTML inside
  // 2. The link starts from '/' and doesn't contain any white space character
  return el.innerHTML === el.textContent && /^\/(\S+)$/g.test(el.innerHTML);
}

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const accordionsPromises = rows.map(async (row) => {
    const accordionHeader = row.querySelector(
      ':scope > div > h1, :scope > div > h2, :scope > div > h3, :scope > div > h4, :scope > div > h5, :scope > div > h6',
    );
    const accordionContent = row.querySelector(
      ':scope > div:nth-child(2)',
    );

    const headerButton = createElement('button', 'accordion-header-button');
    const headerEl = createElement('h2', 'accordion-header');
    const plusEl = createElement('div', 'accordion-close');
    headerEl.innerHTML = accordionHeader?.innerHTML;
    headerButton.append(headerEl, plusEl);

    const contentEl = createElement('div', ['accordion-content', 'accordion-content-close']);

    if (isContentLink(accordionContent)) {
      await fragmentBlock(accordionContent);
    }

    contentEl.innerHTML = accordionContent.innerHTML;

    const accordionEl = createElement('div', ['accordion-item', 'accordion-item-close']);
    accordionEl.append(headerButton);
    accordionEl.append(contentEl);

    headerButton.addEventListener('click', () => {
      accordionEl.classList.toggle('accordion-item-close');
    });

    return accordionEl;
  });

  block.innerHTML = '';
  await Promise.allSettled(accordionsPromises);
  accordionsPromises.forEach(async (acc) => {
    const result = await acc;
    block.append(result);
  });
}
