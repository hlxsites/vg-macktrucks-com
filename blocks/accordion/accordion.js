import { createElement } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  const accordions = rows.map((row) => {
    const accordionHeader = row.querySelector(
      ':scope > div > h1, :scope > div > h2, :scope > div > h3, :scope > div > h4, :scope > div > h5, :scope > div > h6',
    );
    const accordionContent = row.querySelector(
      ':scope > div:nth-child(2)',
    );

    const headerButton = createElement('button', 'accordion-header-button');
    const headerEl = createElement('h2', 'accordion-header');
    const plusEl = createElement('div', 'accordion-close');
    headerEl.innerHTML = accordionHeader.innerHTML;
    headerButton.append(headerEl, plusEl);

    const contentEl = createElement('div', ['accordion-content', 'accordion-content-close']);
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
  accordions.forEach((acc) => block.append(acc));
}
