import {
  button,
  div, p, ul,
} from '../../scripts/scripts.js';

function getCategoryKey(el) {
  return el.textContent.replaceAll('®', '')
    .toLowerCase()
    .trim();
}

let tabId = 0;
function addTab(tabHeader, tabPanel, tabList, tabsContents) {
  tabId += 1;
  const isFirstTab = tabList.children.length === 0;
  tabHeader.setAttribute('role', 'tab');
  tabHeader.setAttribute('aria-selected', isFirstTab);
  tabHeader.setAttribute('aria-controls', `panel-${tabId}`);
  tabHeader.setAttribute('id', `tab-${tabId}`);
  tabHeader.setAttribute('tabindex', '0'); // TODO: fix tabindex
  tabList.append(tabHeader);

  tabPanel.setAttribute('id', `panel-${tabId}`);
  tabPanel.setAttribute('role', 'tabpanel');
  tabPanel.setAttribute('tabindex', '0'); // TODO: fix tabindex
  tabPanel.setAttribute('aria-labelledby', `tab-${tabId}`);
  if (!isFirstTab) {
    tabPanel.setAttribute('hidden', '');
  }

  tabsContents.append(tabPanel);

  tabHeader.addEventListener('click', changeTabs);
}

export default async function decorate(block) {
  const rawCategories = [...block.children];

  const tabList = div({ role: 'tablist' });
  block.append(tabList);
  handleKeyboardNavigation(tabList);
  const tabsContents = div({ class: 'tab-panels' });
  block.append(tabsContents);

  rawCategories.forEach((rawTabHeader) => {
    const tabHeaderButton = button();
    tabHeaderButton.append(...rawTabHeader.children);
    tabHeaderButton.classList.add('tab');
    tabHeaderButton.children[0].classList.add('name');
    tabHeaderButton.children[1].classList.add('description');
    const categoryKey = getCategoryKey(tabHeaderButton.children[0]);
    tabHeaderButton.dataset.category = categoryKey;

    const engineTablist = ul({ class: 'engine-tablist ', role: 'tablist', ariaLabel: 'Engine Ratings' });
    handleKeyboardNavigation(engineTablist);
    const panel = div(
      { 'data-category-id': categoryKey, class: 'tab-panels' },
      p({ class: 'engine-tab-header' }, 'Engine Ratings'),
      engineTablist,
      div({ class: 'engine-tab-panels tab-panels' }),
    );

    addTab(tabHeaderButton, panel, tabList, tabsContents);
  });
}

export function addPerformanceData(enginePanel) {
  // TOOD: add panels as children of the tabs.
  const block = enginePanel.closest('.performance-specifications-container').querySelector('.performance-specifications');

  const categoryKey = [...enginePanel.classList].find((c) => c !== 'performance-data' && !c.toLowerCase().endsWith('-hp') && c !== 'block');
  const horsepower = [...enginePanel.classList].find((c) => c.toLowerCase().endsWith('-hp'));

  const header = button(horsepower.replace('-', ' ').toUpperCase());

  enginePanel.dataset.category = categoryKey;
  enginePanel.dataset.engine = horsepower;

  // find parent tab panel and add the engine panel to it
  const categoryPanel = block.querySelector(`.tab-panels[data-category-id="${categoryKey}"]`);
  const tabs = categoryPanel.querySelector('[role="tablist"]');
  const panels = categoryPanel.querySelector('.tab-panels');
  addTab(header, enginePanel, tabs, panels);
}

function handleKeyboardNavigation(tabList) {
  tabList.addEventListener('keydown', (e) => {
    const tabs = [...tabList.children];
    let tabFocus = tabs.indexOf(e.target);

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
  const tabHeader = target.closest('[role="tab"]');
  const tabList = target.closest('[role="tablist"]');
  const grandparent = tabList.parentElement;
  const tabPanels = grandparent.querySelector('.tab-panels');

  // Remove all current selected tabs
  tabList
    .querySelectorAll('[aria-selected="true"]')
    .forEach((tab) => tab.setAttribute('aria-selected', false));

  // Set this tab as selected
  tabHeader.setAttribute('aria-selected', true);

  // Hide all tab panels
  tabPanels
    .querySelectorAll(':scope > [role="tabpanel"]')
    .forEach((panel) => panel.setAttribute('hidden', ''));

  // Show the selected panel
  document.getElementById(tabHeader.getAttribute('aria-controls'))
    .removeAttribute('hidden');
}
