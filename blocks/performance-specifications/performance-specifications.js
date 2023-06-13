import { readBlockConfig } from '../../scripts/lib-franklin.js';
import { div } from '../performance-data/performance-data.js';

function getModelKey(el) {
  return el.textContent.replaceAll('®', '')
    .toLowerCase()
    .trim();
}

export default async function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('tab');
    row.children[0].classList.add('name');
    row.children[1].classList.add('description');
    const modelKey = getModelKey(row.children[0]);

    row.setAttribute('role', 'tab');
    row.setAttribute('aria-selected', 'false');
    row.setAttribute('aria-controls', `panel-${modelKey}`);
    row.setAttribute('id', `tab-${modelKey}`);
    row.setAttribute('tabindex', '0');
  });
  const tabList = document.createElement('div');
  tabList.classList.add('tabs');
  tabList.setAttribute('role', 'tablist');
  tabList.append(...block.children);
  block.append(tabList);

  // prepare tab panels to be filled later
  [...tabList.querySelectorAll('.name')].map((el) => getModelKey(el)).forEach((name, index) => {
    const panel = div({
      id: `panel-${name}`,
      role: 'tabpanel',
      tabindex: index,
      'aria-labelledby': 'tab-1',
    });
    block.append(panel);
  });
}

export function addPerformanceData(element) {
  const block = element.closest('.performance-specifications-container').querySelector('.performance-specifications');
  const modelKey = [...element.classList].find((c) => c !== 'performance-data' && !c.endsWith('HP'));
  const panel = block.querySelector(`#panel-${modelKey}`);
  panel.append(element);
}
