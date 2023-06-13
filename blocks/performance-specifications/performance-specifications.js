import { div, li, p, ul, } from '../../scripts/scripts.js';

function getCategoryKey(el) {
  return el.textContent.replaceAll('®', '')
    .toLowerCase()
    .trim();
}

let tabId = 0;
function addTab(tabHeader, tabPanel, tabList, tabsContents) {
  tabId += 1;
  tabHeader.setAttribute('role', 'tab');
  tabHeader.setAttribute('aria-selected', 'false');
  tabHeader.setAttribute('aria-controls', `panel-${tabId}`);
  tabHeader.setAttribute('id', `tab-${tabId}`);
  // tabHeader.setAttribute('tabindex', '0'); // TODO: fix tabindex
  tabList.append(tabHeader);

  tabPanel.setAttribute('id', `panel-${tabId}`);
  tabPanel.setAttribute('role', 'tabpanel');
  // tabPanel.setAttribute( 'tabindex', : index); // TODO: fix tabindex
  tabPanel.setAttribute('aria-labelledby', `tab-${tabId}`);
  tabsContents.append(tabPanel);
}

export default async function decorate(block) {
  const rawCategories = [...block.children];

  const tabList = div({ class: 'tabs', role: 'tablist' });
  block.append(tabList);
  const tabsContents = div({ class: 'tabs-content' });
  block.append(tabsContents);

  rawCategories.forEach((tabHeader) => {
    tabHeader.classList.add('tab');
    tabHeader.children[0].classList.add('name');
    tabHeader.children[1].classList.add('description');
    tabHeader.dataset.category = getCategoryKey(tabHeader.children[0]);

    const panel = div({ 'data-category-id': tabHeader.dataset.category, class: 'tab-panel' },
      p({ class: 'engine-tab-header' }, 'Engine Ratings'),
      ul({ class: 'engine-tabs tabs', role: 'tablist', ariaLabel: 'Engine Ratings' }),
      div({ class: 'engine-tabs-content tabs-content' }),
    );
    // TODO: auto-select first tab
    // if (index !== 0) tabContent.setAttribute('hidden', '');
    tabsContents.append(panel);

    tabList.append(tabHeader);

    addTab(tabHeader, panel, tabList, tabsContents);
  });

  // // prepare tab panels to be filled later
  // const modelKey = [...tabList.querySelectorAll('.name')].map((el) => getCategoryKey(el));
  // modelKey.forEach((name, index) => {
  // });
}

export function addPerformanceData(element) {
  // TOOD: add panels as children of the tabs.
  const block = element.closest('.performance-specifications-container').querySelector('.performance-specifications');

  const categoryKey = [...element.classList].find((c) => c !== 'performance-data' && !c.toLowerCase().endsWith('-hp') && c !== 'block');
  const horsepower = [...element.classList].find((c) => c.toLowerCase().endsWith('-hp'));

  // element.setAttribute('role', 'tabpanel');
  // element.setAttribute('tabindex', tabsContent.children.length);
  // element.setAttribute('aria-labelledby', `tab-${categoryKey}-${horsepower}`);
  // if (tabsContent.querySelectorAll('.performance-data').length !== 0) element.setAttribute('hidden', '');
  // categoryPanel.append(element);
  // add entry to tab list
  // const verticalTabs = categoryPanel.querySelector('.vertical-tabs');
  const header = li({
    // role: 'tab',
    // ariaSelected: verticalTabs.children.length === 0,
    // ariaControls: `panel-${categoryKey}-${horsepower}`,
    // id: `tab-${categoryKey}-${horsepower}`,
    // tabindex: verticalTabs.children.length,
  }, horsepower);

  const enginePanel = div(element);

  const categoryPanel = block.querySelector(`.tab-panel[data-category-id="${categoryKey}"]`);
  const tabs = categoryPanel.querySelector('.tabs');
  const panels = categoryPanel.querySelector('.tabs-content');
  addTab(header, enginePanel, tabs, panels);
  // setupTabs(block);
}

function setupTabs(block) {
  const tabs = block.querySelectorAll('[role="tab"]');
  const tabList = block.querySelector('[role="tablist"]');

  // Add a click event handler to each tab
  tabs.forEach((tab) => {
    tab.addEventListener('click', changeTabs);
  });

  // Enable arrow navigation between tabs in the tab list
  let tabFocus = 0;

  tabList.addEventListener('keydown', (e) => {
    // Move right
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      tabs[tabFocus].setAttribute('tabindex', -1);
      if (e.key === 'ArrowRight') {
        // eslint-disable-next-line no-plusplus
        tabFocus++;
        // If we're at the end, go to the start
        if (tabFocus >= tabs.length) {
          tabFocus = 0;
        }
        // Move left
      } else if (e.key === 'ArrowLeft') {
        // eslint-disable-next-line no-plusplus
        tabFocus--;
        // If we're at the start, move to the end
        if (tabFocus < 0) {
          tabFocus = tabs.length - 1;
        }
      }

      tabs[tabFocus].setAttribute('tabindex', 0);
      tabs[tabFocus].focus();
    }
  });
}

function changeTabs(e) {
  const { target } = e;
  const parent = target.parentNode;
  const grandparent = parent.parentNode;

  // Remove all current selected tabs
  parent
    .querySelectorAll('[aria-selected="true"]')
    .forEach((t) => t.setAttribute('aria-selected', false));

  // Set this tab as selected
  target.setAttribute('aria-selected', true);

  // Hide all tab panels
  grandparent
    .querySelectorAll('[role="tabpanel"]')
    .forEach((childEl) => childEl.setAttribute('hidden', true));

  // Show the selected panel
  grandparent.parentNode
    .querySelector(`#${target.getAttribute('aria-controls')}`)
    .removeAttribute('hidden');
}
