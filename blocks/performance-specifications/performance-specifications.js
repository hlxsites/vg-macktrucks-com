import { readBlockConfig } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {

  [...block.children].forEach((row) => {
    row.classList.add('tab');
    row.setAttribute('role', 'tab');
    row.setAttribute('aria-selected', 'false');
    row.setAttribute('aria-controls', 'panel-1');
    row.setAttribute('id', 'tab-1');
    row.setAttribute('tabindex', '0');

    row.children[0].classList.add('name');
    row.children[1].classList.add('description');
  });
  const tabs = document.createElement('div');
  tabs.classList.add('tabs');
  tabs.setAttribute('role', 'tablist');
  tabs.append(...block.children);
  block.append(tabs);
}

export function addPerformanceData(element) {
  const block = element.closest('.performance-specifications-container').querySelector('.performance-specifications');
  block.append(element);
}
